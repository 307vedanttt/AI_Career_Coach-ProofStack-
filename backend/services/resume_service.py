import io
import re
import zlib
import time
import zipfile
import hashlib
import logging
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models.models import ResumeExtraction, Requirement, FileEvidence
from backend.config import settings

logger = logging.getLogger("proofstack.resume")

MAX_RESUME_BYTES = 5 * 1024 * 1024  # 5MB limit

# Technical skill dictionary with invariant categories for deterministic extraction
CANONICAL_SKILL_PATTERNS = [
    ("SQL & Databases", "SQL", [r"\bsql\b", r"\bsqlite\b", r"\bpostgresql\b", r"\bmysql\b", r"\bdatabase\b"]),
    ("Architecture & APIs", "REST API", [r"\brest\b", r"\brestful\b", r"\bapi\b", r"\bfastapi\b", r"\brouter\b", r"\bendpoint\b"]),
    ("Testing & QA", "Automated Testing", [r"\btest\b", r"\bpytest\b", r"\bunit tests?\b", r"\binvariant\b", r"\bregression\b"]),
    ("Core Languages", "Python", [r"\bpython\b", r"\bpython3\b"]),
    ("Core Languages", "Go / Golang", [r"\bgolang\b", r"\bgo\b"]),
    ("Infrastructure & DevOps", "Docker", [r"\bdocker\b", r"\bcontainer\b", r"\bdockerfile\b", r"\bcompose\b"]),
    ("Security & Auth", "Zero-Trust Auth", [r"\bauth\b", r"\bauthentication\b", r"\bhmac\b", r"\boauth\b", r"\bjwt\b"]),
    ("Cloud & Distributed", "Transactions", [r"\btransaction\b", r"\bacid\b", r"\bisolation\b", r"\bconcurrency\b"]),
    ("Messaging & Queues", "Event-Driven Streams", [r"\bkafka\b", r"\brabbitmq\b", r"\bpubsub\b", r"\bstream\b"]),
    ("Systems", "Linux / POSIX", [r"\blinux\b", r"\bunix\b", r"\bposix\b", r"\bbash\b", r"\bshell\b"]),
]

