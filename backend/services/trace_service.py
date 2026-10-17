import asyncio
import datetime
import json
import time
from typing import Dict, List, Any, Optional

def utcnow_str():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

class TraceService:
    def __init__(self):
        # In-memory fast trace cache: run_id -> list of steps
        self._traces: Dict[str, Dict[str, Any]] = {}
        # SSE subscribers: list of asyncio.Queue
        self._subscribers: List[asyncio.Queue] = []

    def start_trace(self, run_id: str, repo_id: Optional[str] = None, job_id: Optional[str] = None) -> None:
        self._traces[run_id] = {
            "run_id": run_id,
            "repo_id": repo_id,
            "job_id": job_id,
            "status": "running",
            "created_at": utcnow_str(),
            "finished_at": None,
            "start_time": time.time(),
            "steps": []
        }

    def record_step(
        self,
        run_id: str,
        step_name: str,
        status: str = "success",
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        trace = self._traces.get(run_id)
        if not trace:
            return

        elapsed_ms = round((time.time() - trace["start_time"]) * 1000.0, 2)
        step_id = len(trace["steps"]) + 1

        step_data = {
            "step_id": step_id,
            "step_name": step_name,
            "timestamp": utcnow_str(),
            "elapsed_ms": elapsed_ms,
            "status": status,
            "details": details or {}
        }
        trace["steps"].append(step_data)

        # Broadcast to SSE subscribers asynchronously
        event_payload = {
            "event": "trace_step",
            "run_id": run_id,
            "step": step_data
        }
        self.broadcast_event("step", event_payload)

    def finish_trace(self, run_id: str, status: str = "completed") -> None:
        trace = self._traces.get(run_id)
        if trace:
            trace["status"] = status
            trace["finished_at"] = utcnow_str()
            self.broadcast_event("trace_finished", {
                "run_id": run_id,
                "status": status,
                "total_steps": len(trace["steps"])
            })

    def get_trace(self, run_id: str) -> Optional[Dict[str, Any]]:
        return self._traces.get(run_id)

    def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue(maxsize=100)
        self._subscribers.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        if q in self._subscribers:
            self._subscribers.remove(q)

    def register_callback(self, cb) -> None:
        if not hasattr(self, "_callbacks"):
            self._callbacks = []
        self._callbacks.append(cb)

    def broadcast_event(self, event_type: str, data: Dict[str, Any]) -> None:
        message = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
        for q in list(self._subscribers):
            try:
                q.put_nowait(message)
            except asyncio.QueueFull:
                # Disconnect slow or stuck subscribers safely
                self._subscribers.remove(q)

        if hasattr(self, "_callbacks"):
            for cb in self._callbacks:
                try:
                    if asyncio.iscoroutinefunction(cb):
                        asyncio.create_task(cb(data))
                    else:
                        cb(data)
                except Exception:
                    pass

trace_service = TraceService()
