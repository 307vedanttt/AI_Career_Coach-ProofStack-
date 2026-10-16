# ProofStack — Evidence-Driven AI Career Coach

ProofStack helps developers compare the skills requested in a real job description with evidence found in their GitHub repositories. Instead of ranking people or making hiring decisions, it makes the available code evidence inspectable and recommends concrete, verifiable next steps.

> **Core principle:** ProofStack reports what its analysis can demonstrate from the connected repositories—not a verdict on a person's overall ability.

## Table of Contents

- [Why ProofStack?](#why-proofstack)
- [How It Works](#how-it-works)
- [Key Features](#key-features)
- [Evidence and Status Labels](#evidence-and-status-labels)
- [Commit Contracts](#commit-contracts)
- [Product Principles](#product-principles)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Development Notes](#development-notes)
- [Limitations](#limitations)
- [Roadmap Ideas](#roadmap-ideas)
- [Contributing](#contributing)
- [License](#license)

## Why ProofStack?

A résumé can say that a developer knows React, Node.js, databases, or testing, but it is difficult to quickly inspect the project evidence behind those claims. ProofStack creates a transparent path from job requirements to repository evidence and actionable improvement work.

It is designed to help developers:

- Understand which job requirements have supporting evidence in the repositories they selected.
- Inspect the exact files, lines, and commits behind an evidence signal when available.
- See where evidence is limited, unclear, or outside the current detector coverage.
- Turn an evidence gap into a small, testable engineering task.
- Reassess the project after making changes, where the configured backend supports reassessment.

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

Actual analysis stages, progress, and results should come from the backend. Any demo or sample data should be clearly identified as mock data.

## Key Features

### Job Requirement Extraction
Extracts skill and requirement statements from a job description and keeps the source wording available for review. Extraction should be treated as editable input, not unquestionable truth.

### Proof Map
A visual view connecting job requirements with evidence discovered in selected repositories. It helps users navigate from a requirement to the code signals supporting the current assessment.

### Evidence Explorer
Evidence details may include the following fields when provided by the backend:

- Requirement and repository
- Commit SHA
- File path and line range
- Code excerpt and GitHub permalink
- Detector name and version
- Signal type and verification outcome
- Verification reason or counter-evidence note
- Timestamp

Evidence should be traceable to its source. If a field is unavailable, the interface should not fabricate it.

### Evidence Coverage
Summarizes the scope of evidence detected for the selected job and repositories. Coverage is about what was observed in the selected code—not a measurement of the developer's complete skill set.

### Hollow-Evidence Guards
Attempts to prevent weak signals—such as a keyword, dependency, filename, or superficial code pattern—from being presented as strong proof without adequate supporting evidence.

### Commit Contract Recommendations
Turns a specific evidence gap or improvement opportunity into a bounded task with acceptance checks, constraints, and a base repository revision when available.

### Activity and System Health
Provides visibility into recent analysis activity and service health when those signals are available from the actual system.

## Evidence and Status Labels

Use explicit labels and explanatory text rather than relying on color alone. The intended meanings are:

- **Proven** — the configured evidence checks support the requirement within the analyzed scope.
- **Basic** — limited evidence was found; it should not be interpreted as comprehensive proof.
- **Not shown in scope** — the configured analysis did not find sufficient evidence in the selected repositories and supported detectors.
- **Unclear** — the available signals do not support a reliable conclusion.

A detector may not exist for every skill. In such cases, report **“No detector in this version”** or an equivalent out-of-scope explanation instead of implying that the user lacks the skill.

An LLM-only confirmation should not be presented as stronger than the product's defined evidence policy; the current product specification caps LLM-only confirmation at **Basic**.

## Commit Contracts

A Commit Contract is a recommendation, not a guaranteed solution or an automatic judgment of ability. Depending on backend support, it can include:

- The recommended change and its rationale
- Current and predicted evidence state
- Acceptance checks that can be verified
- Skills or behaviors that must not regress
- Base commit SHA
- Estimated effort and scoring details, if implemented
- Status and, when available, the adjudicated commit SHA and reason

The acceptance checks define a minimum bar for the proposed change; passing them is not a guarantee of overall code quality. A contract should only be marked complete or adjudicated when the backend has actually evaluated the relevant result.

## Product Principles

1. **Evidence, not people-ranking:** ProofStack does not rank candidates or issue hiring/ability verdicts.
2. **Scope transparency:** results describe selected repositories and supported detectors only.
3. **Traceability:** evidence should link to the relevant source code and revision when available.
4. **Honest uncertainty:** distinguish missing evidence from evidence that a skill is absent.
5. **No fabricated progress:** show only stages and metrics reported by the running system; label demo data clearly.
6. **No false provenance claims:** a ledger or signature can show that a record has not changed since signing; it does not independently prove who authored the code or that a skill belongs to a particular person.
7. **Accessible status design:** status meaning must be communicated with text/icons, not color alone.

## Architecture Overview

At a conceptual level, the system follows this pipeline:

```text
Job posting
    ↓
Requirement extraction and review
    ↓
Repository selection and file discovery
    ↓
Deterministic evidence detectors
    ↓
Evidence guards and verification
    ↓
Assessment and coverage generation
    ↓
Proof Map + Evidence Explorer
    ↓
Commit Contract recommendation
    ↓
Developer implements changes
    ↓
Reassessment (if supported)
```

The user interface should consume real backend responses for analysis results, status labels, progress, and contract adjudication. It should not simulate successful analysis when the backend has not completed it.

## Getting Started

The exact install commands depend on the repository's actual package manager, framework, and backend configuration. Once those are confirmed, document the commands here. A typical local setup is:

1. Clone the repository.
2. Install dependencies for each application or service in the repository.
3. Copy the example environment file, if provided, to the local environment file.
4. Configure the required API keys, database connection, GitHub OAuth/app credentials, and service URLs.
5. Start the backend services.
6. Start the frontend application.
7. Open the local URL printed by the frontend development server.

**Before publishing this README:** replace this section with the exact commands from the repository, such as the correct package manager commands, service names, ports, and environment variables. Do not add credentials to source control.

## Configuration

Configuration depends on the implementation. Common settings may include:

- GitHub OAuth or GitHub App credentials and callback URL
- Backend/API base URL
- Database connection string
- LLM provider/model configuration, if enabled
- Allowed origins/CORS settings
- Logging and environment mode

Use a `.env.example` file to document variable names and safe placeholder values. Keep real API keys, access tokens, OAuth secrets, and production credentials out of Git.

## Development Notes

- Keep evidence detection deterministic and explainable wherever possible.
- Record detector names/versions so results can be reproduced and audited.
- Preserve commit SHA and source locations for evidence signals.
- Keep LLM verification separate from deterministic detection and disclose when it was used.
- Add tests for false positives, weak evidence, unknown skills, and out-of-scope requirements.
- Ensure empty, failed, or partial analysis results are represented honestly in the UI.
- Treat soft requirements such as degree, years of experience, communication, location, and work authorization as not assessable from repository code unless a separate, appropriate source is explicitly provided.

## Limitations

- Repository analysis cannot establish a person's complete skill set or professional ability.
- A lack of detected evidence is not proof that a skill is absent.
- Detector coverage varies by language, framework, repository structure, and implementation version.
- Job-posting extraction may need human review.
- LLM outputs can be wrong and should not override the product's evidence policy.
- A cryptographic signature or ledger can help detect post-signing changes, but does not prove authorship by itself.
- Reassessment and contract adjudication are available only if implemented and connected to the backend.

## Roadmap Ideas

Potential areas to develop, depending on the current implementation:

- Broader detector coverage with versioned tests
- Better evidence explanations and counter-evidence handling
- Reproducible assessments tied to immutable commit SHAs
- Clear before/after comparisons after a Commit Contract is completed
- Accessibility and responsive-layout testing
- Evaluation datasets for detector precision and false-positive rates
- Improved error states and observability for long-running analysis jobs

## Contributing

Contributions are welcome. Before submitting a pull request:

1. Explain the problem and the intended behavior change.
2. Add or update tests for the affected functionality.
3. Ensure new evidence claims are traceable and do not overstate what the detector proves.
4. Document configuration or API changes.
5. Never commit secrets, personal access tokens, or private repository data.

Open an issue or discussion first for substantial architectural changes.

## License

No license has been specified in this README. Add the license selected by the project owner and include the corresponding `LICENSE` file before distributing the project publicly.