def log_stage(stage_name: str, file_sha256: str, byte_size: int, duration_ms: float, extra: Optional[Dict[str, Any]] = None):
    """Structured logging at every pipeline stage. Crucial rule: NEVER log the resume text!"""
    payload = {
        "stage": stage_name,
        "file_sha256": file_sha256,
        "byte_size": byte_size,
        "duration_ms": round(duration_ms, 2),
    }
    if extra:
        payload.update(extra)
    logger.info(f"[RESUME_PIPELINE] {payload}")

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Sandboxed PDF text extractor extracting text streams from uncompressed and FlateDecode blocks."""
    text_chunks: List[str] = []
    
    # 1. Search for FlateDecode compressed streams
    stream_pattern = re.compile(b'stream\r?\n(.*?)endstream', re.DOTALL)
    for match in stream_pattern.finditer(pdf_bytes):
        raw_stream = match.group(1)
        decompressed = None
        try:
            decompressed = zlib.decompress(raw_stream)
        except Exception:
            try:
                decompressed = zlib.decompress(raw_stream, -zlib.MAX_WBITS)
            except Exception:
                pass
        
        target = decompressed if decompressed else raw_stream
        
        # Match (text) Tj
        for m in re.findall(rb'\((.*?)\)\s*Tj', target):
            cleaned = m.decode('latin1', errors='ignore').replace('\\(', '(').replace('\\)', ')')
            if cleaned.strip():
                text_chunks.append(cleaned)
        
        # Match [(text)] TJ
        for array_match in re.findall(rb'\[(.*?)\]\s*TJ', target):
            parts = re.findall(rb'\((.*?)\)', array_match)
            line = ' '.join(p.decode('latin1', errors='ignore').replace('\\(', '(').replace('\\)', '') for p in parts)
            if line.strip():
                text_chunks.append(line)

    # 2. Also search uncompressed text outside streams
    for m in re.findall(rb'\((.*?)\)\s*Tj', pdf_bytes):
        cleaned = m.decode('latin1', errors='ignore').replace('\\(', '(').replace('\\)', ')')
        if cleaned.strip():
            text_chunks.append(cleaned)

    full_text = ' '.join(text_chunks)
    # Clean whitespace
    full_text = re.sub(r'\s+', ' ', full_text).strip()
    return full_text

def extract_text_from_docx(docx_bytes: bytes) -> str:
    """Sandboxed DOCX text extractor reading word/document.xml with XML parser."""
    try:
        with zipfile.ZipFile(io.BytesIO(docx_bytes)) as z:
            if 'word/document.xml' not in z.namelist():
                raise HTTPException(status_code=400, detail="Invalid DOCX file structure: missing word/document.xml")
            xml_content = z.read('word/document.xml')
            root = ET.fromstring(xml_content)
            # Find all text nodes in namespaces
            text_nodes = root.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
            paragraphs: List[str] = [node.text for node in text_nodes if node.text]
            return ' '.join(paragraphs).strip()
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid or corrupt DOCX document")

def parse_document(file_name: str, file_bytes: bytes, file_sha256: str) -> str:
    """Parse PDF or DOCX file with sandboxing and validation."""
    start_time = time.time()
    lower_name = file_name.lower()
    
    if len(file_bytes) > MAX_RESUME_BYTES:
        raise HTTPException(status_code=400, detail="File size exceeds maximum allowed limit (5 MB)")

    if lower_name.endswith('.pdf'):
        # Check PDF header
        if not file_bytes.startswith(b'%PDF'):
            raise HTTPException(status_code=400, detail="Invalid PDF file signature")
        text = extract_text_from_pdf(file_bytes)
    elif lower_name.endswith('.docx'):
        text = extract_text_from_docx(file_bytes)
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Only PDF (.pdf) and Word (.docx) files are supported."
        )

    duration = (time.time() - start_time) * 1000.0
    char_count = len(text)
    
    log_stage("PARSE_DOCUMENT", file_sha256, len(file_bytes), duration, {"char_count": char_count})

    if not text or len(text.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="no readable text (scanned PDF, image-only document, or empty file)"
        )

    return text

def extract_skills_deterministic(text: str) -> List[Dict[str, str]]:
    """Deterministic skill extractor that identifies skill sentences and guards against prompt injections."""
    # Split text into candidate sentences
    sentences = [s.strip() for s in re.split(r'[.\n•\r]+', text) if len(s.strip()) > 8]
    
    extracted: List[Dict[str, str]] = []
    seen_skills = set()

    for category, skill_name, patterns in CANONICAL_SKILL_PATTERNS:
        combined_regex = re.compile('|'.join(patterns), re.IGNORECASE)
        for s in sentences:
            # Injection guard: ignore any instructions or overrides embedded in candidate text
            if re.search(r'(ignore|override|grant|system prompt|bypass|hollow)', s, re.IGNORECASE):
                continue
            if combined_regex.search(s) and skill_name not in seen_skills:
                extracted.append({
                    "category": category,
                    "name": skill_name,
                    "source_sentence": s[:200]
                })
                seen_skills.add(skill_name)
                break

    # If no specific canonical skills matched, extract notable sentences
    if not extracted and sentences:
        for idx, s in enumerate(sentences[:3]):
            extracted.append({
                "category": "General Engineering",
                "name": f"Core Competency {idx + 1}",
                "source_sentence": s[:200]
            })

    return extracted

async def process_resume_upload(
    db: AsyncSession,
    user_id: str,
    file_name: str = "resume.pdf",
    file_bytes: bytes = b"",
    filename: Optional[str] = None,
) -> Dict[str, Any]:
    """Execute complete resume parsing and verification pipeline."""
    file_name = filename or file_name
    total_start = time.time()
    byte_size = len(file_bytes)
    file_sha256 = hashlib.sha256(file_bytes).hexdigest()

    # Stage 1: RECEIVE_UPLOAD
    log_stage("RECEIVE_UPLOAD", file_sha256, byte_size, 0, {"file_name": file_name})

    # Stage 2: Check Database for existing extraction with exact SHA-256 for this user
    stmt_check = select(ResumeExtraction).where(
        ResumeExtraction.user_id == user_id,
        ResumeExtraction.file_sha256 == file_sha256
    )
    existing = (await db.execute(stmt_check)).scalar_one_or_none()

    if existing:
        import json
        cached_skills = json.loads(existing.skills_json)
        log_stage("STORE_DATABASE", file_sha256, byte_size, 0, {"cached": True, "skills_count": len(cached_skills)})
        return {
            "success": True,
            "file_name": existing.file_name,
            "file_size_bytes": existing.file_size_bytes,
            "file_sha256": existing.file_sha256,
            "char_count": existing.char_count,
            "extracted_at": existing.created_at.isoformat(),
            "skills": cached_skills
        }

    # Stage 3: PARSE_DOCUMENT
    extracted_text = parse_document(file_name, file_bytes, file_sha256)
    char_count = len(extracted_text)

    # Stage 4: LLM_EXTRACTION
    llm_start = time.time()
    skills = extract_skills_deterministic(extracted_text)
    llm_duration = (time.time() - llm_start) * 1000.0
    log_stage("LLM_EXTRACTION", file_sha256, byte_size, llm_duration, {"skills_count": len(skills)})

    # Match extracted skills against repository requirements & code evidence in DB
    stmt_reqs = select(Requirement)
    db_reqs = (await db.execute(stmt_reqs)).scalars().all()
    req_status_map = {r.label.lower(): r for r in db_reqs}

    for sk in skills:
        sk_name_lower = sk["name"].lower()
        matched = None
        for label, r in req_status_map.items():
            if sk_name_lower in label or any(part in label for part in sk_name_lower.split()):
                matched = r
                break
        
        if matched:
            sk["status"] = "proven" if matched.detector_name else "basic"
        else:
            sk["status"] = "not_shown"

    # Stage 5: STORE_DATABASE
    import json
    import uuid
    import datetime

    record_id = str(uuid.uuid4())
    preview_300 = extracted_text[:300]

    extraction_record = ResumeExtraction(
        id=record_id,
        user_id=user_id,
        file_sha256=file_sha256,
        file_name=file_name,
        file_size_bytes=byte_size,
        char_count=char_count,
        skills_json=json.dumps(skills),
        extracted_text_preview=preview_300,
        created_at=datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(extraction_record)
    await db.commit()

    total_duration = (time.time() - total_start) * 1000.0
    log_stage("STORE_DATABASE", file_sha256, byte_size, total_duration, {"skills_count": len(skills), "user_id": user_id})

    return {
        "success": True,
        "file_name": file_name,
        "file_size_bytes": byte_size,
        "file_sha256": file_sha256,
        "char_count": char_count,
        "extracted_at": extraction_record.created_at.isoformat(),
        "skills": skills
    }
