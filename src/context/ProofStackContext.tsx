import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  RepositoryIdentity,
  ContributorMetric,
  ProvenanceCheckItem,
  CommitAuditItem,
  SkillAssessmentModel,
  EvidenceItemModel,
  CommitContractModel,
  AssessmentActivityRecord,
  StandardSkillState,
} from '../types/proofstack';
import {
  initialRepository,
  initialContributors,
  initialProvenanceChecks,
  initialCommits,
  initialSkills,
  initialEvidenceItems,
  initialContracts,
  initialActivities,
} from '../data/proofstack-seed';

interface ProofStackContextType {
  repository: RepositoryIdentity;
  contributors: ContributorMetric[];
  provenanceChecks: ProvenanceCheckItem[];
  commits: CommitAuditItem[];
  skills: SkillAssessmentModel[];
  evidenceItems: EvidenceItemModel[];
  contracts: CommitContractModel[];
  activities: AssessmentActivityRecord[];
  
  // Navigation / Filter State
  selectedSkillFilter: string | null;
  setSelectedSkillFilter: (skillId: string | null) => void;
  selectedStatusFilter: StandardSkillState | null;
  setSelectedStatusFilter: (status: StandardSkillState | null) => void;
  selectedCategoryFilter: 'all' | 'accepted' | 'rejected' | 'unclear';
  setSelectedCategoryFilter: (category: 'all' | 'accepted' | 'rejected' | 'unclear') => void;
  selectedEvidenceId: string | null;
  setSelectedEvidenceId: (id: string | null) => void;
  selectedSkillId: string | null;
  setSelectedSkillId: (id: string | null) => void;
  activeContractId: string | null;
  setActiveContractId: (id: string | null) => void;

  // Actions
  runAudit: () => Promise<void>;
  isAuditing: boolean;
  updateContractStatus: (contractId: string, status: CommitContractModel['status']) => void;
  submitContract: (contractId: string) => Promise<void>;
  acceptContractEvidence: (contractId: string) => void;
  addReviewerNote: (evidenceId: string, note: string) => void;
  markEvidenceReviewed: (evidenceId: string) => void;
  resetDemoData: () => void;
  
  // Metrics helper
  metrics: {
    totalSkills: number;
    demonstratedStrong: number;
    demonstratedBasic: number;
    notDemonstrated: number;
    unclear: number;
    evidenceRequiringReview: number;
    acceptedEvidenceCount: number;
    rejectedEvidenceCount: number;
  };
}

const STORAGE_KEY = 'proofstack_demo_state_v2';

const ProofStackContext = createContext<ProofStackContextType | null>(null);

