import { z } from 'zod';
export const UserSessionResponseSchema = z.object({
    id: z.string(),
    login: z.string(),
    name: z.string().optional().nullable(),
    avatar_url: z.string().optional().nullable(),
    avatarUrl: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    public_repos: z.number().optional().nullable(),
    publicRepos: z.number().optional().nullable(),
    scopes: z.array(z.string()).optional(),
    session_started_at: z.string().optional().nullable(),
    sessionStartedAt: z.string().optional().nullable(),
}).passthrough();
export const AssessmentResponseSchema = z.any();
export const EvidenceResponseSchema = z.any();
export const CoverageResponseSchema = z.object({
    id: z.string().optional(),
    job_id: z.string().optional(),
    evidence_coverage: z.number().optional(),
    coverage_pct: z.number().optional(),
    coveragePct: z.number().optional(),
    assessed_count: z.number().optional(),
    total_count: z.number().optional(),
}).passthrough();
export const ProofMapResponseSchema = z.any();
export const CommitContractResponseSchema = z.any();
export const DryRunResponseSchema = z.any();
export const CorrectionResponseSchema = z.any();
export const AdversarialSuiteResponseSchema = z.any();
export const AdversarialRunResponseSchema = z.any();
export const ResumeAttestationResponseSchema = z.any();
export const LedgerBlockResponseSchema = z.any();
export const RepoScanResponseSchema = z.any();
