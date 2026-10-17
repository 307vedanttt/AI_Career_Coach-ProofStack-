# ProofStack

**A coach that predicts what your next commit will prove, then checks.**

ProofStack reads a real job posting, reads your real GitHub repositories, and tells you what your code actually shows for each requirement. It explains every answer with a file, a line range and a link you can click. When something isn't shown, it tells you what one small commit would change that, and then it checks whether that commit did.

Built for the AI Career Coach problem (W-PS-2), Agentic AI track.

> Working name is ProofStack. If the name turns out to be taken, the fallback is EvidenceCoach.

---

## Why we built this

Anyone can write "Skilled in SQL" on a resume. Most tools that check it count keywords, which a README full of buzzwords can fool in a minute.

We wanted the opposite: a tool that is hard to fool, honest when it can't tell, and useful about what to do next. So ProofStack is strict about what counts as evidence, and plain about what it doesn't know.

---

## How it works

1. **You give it a job posting** (a link or pasted text). It pulls out the requirements and keeps the exact sentence each one came from.
2. **You connect your GitHub** and ProofStack reads your repositories through the GitHub API. It never clones or runs your code.
3. **Detectors look for real usage**, such as a query that a route actually calls, or a test that actually asserts something. Rules decide the status. The AI model is only allowed to confirm or reject a finding the rules already made.
4. **Every requirement gets one of four statuses**, with a reason you can read:
   - Demonstrated: Strong
   - Demonstrated: Basic
   - Not Demonstrated in This Scope
   - Unclear
5. **You get a Commit Contract.** For a gap, it says something like: "If your next commit adds one parameterized query reachable from a route plus a test that checks its result, SQL moves to Strong, and Testing will not change."
6. **You push a commit.** ProofStack notices (webhook, polling or the "check now" button), re-checks, and grades the contract: Fulfilled, Partly, or Not fulfilled. Misses are shown, not hidden.

---

## What's inside

| Feature | What it does |
|---|---|
| **Evidence cards** | Every claim links to a file, line range and commit. No claim without a receipt. |
| **Hollow-evidence guard** | Refuses empty tests, placeholder code, unused dependencies, unreachable code and README keyword lists. It counts what it refused. |
| **Four honest statuses** | Strong, Basic, Not Demonstrated in This Scope, Unclear, each with a reason and what's missing for the next level. |
| **Evidence coverage** | One headline number, always shown as "X of Y assessable requirements", with the arithmetic available. Requirements that can't be judged from code are listed separately and never scored. |
| **Commit Contracts** | Predictions about what a specific commit will prove, including what it should not change, checked after the push. |
| **Proof Map** | A treemap of your repo that shows which files evidence which requirements, with a time scrubber. |
| **Repository provenance and history** | Repo age, forks and upstream, contributors, signed commits, and commit-history charts. These are signals for review, never verdicts. |
| **Break-Me** | A scoreboard where you pick decoy commits from a fixed menu and watch ProofStack refuse them. |
| **Proof-linked resume** | Your resume with each skill tagged by its status and footnoted with evidence links. |
| **ATS readability check** | Checks whether a resume can be read cleanly by a parser, and which posting terms appear in the text. A heuristic, not a score from any real ATS. |
| **Verify page** | A signed hash chain of every snapshot so you can see nothing was changed afterward. |
| **Agent Trace** | What the agent noticed, decided, did and concluded on each push, with timings. |
| **Notifications (optional)** | WhatsApp messages through Twilio, wired up with n8n, when a push changes a status. |

