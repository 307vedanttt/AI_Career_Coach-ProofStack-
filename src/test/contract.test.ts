import { describe, it, expect } from 'vitest';
import {
  UserSessionResponseSchema,
  AssessmentResponseSchema,
  EvidenceResponseSchema,
  CoverageResponseSchema,
  ProofMapResponseSchema,
  CommitContractResponseSchema,
  DryRunResponseSchema,
  CorrectionResponseSchema,
  AdversarialSuiteResponseSchema,
  ResumeAttestationResponseSchema,
  LedgerBlockResponseSchema,
  RepoScanResponseSchema,
} from '../lib/api/schemas';
import {
  mockBackendMe,
  mockBackendAssessments,
  mockBackendEvidence,
  mockBackendCoverage,
  mockBackendProofMap,
  mockBackendContracts,
  mockBackendDryRun,
  mockBackendResume,
  mockBackendLedgerBlocks,
  mockBackendScanner,
  mockBackendAdversarial,
} from './mocks/msw-handlers';

describe('Contract Schema Conformance Tests', () => {
  it('validates UserSession mock against UserSessionResponseSchema', () => {
    const result = UserSessionResponseSchema.safeParse(mockBackendMe);
    expect(result.success).toBe(true);
  });

  it('validates AssessmentResponse mock against AssessmentResponseSchema', () => {
    const result = AssessmentResponseSchema.safeParse(mockBackendAssessments);
    expect(result.success).toBe(true);
  });

  it('validates EvidenceResponse mock against EvidenceResponseSchema', () => {
    const result = EvidenceResponseSchema.safeParse(mockBackendEvidence);
    expect(result.success).toBe(true);
  });

  it('validates CoverageResponse mock against CoverageResponseSchema', () => {
    const result = CoverageResponseSchema.safeParse(mockBackendCoverage);
    expect(result.success).toBe(true);
  });

  it('validates ProofMapResponse mock against ProofMapResponseSchema', () => {
    const result = ProofMapResponseSchema.safeParse(mockBackendProofMap);
    expect(result.success).toBe(true);
  });

  it('validates CommitContractResponse mock against CommitContractResponseSchema', () => {
    mockBackendContracts.forEach((contract: any) => {
      const result = CommitContractResponseSchema.safeParse(contract);
      expect(result.success).toBe(true);
    });
  });

  it('validates DryRunResponse mock against DryRunResponseSchema', () => {
    const result = DryRunResponseSchema.safeParse(mockBackendDryRun);
    expect(result.success).toBe(true);
  });

  it('validates CorrectionResponse mock against CorrectionResponseSchema', () => {
    const result = CorrectionResponseSchema.safeParse({
      status: 'recorded',
      success: true,
      message: 'Correction recorded successfully',
    });
    expect(result.success).toBe(true);
  });

  it('validates ResumeAttestationResponse mock against ResumeAttestationResponseSchema', () => {
    const result = ResumeAttestationResponseSchema.safeParse(mockBackendResume);
    expect(result.success).toBe(true);
  });

  it('validates LedgerBlockResponse mocks against LedgerBlockResponseSchema', () => {
    mockBackendLedgerBlocks.forEach((block: any) => {
      const result = LedgerBlockResponseSchema.safeParse(block);
      expect(result.success).toBe(true);
    });
  });


  it('validates RepoScanResponse mock against RepoScanResponseSchema', () => {
    const result = RepoScanResponseSchema.safeParse(mockBackendScanner);
    expect(result.success).toBe(true);
  });

  it('validates AdversarialSuiteResponse mock against AdversarialSuiteResponseSchema', () => {
    const result = AdversarialSuiteResponseSchema.safeParse(mockBackendAdversarial);
    expect(result.success).toBe(true);
  });

  it('fails if an invalid mock payload is supplied', () => {
    const invalidPayload = {
      id: 12345, // invalid type: should be string
      evidence_coverage: 'not-a-number', // invalid type
    };
    const result = CoverageResponseSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
