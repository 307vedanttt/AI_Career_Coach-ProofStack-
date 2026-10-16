import { z } from 'zod';

export const UserSessionResponseSchema: z.ZodType<any> = z.object({
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

export const AssessmentResponseSchema: z.ZodType<any> = z.any();
export const EvidenceResponseSchema: z.ZodType<any> = z.any();

export const CoverageResponseSchema: z.ZodType<any> = z.object({
  id: z.string().optional(),
  job_id: z.string().optional(),
  evidence_coverage: z.number().optional(),
  coverage_pct: z.number().optional(),
  coveragePct: z.number().optional(),
  assessed_count: z.number().optional(),
  total_count: z.number().optional(),
}).passthrough();

export const ProofMapResponseSchema: z.ZodType<any> = z.any();
export const CommitContractResponseSchema: z.ZodType<any> = z.any();
export const DryRunResponseSchema: z.ZodType<any> = z.any();
export const CorrectionResponseSchema: z.ZodType<any> = z.any();
export const AdversarialSuiteResponseSchema: z.ZodType<any> = z.any();
export const AdversarialRunResponseSchema: z.ZodType<any> = z.any();
export const ResumeAttestationResponseSchema: z.ZodType<any> = z.any();
export const LedgerBlockResponseSchema: z.ZodType<any> = z.any();
export const RepoScanResponseSchema: z.ZodType<any> = z.any();
