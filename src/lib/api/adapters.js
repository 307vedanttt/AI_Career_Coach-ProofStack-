export function adaptAssessmentItem(raw) {
    return {
        id: raw.id || `req-${Math.random().toString(36).substring(2, 7)}`,
        requirementId: raw.requirement_id || raw.requirementId || raw.id || '',
        requirementName: raw.requirement_name || raw.requirementName || raw.label || raw.name || '',
        status: raw.status || 'not_shown',
        confidence: typeof raw.confidence === 'number' ? raw.confidence : 1.0,
        summary: raw.summary || raw.reason || '',
        lastCommitHash: raw.last_commit_hash || raw.lastCommitHash || raw.commit_sha || '',
        timestamp: raw.timestamp || raw.analyzed_at || new Date().toISOString(),
    };
}
export function adaptEvidence(raw) {
    return {
        id: raw.id || '',
        requirementId: raw.requirement_id || raw.requirementId || '',
        title: raw.title || 'Verified Invariant',
        sublabel: raw.sublabel || (raw.detector_name ? `${raw.detector_name} Invariant` : 'Codebase Invariant'),
        serial: raw.serial || (raw.id ? `REC-${String(raw.id).slice(0, 8)}` : 'REC-LIVE'),
        timestamp: raw.timestamp || raw.created_at || new Date().toISOString(),
        status: raw.status || 'proven',
        fileName: raw.fileName || raw.file_path || '',
        code: raw.code || raw.code_snippet || '',
        highlightLines: raw.highlightLines || (raw.start_line && raw.end_line ? [raw.start_line, raw.end_line] : [1, 1]),
        highlightType: raw.highlightType || 'emerald',
        chips: raw.chips || (raw.signal_type ? [String(raw.signal_type).toUpperCase(), 'INVARIANT'] : ['INVARIANT']),
        auditTrail: raw.auditTrail || {
            commitHash: raw.commit_sha || raw.commitHash || '',
            committer: raw.committer || raw.author || '',
            verifiedAssertions: raw.verifiedAssertions ?? (raw.llm_verified ? 1 : 0),
            merkleRoot: raw.merkleRoot || raw.merkle_root || '',
        },
    };
}
export function adaptCoverage(raw) {
    return {
        id: raw.id || 'cov-live',
        coveragePct: raw.coverage_pct ?? raw.coveragePct ?? raw.evidence_coverage ?? (raw.coverage ? raw.coverage.evidence_coverage : 0) ?? 0,
        assessedCount: raw.assessed_count ?? raw.assessedCount ?? (raw.coverage ? raw.coverage.assessed_count : 0) ?? 0,
        totalCount: raw.total_count ?? raw.totalCount ?? (raw.coverage ? raw.coverage.required_count : 0) ?? 0,
    };
}
export function adaptProofMap(raw) {
    if (Array.isArray(raw))
        return raw;
    if (raw && Array.isArray(raw.files))
        return raw.files;
    return [];
}
export function adaptCommitContract(raw) {
    const verdictRaw = (raw.verdict || raw.status || 'pending').toLowerCase();
    let status = 'pending';
    if (verdictRaw.includes('partly'))
        status = 'partly';
    else if (verdictRaw.includes('fulfilled'))
        status = 'fulfilled';
    else if (verdictRaw.includes('not'))
        status = 'not_fulfilled';
    else if (verdictRaw.includes('open') || verdictRaw.includes('pending'))
        status = 'pending';
    let checklist = [];
    if (raw.adjudication_json && Array.isArray(raw.adjudication_json.checks)) {
        checklist = raw.adjudication_json.checks.map((c, idx) => ({
            id: c.rule_id || `check-${idx}`,
            ruleId: c.rule_id,
            label: c.label || c.rule_id || `Check ${idx + 1}`,
            description: c.description || '',
            file: c.file || raw.suggested_file_path || '',
            line: c.line,
            satisfied: Boolean(c.passed),
            statusLabel: c.passed ? 'PASSED' : 'PENDING',
            reason: c.reason || ''
        }));
    }
    else if (Array.isArray(raw.acceptance_checks_json) && raw.acceptance_checks_json.length > 0) {
        checklist = raw.acceptance_checks_json.map((c, idx) => ({
            id: c.rule_id || `check-${idx}`,
            ruleId: c.rule_id,
            label: c.label || c.rule_id || `Check ${idx + 1}`,
            description: c.description || '',
            file: c.file || raw.suggested_file_path || '',
            line: c.line,
            satisfied: Boolean(c.passed),
            statusLabel: c.passed ? 'PASSED' : 'PENDING',
            reason: c.reason || ''
        }));
    }
    else if (Array.isArray(raw.acceptance_checks)) {
        checklist = raw.acceptance_checks.map((desc, idx) => ({
            id: `check-${idx}`,
            label: `Rule Check ${idx + 1}`,
            description: desc,
            file: raw.suggested_file_path || '',
            satisfied: false,
            statusLabel: 'PENDING',
            reason: desc
        }));
    }
    else if (Array.isArray(raw.checklist)) {
        checklist = raw.checklist;
    }
    const effort = (raw.effort_class || 'small').toLowerCase();
    const diffEstimate = effort === 'large' ? 'LARGE' : (effort === 'medium' ? 'MEDIUM' : 'SMALL');
    const targetState = raw.predicted_target_state || raw.target_status || '';
    const targetStatus = targetState.toLowerCase().includes('strong') ? 'proven' : 'basic';
    const reqName = raw.requirement_name || raw.requirement_target || raw.requirementTarget || 'Missing Skill';
    const title = `Challenge: Bridge ${reqName}`;
    const description = raw.task_description || raw.description || `Implement verifiable code satisfying ${reqName}.`;
    return {
        id: raw.id || '',
        repoId: raw.repo_id || '',
        jobId: raw.job_id || '',
        requirementId: raw.requirement_id || '',
        title,
        description,
        requirementTarget: reqName,
        currentState: raw.current_state || 'Not demonstrated in this scope',
        predictedTargetState: targetState || 'Demonstrated (basic)',
        pointsDelta: raw.points_delta ?? 12,
        diffEstimate,
        timeEstimate: effort === 'small' ? '30 mins' : (effort === 'medium' ? '1-2 hours' : '3-4 hours'),
        effortClass: effort,
        checklist,
        acceptanceChecks: raw.acceptance_checks || [],
        mustNotMove: raw.must_not_move_json || raw.requirements_must_not_change || [],
        frozenScope: (raw.must_not_move_json || []).join(', ') || 'Demonstrated Skills Locked',
        gitCommand: `git commit -m "feat(${reqName.toLowerCase().replace(/\\s+/g, '-')}): satisfy contract"`,
        status,
        targetStatus,
        ciStatus: raw.ci_status || 'not_run',
        adjudication: raw.adjudication_json,
        suggestedFilePath: raw.suggested_file_path,
        recommendationSkeleton: raw.recommendation_skeleton,
        gainArithmetic: raw.gain_arithmetic,
        reason: raw.reason
    };
}
export function adaptUserSession(raw) {
    return {
        id: raw.id || '',
        login: raw.login || raw.username || 'user',
        name: raw.name || raw.username || raw.login || 'User',
        avatarUrl: raw.avatar_url || raw.avatarUrl || '',
        publicRepos: raw.public_repos ?? raw.publicRepos ?? 0,
        scopes: raw.scopes || ['read:user'],
        sessionStartedAt: raw.session_started_at || raw.sessionStartedAt || new Date().toISOString(),
    };
}
export function adaptRepoScan(raw) {
    return {
        targetUser: raw.target_user || raw.targetUser || '',
        targetRepo: raw.target_repo || raw.targetRepo || '',
        auditReceiptId: raw.audit_receipt_id || raw.auditReceiptId || '',
        timestamp: raw.timestamp || new Date().toISOString(),
        coveragePct: raw.coverage_pct ?? raw.coveragePct ?? 0,
        assessedCount: raw.assessed_count ?? raw.assessedCount ?? 0,
        totalCount: raw.total_count ?? raw.totalCount ?? 0,
        organization: raw.organization || '',
        breakdown: raw.breakdown || { proven: 0, basic: 0, notShown: 0, unclear: 0 },
        verifiedFiles: raw.verified_files || raw.verifiedFiles || [],
        isAttested: raw.is_attested ?? raw.isAttested ?? false,
    };
}
export function adaptLedgerBlocks(raw) {
    if (!Array.isArray(raw))
        return [];
    return raw.map((b, idx) => ({
        blockHeight: b.block_height ?? b.blockHeight ?? idx + 1,
        commitHash: b.commit_hash ?? b.commitHash ?? '',
        previousHash: b.previous_hash ?? b.previousHash ?? '',
        timestamp: b.timestamp || new Date().toISOString(),
        invariantsProven: b.invariants_proven ?? b.invariantsProven ?? 0,
        author: b.author || '',
        merkleRoot: b.merkle_root ?? b.merkleRoot ?? '',
    }));
}