export const ProofStackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [repository, setRepository] = useState<RepositoryIdentity>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_repo`);
    return saved ? JSON.parse(saved) : initialRepository;
  });

  const [contributors, setContributors] = useState<ContributorMetric[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contributors`);
    return saved ? JSON.parse(saved) : initialContributors;
  });

  const [provenanceChecks, setProvenanceChecks] = useState<ProvenanceCheckItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_provenance`);
    return saved ? JSON.parse(saved) : initialProvenanceChecks;
  });

  const [commits, setCommits] = useState<CommitAuditItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_commits`);
    return saved ? JSON.parse(saved) : initialCommits;
  });

  const [skills, setSkills] = useState<SkillAssessmentModel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_skills`);
    return saved ? JSON.parse(saved) : initialSkills;
  });

  const [evidenceItems, setEvidenceItems] = useState<EvidenceItemModel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_evidence`);
    return saved ? JSON.parse(saved) : initialEvidenceItems;
  });

  const [contracts, setContracts] = useState<CommitContractModel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contracts`);
    return saved ? JSON.parse(saved) : initialContracts;
  });

  const [activities, setActivities] = useState<AssessmentActivityRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // Filters
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StandardSkillState | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'accepted' | 'rejected' | 'unclear'>('all');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>('evi-test-basic');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>('skill-testing');
  const [activeContractId, setActiveContractId] = useState<string | null>('contract-api-testing');

  // Persistence
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_repo`, JSON.stringify(repository));
    localStorage.setItem(`${STORAGE_KEY}_contributors`, JSON.stringify(contributors));
    localStorage.setItem(`${STORAGE_KEY}_provenance`, JSON.stringify(provenanceChecks));
    localStorage.setItem(`${STORAGE_KEY}_commits`, JSON.stringify(commits));
    localStorage.setItem(`${STORAGE_KEY}_skills`, JSON.stringify(skills));
    localStorage.setItem(`${STORAGE_KEY}_evidence`, JSON.stringify(evidenceItems));
    localStorage.setItem(`${STORAGE_KEY}_contracts`, JSON.stringify(contracts));
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
  }, [repository, contributors, provenanceChecks, commits, skills, evidenceItems, contracts, activities]);

  // Derived Metrics
  const metrics = {
    totalSkills: skills.length,
    demonstratedStrong: skills.filter((s) => s.currentStatus === 'Demonstrated — Strong').length,
    demonstratedBasic: skills.filter((s) => s.currentStatus === 'Demonstrated — Basic').length,
    notDemonstrated: skills.filter((s) => s.currentStatus === 'Not demonstrated in this scope').length,
    unclear: skills.filter((s) => s.currentStatus === 'Unclear').length,
    evidenceRequiringReview: evidenceItems.filter((e) => e.category === 'unclear' || e.reviewerStatus === 'pending').length,
    acceptedEvidenceCount: evidenceItems.filter((e) => e.category === 'accepted').length,
    rejectedEvidenceCount: evidenceItems.filter((e) => e.category === 'rejected').length,
  };

  const runAudit = async () => {
    setIsAuditing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const now = new Date();
    const timestampStr = `${now.toISOString().replace('T', ' ').slice(0, 16)} UTC`;

    setRepository((prev) => ({
      ...prev,
      lastAssessmentTimestamp: timestampStr,
    }));

    const newActivity: AssessmentActivityRecord = {
      id: `act-${Date.now()}`,
      timestamp: timestampStr,
      actionType: 'audit',
      title: 'Repository Evidence Audit Executed',
      summary: `Inspected ${commits.length} commits and validated ${skills.length} skills against Provenance & Authenticity Shield.`,
      badgeText: 'Audit Run',
    };

    setActivities((prev) => [newActivity, ...prev]);
    setIsAuditing(false);
  };

  const updateContractStatus = (contractId: string, newStatus: CommitContractModel['status']) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === contractId ? { ...c, status: newStatus } : c))
    );

    const targetContract = contracts.find((c) => c.id === contractId);
    if (targetContract) {
      const now = new Date();
      const timestampStr = `${now.toISOString().replace('T', ' ').slice(0, 16)} UTC`;
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          timestamp: timestampStr,
          actionType: newStatus === 'In Progress' ? 'contract_started' : 'review',
          title: `Commit Contract Status: ${newStatus}`,
          summary: `Contract "${targetContract.title}" transitioned to ${newStatus}.`,
          badgeText: newStatus,
        },
        ...prev,
      ]);
    }
  };

  const submitContract = async (contractId: string) => {
    updateContractStatus(contractId, 'Under Review');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate satisfying acceptance criteria
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const updatedCriteria = c.acceptanceCriteria.map((crit) => ({
          ...crit,
          satisfied: true,
        }));
        return {
          ...c,
          status: 'Under Review',
          acceptanceCriteria: updatedCriteria,
        };
      })
    );
  };

  const acceptContractEvidence = (contractId: string) => {
    const targetContract = contracts.find((c) => c.id === contractId);
    if (!targetContract) return;

    // 1. Mark contract as Reviewed
    setContracts((prev) =>
      prev.map((c) => (c.id === contractId ? { ...c, status: 'Reviewed' } : c))
    );

    // 2. Add new verified evidence item
    const newEvidenceId = `evi-contract-${targetContract.targetSkillId}-${Date.now().toString().slice(-4)}`;
    const newEvidence: EvidenceItemModel = {
      id: newEvidenceId,
      skillId: targetContract.targetSkillId,
      skillName: targetContract.targetSkillName,
      title: `Verified Invariant Suite: ${targetContract.title}`,
      filePath: targetContract.relevantFiles[0] || 'tests/integration.test.ts',
      lineRange: [1, 35],
      category: 'accepted',
      validationMethod: 'Commit Contract Criterion Verification + AST Inspection',
      assessmentStatus: 'Demonstrated — Strong',
      shortExplanation: `Fulfill contract criteria: comprehensive testing of invalid input, auth boundaries, and structured responses.`,
      excerpt: targetContract.diffPreview?.diffSnippet || `// Verified integration test suite\nexpect(response.status).toBe(422);\nexpect(response.status).toBe(401);`,
      highlightedLines: [1, 2, 3, 4],
      contributionContext: {
        author: 'Alex Chen <alex.chen@acme-labs.io>',
        commitHash: 'f4b19c8',
        timestamp: 'Just now',
        isCandidate: true,
      },
      knownLimitations: 'None in current scope. Criteria verified.',
      whyDecision: {
        observation: 'All 4 acceptance criteria satisfied by candidate submission. Negative boundaries and security headers exercised.',
        interpretation: 'Demonstrates deep capability in automated invariant testing and edge-case resilience.',
        limitation: 'Simulated review executed against declared acceptance criteria.',
        nextStep: 'Evidence locked and merged to verified Proof Map.',
      },
      reviewerStatus: 'reviewed',
      reviewerNote: 'Accepted via Commit Contract simulation review.',
      relatedContractId: contractId,
      honestyLabel: 'Simulated Demo',
    };

    setEvidenceItems((prev) => [newEvidence, ...prev]);

    // 3. Flip Skill Assessment State in Proof Map and Overview
    setSkills((prev) =>
      prev.map((s) => {
        if (s.id !== targetContract.targetSkillId) return s;
        return {
          ...s,
          currentStatus: targetContract.targetSkillState,
          confidence: 0.96,
          summary: `Upgraded via Commit Contract "${targetContract.title}". Verified integration tests covering error boundaries, status codes, and schema validation.`,
          supportingEvidenceIds: [...s.supportingEvidenceIds, newEvidenceId],
          updatedViaContract: true,
          lastReviewedAt: 'Just now',
        };
      })
    );

    // 4. Record Activity
    const now = new Date();
    const timestampStr = `${now.toISOString().replace('T', ' ').slice(0, 16)} UTC`;
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: timestampStr,
        actionType: 'contract_accepted',
        title: `Contract Fulfilled & Evidence Accepted`,
        summary: `Skill "${targetContract.targetSkillName}" flipped to ${targetContract.targetSkillState}. Proof Map and Dossier updated.`,
        badgeText: 'Skill Upgraded',
      },
      ...prev,
    ]);
  };

  const addReviewerNote = (evidenceId: string, note: string) => {
    setEvidenceItems((prev) =>
      prev.map((e) => (e.id === evidenceId ? { ...e, reviewerNote: note, reviewerStatus: 'reviewed' } : e))
    );
  };

  const markEvidenceReviewed = (evidenceId: string) => {
    setEvidenceItems((prev) =>
      prev.map((e) => (e.id === evidenceId ? { ...e, reviewerStatus: 'reviewed' } : e))
    );
  };

  const resetDemoData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_repo`);
    localStorage.removeItem(`${STORAGE_KEY}_contributors`);
    localStorage.removeItem(`${STORAGE_KEY}_provenance`);
    localStorage.removeItem(`${STORAGE_KEY}_commits`);
    localStorage.removeItem(`${STORAGE_KEY}_skills`);
    localStorage.removeItem(`${STORAGE_KEY}_evidence`);
    localStorage.removeItem(`${STORAGE_KEY}_contracts`);
    localStorage.removeItem(`${STORAGE_KEY}_activities`);

    setRepository(initialRepository);
    setContributors(initialContributors);
    setProvenanceChecks(initialProvenanceChecks);
    setCommits(initialCommits);
    setSkills(initialSkills);
    setEvidenceItems(initialEvidenceItems);
    setContracts(initialContracts);
    setActivities(initialActivities);

    setSelectedSkillFilter(null);
    setSelectedStatusFilter(null);
    setSelectedCategoryFilter('all');
    setSelectedEvidenceId('evi-test-basic');
    setSelectedSkillId('skill-testing');
    setActiveContractId('contract-api-testing');
  };

  return (
    <ProofStackContext.Provider
      value={{
        repository,
        contributors,
        provenanceChecks,
        commits,
        skills,
        evidenceItems,
        contracts,
        activities,
        selectedSkillFilter,
        setSelectedSkillFilter,
        selectedStatusFilter,
        setSelectedStatusFilter,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        selectedEvidenceId,
        setSelectedEvidenceId,
        selectedSkillId,
        setSelectedSkillId,
        activeContractId,
        setActiveContractId,
        runAudit,
        isAuditing,
        updateContractStatus,
        submitContract,
        acceptContractEvidence,
        addReviewerNote,
        markEvidenceReviewed,
        resetDemoData,
        metrics,
      }}
    >
      {children}
    </ProofStackContext.Provider>
  );
};

export const useProofStack = () => {
  const context = useContext(ProofStackContext);
  if (!context) {
    throw new Error('useProofStack must be used within a ProofStackProvider');
  }
  return context;
};