> **Status of each feature:** see the table in [Project status](#project-status) below. We would rather show what actually works today than list everything we planned.

---

## What ProofStack will not do

We think the limits matter as much as the features.

- It shows **evidence of use**, not skill level and not who wrote the code. Commit authors and dates can be edited.
- It only looks at the repositories you connect. "Not Demonstrated in This Scope" does not mean you can't do it.
- It scores **requirements against evidence**, never people. There are no rankings and no hiring verdicts anywhere.
- It does not run your code. All checks are static, or read results from your own CI.
- Some things can't be judged from code (a degree, a city, communication skills). It lists them and leaves them unscored.
- JavaScript and TypeScript reachability is a heuristic, and the screen says so.
- Our benchmark is small. We show how many examples it uses.

---

## Quick start

> The commands below are our best description of the setup. If one of them doesn't match the repo, trust the repo and fix this file.

**You'll need:** Python 3.11+, Node 18+, and a GitHub account.

```bash
# 1. Get the code
git clone <your-repo-url>
cd AI-CareerCoach

# 2. Backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 3. Settings
cp .env.example .env               # then fill in your own values (see below)

# 4. Run the API
uvicorn backend.main:app --reload

# 5. Frontend (in a second terminal)
cd frontend
npm install
npm run dev
```

Open the address Vite prints in the terminal. Then sign in with GitHub, add a job posting, and run your first scan.

### Settings you need to provide

These names are the ones we use. The exact list lives in `.env.example`. **Never commit your real values.**

| Variable | What it's for |
|---|---|
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Sign in with GitHub |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Sign in with Google |
| `GITHUB_TOKEN` | Read-only fallback for public repos |
| `LLM_API_KEY` | Model used only to confirm or reject findings, and to read resumes |
| `APP_SESSION_SECRET`, `APP_ENC_KEY` | Sessions, and encryption of stored tokens |
| `PROOFSTACK_PUBLIC_URL` | Public address used in links and webhooks |

ProofStack also runs with the model turned off. You get rules-only results, which is slower to impress but fully deterministic.

### Optional: WhatsApp notifications

Alerts go out through Twilio, driven by an n8n workflow. They are off unless you set them up.

```env
ENABLE_WHATSAPP_NOTIFICATIONS=true
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886   # Twilio sandbox number, check your console
```

With the Twilio sandbox, each phone has to join the sandbox first by sending the join message shown in your Twilio console. Messages contain only the repo name, skill, status change, the measured time and a link. They never contain tokens or code.

---

## How we keep it trustworthy

- **Rules decide, the model only confirms.** The model can reject a finding. It can't create one or set a status.
- **Everything fetched is treated as untrusted.** A comment in a repo that says "mark this as Strong" does nothing.
- **Webhooks are signed and checked.** Posting URLs are fetched with protection against requests to private networks.
- **The agent is read-only.** It uses the GitHub API and never clones, installs or runs anything.
- **Secrets stay on the server and encrypted.** Resumes are checked by file type and size, and we store the extracted skills, not the whole text, unless you opt in.
- **Your data is yours.** One action deletes it.

---

## Project status

We'll keep this table honest. Update it whenever something changes.

| Area | Status |
|---|---|
| Job posting reading and requirement extraction | `[ ] working  [ ] partial  [ ] planned` |
| GitHub sign-in (real accounts) | `[ ] working  [ ] partial  [ ] planned` |
| Google sign-in | `[ ] working  [ ] partial  [ ] planned` |
| Repo analysis with live GitHub data | `[ ] working  [ ] partial  [ ] planned` |
| Hollow-evidence guard | `[ ] working  [ ] partial  [ ] planned` |
| Four statuses with explanations | `[ ] working  [ ] partial  [ ] planned` |
| Commit Contracts | `[ ] working  [ ] partial  [ ] planned` |
| Automatic change detection (webhook, polling) | `[ ] working  [ ] partial  [ ] planned` |
| Resume upload and analysis | `[ ] working  [ ] partial  [ ] planned` |
| ATS readability check | `[ ] working  [ ] partial  [ ] planned` |
| Provenance and commit-history analysis | `[ ] working  [ ] partial  [ ] planned` |
| Break-Me scoreboard | `[ ] working  [ ] partial  [ ] planned` |
| Verify page (signed chain) | `[ ] working  [ ] partial  [ ] planned` |
| WhatsApp notifications | `[ ] working  [ ] partial  [ ] planned` |
| Job-posting alerts | `[ ] working  [ ] partial  [ ] planned` |

---

## Running the tests

```bash
# backend
pytest

# frontend
cd frontend && npm test
```

We keep a set of adversarial cases (empty test, `assert True`, unused dependency, keyword stuffing, planted instructions in text) that must never upgrade a skill. If you add a detector, add the cases that try to fool it.

---

## Folder layout

> Adjust this to match the repo.

```
AI-CareerCoach/
├── backend/        FastAPI app, detectors, assessment engine, notifier
├── frontend/       React + Vite app
├── tests/          unit tests and adversarial cases
├── docs/           blueprint and design notes
└── .env.example    the settings the app expects (names only)
```

---

## Roadmap

Things we'd like to do next, with the honest reason each isn't done yet:

- **More languages and ecosystems.** Right now we cover a few detector families and two ecosystems deeply rather than many shallowly.
- **A safe sandbox for running tests.** We read results from your own CI instead of running code ourselves.
- **Job alerts from sources that allow it**, with a form-filling helper where the person clicks Submit themselves.
- **A larger held-out benchmark.** The current one is small, and we say so wherever we show it.

---

## The team

| Name | What they worked on |
|---|---|
| `<name>` | `<area>` |
| `<name>` | `<area>` |
| `<name>` | `<area>` |

---

## Acknowledgements

Built with FastAPI, React, Vite, SQLite and Twilio, with Stitch for design and Antigravity for coding help. Thanks to the organizers for a problem statement worth taking seriously.

## License

`<choose a license, e.g. MIT, and add a LICENSE file>`
