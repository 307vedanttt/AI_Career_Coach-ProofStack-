# ProofStack — Evidence-Driven AI Career Coach

ProofStack helps developers compare the skills requested in a real job description with evidence found in their GitHub repositories. Instead of ranking people or making hiring decisions, it makes the available code evidence inspectable and recommends concrete, verifiable next steps.

> **Core principle:** ProofStack reports what its analysis can demonstrate from the connected repositories—not a verdict on a person's overall ability.

---

## Table of Contents

- [Why ProofStack?](#why-proofstack)
- [How It Works](#how-it-works)
- [Key Features](#key-features)
- [Evidence and Status Labels](#evidence-and-status-labels)
- [Commit Contracts](#commit-contracts)
- [Product Principles](#product-principles)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [Running Automated Tests](#running-automated-tests)
- [Core API Endpoints](#core-api-endpoints)
- [Docker Deployment](#docker-deployment)
- [Security Architecture](#security-architecture)
- [Limitations](#limitations)
- [Roadmap Ideas](#roadmap-ideas)
- [Contributing](#contributing)

---

## Why ProofStack?

A résumé can say that a developer knows React, Node.js, databases, or testing, but it is difficult to quickly inspect the project evidence behind those claims. ProofStack creates a transparent path from job requirements to repository evidence and actionable improvement work.

It is designed to help developers:

- Understand which job requirements have supporting evidence in the repositories they selected.
- Inspect the exact files, lines, and commits behind an evidence signal when available.
- See where evidence is limited, unclear, or outside the current detector coverage.
- Turn an evidence gap into a small, testable engineering task.
- Reassess the project after making changes, where the configured backend supports reassessment.

---

## How It Works

1. **Add a job posting** — paste a job description or provide a supported job-posting URL.
2. **Review extracted requirements** — inspect the requirements and their source text; edit the extraction if the interface supports it.
3. **Connect GitHub repositories** — grant access only to the repositories you want analyzed.
4. **Run the analysis** — the backend discovers relevant files, runs available deterministic detectors, applies evidence guards, and verifies candidate signals where supported.
5. **Explore the Proof Map** — inspect the relationship between job requirements and repository evidence.
6. **Review coverage and uncertainty** — distinguish supported evidence from limited, unclear, or out-of-scope results.
7. **Review a Commit Contract** — get a suggested, bounded engineering task with acceptance checks and constraints.
8. **Make the change in your normal workflow** — implement, test, and commit the work in your own development environment.
9. **Reassess when supported** — run the analysis again to see whether the new repository state changes the available evidence or contract status.

---

## Key Features

### Job Requirement Extraction
Extracts skill and requirement statements from a job description and keeps the source wording available for review. Verbatim supporting quotes are strictly validated against the retrieved text.

### Proof Map
A visual view connecting job requirements with evidence discovered in selected repositories. It helps users navigate from a requirement to the code signals supporting the current assessment.

### Evidence Explorer
Evidence details include:
- Requirement and repository
- Commit SHA
- File path and line range
- Code excerpt and GitHub permalink
- Detector name and version
- Signal type and verification outcome
- Reachability status via AST call graphs
- Verification reason or counter-evidence note

### Evidence Coverage
Summarizes the scope of evidence detected for the selected job and repositories using defined heuristic weights:
$$\text{Evidence Coverage} = \frac{\sum (\text{weight} \times \text{credit})}{\sum \text{weight}}$$
Coverage is about what was observed in the selected code—not a measurement of the developer's complete skill set.

### Hollow-Evidence Guards
Prevents weak signals—such as README keyword stuffing, unused dependencies, empty files, or trivial assertions (`assert True`)—from being counted as valid evidence.

### Commit Contract Recommendations
Turns a specific evidence gap into a bounded task with acceptance checks, constraints, base commit SHA, and negative invariant predictions.

---

## Evidence and Status Labels

Use explicit labels and explanatory text rather than relying on color alone:

- **Demonstrated (strong)** — two or more independent surviving signal types support the requirement within the analyzed scope.
- **Demonstrated (basic)** — one surviving signal type or generic language detector fallback.
- **Not demonstrated in this scope** — the configured analysis did not find sufficient evidence in the selected repositories.
- **Unclear** — conflicting signals, unsupported ecosystems, or non-code-assessable requirements.

---

## Commit Contracts

A Commit Contract is a recommendation, not a guaranteed solution or an automatic judgment of ability:
- Current and predicted evidence state
- Acceptance checks that can be verified
- Skills or behaviors that must not regress
- Base commit SHA
- Estimated effort class (`small`, `medium`, `large`)
- Adjudication status: `Pending`, `Fulfilled`, `Partly fulfilled`, `Not fulfilled`

---

## Product Principles

1. **Evidence, not people-ranking:** ProofStack does not rank candidates or issue hiring/ability verdicts.
2. **Scope transparency:** results describe selected repositories and supported detectors only.
3. **Traceability:** evidence links to the relevant source code, commit SHA, and file line ranges.
4. **Honest uncertainty:** distinguish missing evidence from evidence that a skill is absent.
5. **No fabricated progress:** show only stages and metrics reported by the running system; label demo data clearly.
6. **Accessible status design:** status meaning must be communicated with text and icons, not color alone.

---

## Architecture Overview

```text
Job posting (URL / Pasted Text)
    ↓
Requirement extraction & Verbatim Quote Verification
    ↓
Repository selection & Bounded File Discovery (GitHub REST API)
    ↓
Deterministic Code Detectors (API, SQL, Testing, CI/CD)
    ↓
Evidence Guards & AST Reachability Analysis
    ↓
Pure Deterministic Assessment Engine & Coverage Sensitivity
    ↓
Proof Map + Evidence Explorer
    ↓
Commit Contract Generation & Real-Time SSE Stream
    ↓
Developer implements changes & Push triggers Reassessment
```

---

## Tech Stack

- **Runtime & API**: Python 3.11+, FastAPI, Uvicorn
- **Validation**: Pydantic v2
- **Persistence**: SQLAlchemy 2.0 with SQLite in WAL mode (`aiosqlite`)
- **HTTP Client**: `httpx` (async outbound requests)
- **Static Analysis**: Python standard `ast` module
- **Testing**: `pytest`, `pytest-asyncio`
- **Frontend**: Responsive modern dark-mode dashboard (served directly at `http://localhost:8000/`)

---

## Getting Started & Local Setup

### 1. Prerequisites
- Python 3.11 or higher
- Git

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Omb2121/AI-CarrerCoach.git
cd AI-CarrerCoach

# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*Deterministic mode operates out of the box with default settings; no LLM API key required.*

### 4. Start the Application
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser for the dashboard, or **[http://localhost:8000/docs](http://localhost:8000/docs)** for interactive OpenAPI documentation.

---

## Running Automated Tests

Run the full pytest suite:
```bash
pytest -v
```
All 26 automated unit and integration tests verify:
- SSRF defense against private IPs, AWS/GCP metadata, and scheme abuse.
- Webhook signature HMAC-SHA256 verification and replay delivery deduplication.
- AST call-graph reachability and hollow-evidence rejection.
- All deterministic assessment state transitions.
- Coverage arithmetic and sensitivity bounds.
- Commit Contract generation and adjudication.
- REST API integration and SSE streaming.

---

## Core API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service status, database WAL check, and engine mode |
| `POST` | `/api/jobs` | Submit job posting URL or pasted description |
| `PATCH` | `/api/requirements/{id}` | Edit, reinterpret, or adjust importance |
| `POST` | `/api/repos` | Connect GitHub repository URL |
| `POST` | `/api/analyze` | Start baseline evidence assessment pipeline |
| `POST` | `/api/check-now` | Manually trigger assessment pipeline |
| `GET` | `/api/assessments` | Retrieve status, surviving evidence, and rejections |
| `GET` | `/api/coverage/{job_id}` | Retrieve Evidence Coverage and sensitivity bounds |
| `GET` | `/api/proofmap/{job_id}` | Retrieve file map, entry points, and skill signals |
| `POST` | `/webhooks/github` | Authenticated GitHub push event listener |
| `GET` | `/api/events/stream` | Real-time Server-Sent Events (SSE) progress stream |
| `GET` | `/api/trace/{run_id}` | Detailed execution steps, tools, and timings |
| `GET` | `/api/contracts` | List Commit Contracts |
| `POST` | `/api/contracts` | Propose next commit contract |
| `POST` | `/api/dry-run` | Test hypothetical changes without mutating repo |
| `POST` | `/api/corrections` | Submit candidate evidence correction |

---

## Docker Deployment

To build and run with Docker Compose:
```bash
docker-compose up --build -d
```
The service will be live on `http://localhost:8000` with active container healthchecks.

---

## Security Architecture

- **SSRF Defense**: Strict validation of DNS-resolved IP addresses; blocks loopback (`127.0.0.0/8`, `::1`), private CIDRs (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `fc00::/7`), link-local, multicast, and cloud metadata services (`169.254.169.254`, `metadata.google.internal`). Re-validates every redirect hop.
- **Webhook Integrity**: Verifies `X-Hub-Signature-256` using constant-time HMAC-SHA256 comparison. Deduplicates delivery IDs.
- **Read-Only Scope**: Analyzes repositories via read-only GitHub REST API; never clones, installs, executes, or mutates client repositories.
- **Secret Redaction**: Redacts GitHub tokens (`ghp_*`) and API keys (`sk-*`) from application logs.

---

## Limitations

- Repository analysis cannot establish a person's complete skill set or professional ability.
- A lack of detected evidence is not proof that a skill is absent.
- Full AST intra-package call-graph analysis is implemented for Python. JavaScript/TypeScript uses an import-graph heuristic; other languages report reachability as `unclear`.
- Files exceeding 2 MB are skipped from deep static inspection to protect server resources.

---

## Contributing

Contributions are welcome. Please ensure new evidence claims are traceable and all automated tests pass before submitting pull requests.
