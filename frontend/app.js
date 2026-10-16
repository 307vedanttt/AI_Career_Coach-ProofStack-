const API_BASE = window.location.origin + "/api";

// State
let currentJob = null;
let currentRepo = null;
let currentAssessments = [];
let eventSource = null;

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
    initSSE();
    checkSystemHealth();
    bindEvents();
});

// 1. SSE Connection
function initSSE() {
    if (eventSource) eventSource.close();
    eventSource = new EventSource(`${API_BASE}/events/stream`);

    eventSource.onopen = () => {
        document.getElementById("sseStatus").innerHTML = `
            <span class="pulse-dot"></span> Live Pipeline SSE Connected
        `;
    };

    eventSource.addEventListener("step", (e) => {
        const payload = JSON.parse(e.data);
        addTraceStep(payload.step);
    });

    eventSource.addEventListener("trace_finished", (e) => {
        const payload = JSON.parse(e.data);
        console.log("Trace run finished:", payload);
        loadAssessments();
    });

    eventSource.onerror = () => {
        document.getElementById("sseStatus").innerHTML = `
            <span style="color: #f87171;">●</span> SSE Reconnecting...
        `;
    };
}

// 2. Health check
async function checkSystemHealth() {
    try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        document.getElementById("systemVersion").textContent = `v${data.version} (${data.run_mode})`;
    } catch (err) {
        document.getElementById("systemVersion").textContent = "Backend Offline";
    }
}

