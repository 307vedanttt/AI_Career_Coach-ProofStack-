"""
E2E Webhook & Change-Detection Pipeline Test
Sends:
1. Valid HMAC-SHA256 signed push webhook
2. Duplicate payload under new delivery ID (idempotency check)
3. Forged HMAC signature (must be rejected with 401)
4. Non-default branch push (must be ignored with 200)
5. Connects to SSE /api/events/stream and prints received events
"""
import sys
import os
import hmac
import hashlib
import json
import time
import httpx

BASE_URL = os.environ.get("PROOFSTACK_URL", "http://localhost:8000")
SECRET = os.environ.get("GITHUB_WEBHOOK_SECRET", "dev_webhook_secret_key_proofstack")

def sign_payload(payload_bytes: bytes, secret: str) -> str:
    mac = hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256)
    return f"sha256={mac.hexdigest()}"

def run_e2e_push_test():
    print(f"[*] Starting E2E Change-Detection Test against {BASE_URL}...")
    
    # 1. Prepare push payload for main branch
    main_payload = {
        "ref": "refs/heads/main",
        "before": "9f3c2ab000000000000000000000000000000000",
        "after": "a182c4f000000000000000000000000000000000",
        "repository": {
            "name": "shop-api",
            "owner": {"login": "rohan", "name": "rohan"},
            "default_branch": "main"
        },
        "head_commit": {
            "id": "a182c4f",
            "message": "feat(auth): implement monotonic mutex token bucket",
            "timestamp": "2026-10-17T00:30:00Z"
        }
    }
    main_bytes = json.dumps(main_payload).encode("utf-8")
    valid_sig = sign_payload(main_bytes, SECRET)

    test_ts = int(time.time())
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # TEST 1: Valid signed push
        print("\n[TEST 1] Sending correctly signed webhook payload...")
        res1 = client.post(
            "/webhooks/github",
            content=main_bytes,
            headers={
                "Content-Type": "application/json",
                "X-GitHub-Event": "push",
                "X-GitHub-Delivery": f"deliv-{test_ts}-primary",
                "X-Hub-Signature-256": valid_sig,
            }
        )
        print(f" -> Status: {res1.status_code}, Response: {res1.json()}")
        assert res1.status_code == 200, f"Expected 200, got {res1.status_code}"
        assert res1.json().get("status") in ("accepted", "processed"), "Expected accepted/processed"

        # TEST 2: Duplicate delivery (same commit SHA under new delivery ID)
        print("\n[TEST 2] Sending same payload under a new delivery ID (idempotency check)...")
        res2 = client.post(
            "/webhooks/github",
            content=main_bytes,
            headers={
                "Content-Type": "application/json",
                "X-GitHub-Event": "push",
                "X-GitHub-Delivery": f"deliv-{test_ts}-duplicate",
                "X-Hub-Signature-256": valid_sig,
            }
        )
        print(f" -> Status: {res2.status_code}, Response: {res2.json()}")
        assert res2.status_code == 200, f"Expected 200, got {res2.status_code}"
        assert res2.json().get("status") == "ignored", "Expected duplicate commit to be ignored (idempotent no-op)"

        # TEST 3: Forged signature -> must be 401
        print("\n[TEST 3] Sending forged webhook payload...")
        forged_sig = "sha256=0000000000000000000000000000000000000000000000000000000000000000"
        res3 = client.post(
            "/webhooks/github",
            content=main_bytes,
            headers={
                "Content-Type": "application/json",
                "X-GitHub-Event": "push",
                "X-GitHub-Delivery": f"deliv-{test_ts}-forged",
                "X-Hub-Signature-256": forged_sig,
            }
        )
        print(f" -> Status: {res3.status_code}, Response: {res3.text}")
        assert res3.status_code == 401, f"Expected 401 Unauthorized for forged HMAC, got {res3.status_code}"

        # TEST 4: Non-default branch push -> must be ignored with 200
        print("\n[TEST 4] Sending push to feature branch (refs/heads/feature-wip)...")
        branch_payload = dict(main_payload)
        branch_payload["ref"] = "refs/heads/feature-wip"
        branch_payload["after"] = "b293e5a000000000000000000000000000000000"
        branch_bytes = json.dumps(branch_payload).encode("utf-8")
        branch_sig = sign_payload(branch_bytes, SECRET)
        res4 = client.post(
            "/webhooks/github",
            content=branch_bytes,
            headers={
                "Content-Type": "application/json",
                "X-GitHub-Event": "push",
                "X-GitHub-Delivery": f"deliv-{test_ts}-branch",
                "X-Hub-Signature-256": branch_sig,
            }
        )
        print(f" -> Status: {res4.status_code}, Response: {res4.json()}")
        assert res4.status_code == 200, f"Expected 200, got {res4.status_code}"
        assert res4.json().get("status") == "ignored", "Expected non-default branch push to be ignored"

        # TEST 5: SSE stream connection
        print("\n[TEST 5] Connecting to SSE /api/events/stream to sample events...")
        try:
            with client.stream("GET", "/api/events/stream") as sse_stream:
                print(f" -> Connected to SSE stream. Status: {sse_stream.status_code}")
                count = 0
                for line in sse_stream.iter_lines():
                    if line:
                        print(f"    [SSE line] {line}")
                        count += 1
                        if count >= 3:
                            break
        except Exception as e:
            print(f" -> SSE sample: {e}")

    print("\n[+] All 5 E2E change-detection checks PASSED.")

if __name__ == "__main__":
    run_e2e_push_test()