// 3. Bind UI Events
function bindEvents() {
    // Load sample job button
    document.getElementById("btnSampleJob").addEventListener("click", () => {
        document.getElementById("jobTitle").value = "Senior Backend Engineer";
        document.getElementById("jobCompany").value = "HyperScale AI";
        document.getElementById("jobDescription").value = 
`We are seeking an experienced Senior Backend Engineer.
Candidates must have solid hands-on experience building RESTful APIs using FastAPI and Python.
You will write optimized SQL queries and manage relational database schemas using PostgreSQL and SQLAlchemy.
Strong experience with automated testing using pytest is required.
Nice to have: Docker containerization, Docker Compose, and CI/CD GitHub Actions workflows.
Excellent verbal communication and team mentoring skills are a plus.`;
    });

    // Submit Job Form
    document.getElementById("jobForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("jobTitle").value;
        const company = document.getElementById("jobCompany").value;
        const url = document.getElementById("jobUrl").value;
        const description = document.getElementById("jobDescription").value;

        const submitBtn = e.target.querySelector("button[type='submit']");
        submitBtn.disabled = true;
        submitBtn.textContent = "Extracting & Normalizing...";

        try {
            const res = await fetch(`${API_BASE}/jobs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, company, url, description })
            });
            if (!res.ok) {
                const err = await res.json();
                alert(`Error extracting job: ${err.detail || "Unknown error"}`);
                return;
            }
            currentJob = await res.json();
            renderRequirements(currentJob.requirements);
            alert(`Extracted ${currentJob.requirements.length} structured requirements!`);
        } catch (err) {
            alert(`Network error: ${err.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Extract Requirements";
        }
    });

    // Connect Repo Form
    document.getElementById("repoForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const repoUrl = document.getElementById("repoUrl").value;
        const connectBtn = e.target.querySelector("button[type='submit']");
        connectBtn.disabled = true;
        connectBtn.textContent = "Connecting...";

        try {
            const res = await fetch(`${API_BASE}/repos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repo_url: repoUrl })
            });
            if (!res.ok) {
                const err = await res.json();
                alert(`Failed to connect repo: ${err.detail}`);
                return;
            }
            currentRepo = await res.json();
            document.getElementById("connectedRepoInfo").textContent = 
                `Connected: ${currentRepo.owner}/${currentRepo.name} (branch: ${currentRepo.default_branch})`;
            document.getElementById("btnAnalyze").disabled = false;
            document.getElementById("btnDryRun").disabled = false;
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            connectBtn.disabled = false;
            connectBtn.textContent = "Connect Repository";
        }
    });

    // Run Real Assessment Button
    document.getElementById("btnAnalyze").addEventListener("click", async () => {
        if (!currentRepo || !currentJob) {
            alert("Please extract a job and connect a repository first.");
            return;
        }
        clearTrace();
        const btn = document.getElementById("btnAnalyze");
        btn.disabled = true;
        btn.textContent = "Assessing Evidence...";

        try {
            const res = await fetch(`${API_BASE}/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repo_id: currentRepo.id, job_id: currentJob.id })
            });
            if (!res.ok) {
                const err = await res.json();
                alert(`Assessment failed: ${err.detail}`);
                return;
            }
            const data = await res.json();
            renderCoverage(data.coverage);
            await loadAssessments();
            await loadProofMap();
            await loadContracts();
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            btn.disabled = false;
            btn.textContent = "Run Full Assessment";
        }
    });

    // Dry Run Button (Open Modal)
    document.getElementById("btnDryRun").addEventListener("click", () => {
        document.getElementById("dryRunModal").classList.add("active");
    });

    document.getElementById("btnCloseModal").addEventListener("click", () => {
        document.getElementById("dryRunModal").classList.remove("active");
    });

    // Execute Dry Run Simulation
    document.getElementById("btnExecuteDryRun").addEventListener("click", async () => {
        if (!currentRepo || !currentJob) return;

        const simulatedCode = document.getElementById("simulatedCode").value;
        const filePath = document.getElementById("simulatedPath").value;

        const simulatedFiles = {};
        simulatedFiles[filePath] = simulatedCode;

        try {
            const res = await fetch(`${API_BASE}/dry-run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    repo_id: currentRepo.id,
                    job_id: currentJob.id,
                    simulated_files: simulatedFiles
                })
            });
            const data = await res.json();
            alert(`Dry Run Result: ${data.delta_summary}`);
            document.getElementById("dryRunModal").classList.remove("active");
            loadAssessments();
        } catch (err) {
            alert(`Dry run failed: ${err.message}`);
        }
    });
}

// 4. Render Requirements List
function renderRequirements(reqs) {
    const container = document.getElementById("requirementsList");
    container.innerHTML = "";

    reqs.forEach(r => {
        const item = document.createElement("div");
        item.className = "requirement-item";
        item.innerHTML = `
            <div class="req-header">
                <span class="req-title">${r.label}</span>
                <div>
                    <span class="badge ${r.importance === 'required' ? 'badge-required' : 'badge-preferred'}">${r.importance} (w: ${r.importance === 'required' ? '3' : '1'})</span>
                    <span class="badge ${r.assessable === 'code_assessable' ? 'badge-strong' : 'badge-unclear'}">${r.assessable}</span>
                </div>
            </div>
            <div class="req-quote">"${r.exact_quote}"</div>
            <div style="display: flex; gap: 8px; align-items: center; font-size: 12px; color: #9ca3af;">
                <span>Detector: <strong>${r.detector_name || 'None (Soft skill)'}</strong></span>
                | <span>Status: <strong>${r.user_status}</strong></span>
            </div>
        `;
        container.appendChild(item);
    });
}

// 5. Load and Render Assessments
async function loadAssessments() {
    if (!currentRepo || !currentJob) return;

    try {
        const res = await fetch(`${API_BASE}/assessments?repo_id=${currentRepo.id}&job_id=${currentJob.id}`);
        if (!res.ok) return;
        const data = await res.json();
        currentAssessments = data.assessments;
        renderCoverage(data.coverage);

        const container = document.getElementById("assessmentsList");
        container.innerHTML = "";

        data.assessments.forEach(a => {
            const badgeClass = getStatusBadgeClass(a.status);
            const card = document.createElement("div");
            card.className = "requirement-item";

            let evidenceHtml = "";
            if (a.evidence && a.evidence.length > 0) {
                evidenceHtml = `
                    <div style="margin-top: 10px;">
                        <strong style="font-size: 12px; color: #34d399;">✓ Surviving Evidence (${a.evidence.length}):</strong>
                        ${a.evidence.map(e => `
                            <div class="evidence-block">
                                <div style="color: #818cf8; font-weight: 600; margin-bottom: 4px;">
                                    ${e.file_path} (L${e.start_line}-${e.end_line}) — Signal: ${e.signal_type}
                                </div>
                                <pre><code>${escapeHtml(e.code_snippet)}</code></pre>
                            </div>
                        `).join("")}
                    </div>
                `;
            }

            let rejectedHtml = "";
            if (a.rejected_candidates && a.rejected_candidates.length > 0) {
                rejectedHtml = `
                    <div style="margin-top: 10px;">
                        <strong style="font-size: 12px; color: #f87171;">✗ Hollow Guard Rejections (${a.rejected_candidates.length}):</strong>
                        ${a.rejected_candidates.map(r => `
                            <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 6px; padding: 8px 12px; margin-top: 6px; font-size: 12px;">
                                <div><strong>${r.file_path}</strong>: <span style="color: #fca5a5;">${r.rejection_reason}</span></div>
                            </div>
                        `).join("")}
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="req-header">
                    <span class="req-title">${a.label}</span>
                    <span class="badge ${badgeClass}">${a.status}</span>
                </div>
                <p style="font-size: 13px; color: #d1d5db; margin-bottom: 6px;">${a.reason}</p>
                ${evidenceHtml}
                ${rejectedHtml}
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Error loading assessments:", err);
    }
}

// 6. Render Evidence Coverage Dial
function renderCoverage(cov) {
    if (!cov) return;
    document.getElementById("covValue").textContent = `${cov.evidence_coverage}%`;
    document.getElementById("covFormula").textContent = 
        `Formula: ${cov.numerator} pts / ${cov.denominator} max weight (${cov.assessed_count} assessed)`;

    if (cov.sensitivity_ranges) {
        document.getElementById("sensBaseline").textContent = `${cov.sensitivity_ranges.baseline_3_to_1}%`;
        document.getElementById("sensEqual").textContent = `${cov.sensitivity_ranges.equal_weights_1_to_1}%`;
        document.getElementById("sensStrict").textContent = `${cov.sensitivity_ranges.strict_required_5_to_1}%`;
    }
}

// 7. Load ProofMap
async function loadProofMap() {
    if (!currentRepo || !currentJob) return;

    try {
        const res = await fetch(`${API_BASE}/proofmap/${currentJob.id}?repo_id=${currentRepo.id}`);
        if (!res.ok) return;
        const data = await res.json();

        const container = document.getElementById("proofMapFiles");
        container.innerHTML = "";

        data.files.forEach(f => {
            const el = document.createElement("div");
            el.style = "padding: 8px 12px; background: rgba(0,0,0,0.2); border-radius: 6px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;";
            el.innerHTML = `
                <div>
                    <strong>${f.path}</strong> (${Math.round(f.size_bytes / 1024)} KB)
                    ${f.is_entry_point ? '<span class="badge badge-required" style="font-size: 10px; margin-left: 6px;">Entry</span>' : ''}
                    ${f.is_test ? '<span class="badge badge-preferred" style="font-size: 10px; margin-left: 6px;">Test</span>' : ''}
                </div>
                <div>
                    ${f.evidence_count > 0 ? `<span class="badge badge-strong">${f.evidence_count} Evidence Signals</span>` : '<span style="color: #6b7280;">0 signals</span>'}
                </div>
            `;
            container.appendChild(el);
        });
    } catch (err) {
        console.error("Error loading proofmap:", err);
    }
}

// 8. Commit Contracts
async function loadContracts() {
    if (!currentRepo || !currentJob) return;

    try {
        const res = await fetch(`${API_BASE}/contracts?repo_id=${currentRepo.id}&job_id=${currentJob.id}`);
        if (!res.ok) return;
        const contracts = await res.json();

        const container = document.getElementById("contractsList");
        container.innerHTML = "";

        if (contracts.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: #6b7280; padding: 16px;">
                    No pending commit contracts. Click below to propose next commit for coaching.
                    <div style="margin-top: 10px;">
                        <button id="btnProposeContract" class="btn btn-sm">Propose Next Commit Contract</button>
                    </div>
                </div>
            `;
            document.getElementById("btnProposeContract")?.addEventListener("click", proposeContract);
            return;
        }

        contracts.forEach(c => {
            const el = document.createElement("div");
            el.className = "requirement-item";
            el.innerHTML = `
                <div class="req-header">
                    <span class="req-title">Contract: Upgrade Target (${c.predicted_target_state})</span>
                    <span class="badge ${c.verdict === 'Fulfilled' ? 'badge-strong' : (c.verdict === 'Partly fulfilled' ? 'badge-basic' : 'badge-unclear')}">${c.verdict}</span>
                </div>
                <div style="font-size: 13px; color: #d1d5db; margin-bottom: 8px;">
                    Current: <strong>${c.current_state}</strong> ➔ Target: <strong>${c.predicted_target_state}</strong> (Effort: ${c.effort_class})
                </div>
                <div style="font-size: 12px; color: #9ca3af; margin-bottom: 6px;">Acceptance Criteria:</div>
                <ul style="padding-left: 20px; font-size: 12px; color: #e2e8f0; margin-bottom: 8px;">
                    ${c.acceptance_checks.map(chk => `<li>${chk}</li>`).join("")}
                </ul>
                ${c.reason ? `<div style="font-size: 12px; color: #34d399; font-style: italic;">Adjudication: ${c.reason}</div>` : ''}
            `;
            container.appendChild(el);
        });
    } catch (err) {
        console.error("Error loading contracts:", err);
    }
}

async function proposeContract() {
    if (!currentJob || !currentRepo || currentAssessments.length === 0) return;
    // Pick first uncompleted requirement
    const target = currentAssessments.find(a => a.status !== "Demonstrated (strong)") || currentAssessments[0];
    if (!target) return;

    try {
        const res = await fetch(`${API_BASE}/contracts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                repo_id: currentRepo.id,
                job_id: currentJob.id,
                requirement_id: target.requirement_id
            })
        });
        if (res.ok) {
            loadContracts();
        }
    } catch (err) {
        alert("Failed to propose contract: " + err.message);
    }
}

// 9. Trace helper
function clearTrace() {
    document.getElementById("traceTimeline").innerHTML = "";
}

function addTraceStep(step) {
    const container = document.getElementById("traceTimeline");
    const el = document.createElement("div");
    el.className = "trace-step";
    el.innerHTML = `
        <div class="trace-content">
            <div class="trace-title">${step.step_name} (${step.status})</div>
            <div class="trace-meta">+${step.elapsed_ms}ms | ${JSON.stringify(step.details)}</div>
        </div>
    `;
    container.prepend(el);
}

// Helper utilities
function getStatusBadgeClass(status) {
    if (status.includes("strong")) return "badge-strong";
    if (status.includes("basic")) return "badge-basic";
    if (status.includes("Not demonstrated")) return "badge-not";
    return "badge-unclear";
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
