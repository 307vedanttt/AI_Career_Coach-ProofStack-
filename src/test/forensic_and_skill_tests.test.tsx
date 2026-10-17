import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProofStackProvider } from '../context/ProofStackContext';
import { DeepResumeAuditPanel } from '../components/resume/DeepResumeAuditPanel';
import { CodeQualityTestsPage } from '../pages/CodeQualityTestsPage';
import { DeepForensicResult, CodeQualityTestSession } from '../types/api';
import * as api from '../lib/api';

const mockForensicData: DeepForensicResult = {
  google_xyz_audit: {
    score: 85,
    metric_density_pct: 75,
    power_verb_pct: 90,
    total_bullets_analyzed: 4,
    compliant_bullets_count: 3,
    bullets: [
      {
        id: 'bullet-1',
        original_text: 'Architected distributed API with FastAPI reducing latency by 35%.',
        status: 'exemplary_xyz',
        word_count: 10,
        starts_with_power_verb: true,
        has_quantifiable_metrics: true,
        has_first_person_pronouns: false,
        critique: [],
        google_xyz_rewrite: 'Architected distributed API with FastAPI by implementing automated validation workflows, achieving 35% latency reduction.'
      },
      {
        id: 'bullet-2',
        original_text: 'Worked on database queries and system performance optimization.',
        status: 'needs_work',
        word_count: 8,
        starts_with_power_verb: false,
        has_quantifiable_metrics: false,
        has_first_person_pronouns: false,
        critique: ['Missing quantifiable metrics', "Weak/passive verb ('worked')"],
        google_xyz_rewrite: 'Engineered database query optimizations by adding indexed AST reachability, achieving 40% QPS throughput gain.'
      }
    ]
  },
  section_health: {
    overall_score: 88,
    contact: {
      score: 90,
      checklist: [
        { item: 'Direct Email Address', present: true, impact: 'Critical for recruiter outreach' },
        { item: 'GitHub Profile Permalinks', present: true, impact: 'Essential for code provenance verification' }
      ]
    },
    summary: {
      present: true,
      has_first_person_flaw: false,
      score: 85,
      critique: 'Optimal 3-sentence summary.'
    },
    experience: {
      present: true,
      detected_milestones: 2,
      bullet_count: 4,
      score: 90,
      critique: 'Sufficient bullet depth.'
    },
    skills: {
      present: true,
      categorized_breakdown: {
        Languages: ['python', 'typescript'],
        Databases: ['postgresql']
      },
      covered_categories_count: 2,
      score: 80,
      critique: 'Good distribution.'
    },
    education: {
      present: true,
      score: 95,
      critique: 'Clean academic background.'
    }
  },
  claim_vs_reality_matrix: {
    proof_integrity_index: 80,
    verified_claims_count: 2,
    unsubstantiated_risks_count: 1,
    verified_claims: [
      {
        skill: 'Python',
        status: 'VERIFIED_PROOF',
        evidence_file: 'backend/api/routes.py',
        line_range: 'L12–L30',
        confidence: 'HIGH',
        provenance_summary: 'Active FastAPI route handler.'
      }
    ],
    unsubstantiated_risks: [
      {
        skill: 'Kubernetes',
        status: 'UNSUBSTANTIATED_RISK',
        reason: 'Claimed in resume, but 0 AST proof signals found across connected repositories.',
        risk_level: 'MODERATE',
        action_required: 'Push a commit with k8s deployment manifest.'
      }
    ]
  },
  code_anchored_rewrites: [
    {
      original: 'Worked on backend APIs.',
      improved: 'Architected high-throughput REST APIs in FastAPI with parameterized SQL queries.',
      evidence_anchor: 'backend/api/routes.py',
      impact_gain: '+42% ATS Recruiter Scoring'
    }
  ],
  generated_at: '2026-10-17T12:00:00Z'
};

const mockTestSession: CodeQualityTestSession = {
  test_session_id: 'cqt-test-1234',
  repo_name: 'AI-CarrerCoach',
  total_questions: 2,
  estimated_minutes: 10,
  questions: [
    {
      id: 'cq-test-sec-01',
      category: 'Security & Injection Prevention',
      difficulty: 'Intermediate',
      repo_name: 'AI-CarrerCoach',
      file_path: 'backend/services/detectors/sql_detector.py',
      line_target: 'L42–L54',
      code_context: 'def extract_sql(): pass',
      question: 'How should raw SQL regex parsing be refactored to prevent ReDoS?',
      options: [
        'A) Use re.escape or compile AST lexical parser.',
        'B) Increase sys.setrecursionlimit to 50000.',
        'C) Wrap in bare try...except: pass.',
        'D) Convert string to uppercase.'
      ],
      correct_option_index: 0,
      explanation: 'Using re.escape prevents catastrophic backtracking.'
    },
    {
      id: 'cq-test-inv-02',
      category: 'Testing Invariants',
      difficulty: 'Advanced',
      repo_name: 'AI-CarrerCoach',
      file_path: 'backend/tests/test_api.py',
      line_target: 'L10–L25',
      code_context: 'def test(): assert True',
      question: 'How should hollow assertion assert True be replaced?',
      options: [
        'A) Sleep 1 second.',
        'B) Validate payload schema digest and assert negative edge cases.',
        'C) Duplicate assert 3 times.',
        'D) Catch all exceptions.'
      ],
      correct_option_index: 1,
      explanation: 'Testing invariants ensures payload integrity.'
    }
  ],
  generated_at: '2026-10-17T12:00:00Z'
};

describe('Deep Resume Forensic & Code Quality Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders DeepResumeAuditPanel with Google XYZ metrics and allows switching tabs', async () => {
    vi.spyOn(api, 'getDeepResumeForensic').mockResolvedValue(mockForensicData);

    render(<DeepResumeAuditPanel resumeId="test-res" />);

    await waitFor(() => {
      expect(screen.getByText('Deep Resume Analysis')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    // Verify first bullet rendered
    expect(screen.getAllByText(/Architected distributed API with FastAPI/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Exemplary XYZ')).toBeInTheDocument();

    // Switch to Claim vs Reality Matrix tab
    const matrixTab = screen.getByText(/Claim vs Code Reality Matrix/i);
    fireEvent.click(matrixTab);

    expect(screen.getByText(/VERIFIED REPO CLAIMS/i)).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText(/UNSUBSTANTIATED RISKS/i)).toBeInTheDocument();
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();

    // Switch to Code-Anchored Rewrites tab
    const rewritesTab = screen.getByText(/Code-Anchored Rewrites/i);
    fireEvent.click(rewritesTab);

    expect(screen.getByText(/backend\/api\/routes\.py/i)).toBeInTheDocument();
    expect(screen.getByText(/\+42% ATS Recruiter Scoring/i)).toBeInTheDocument();
  });

  it('renders CodeQualityTestsPage and handles option selection and submission', async () => {
    vi.spyOn(api, 'getCodeQualityTests').mockResolvedValue(mockTestSession);
    vi.spyOn(api, 'submitCodeQualityTests').mockResolvedValue({
      test_session_id: 'cqt-test-1234',
      score_percent: 100,
      correct_count: 2,
      total_questions: 2,
      mastery_label: 'CODE ARCHITECT (LEVEL 3)',
      cryptographic_proof_hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      results_breakdown: [
        { question_id: 'cq-test-sec-01', user_selected_index: 0, correct_index: 0, is_correct: true },
        { question_id: 'cq-test-inv-02', user_selected_index: 1, correct_index: 1, is_correct: true }
      ],
      passed: true,
      evaluation_time: '2026-10-17T12:05:00Z'
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProofStackProvider>
            <CodeQualityTestsPage />
          </ProofStackProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Code-Quality Skill Tests')).toBeInTheDocument();
      expect(screen.getByText('AI-CarrerCoach')).toBeInTheDocument();
      expect(screen.getByText(/How should raw SQL regex parsing be refactored/i)).toBeInTheDocument();
    });

    // Select option A for Question 1
    const optionA = screen.getByText(/A\) Use re\.escape or compile AST lexical parser\./i);
    fireEvent.click(optionA);

    // Click Next Challenge
    const nextBtn = screen.getByText('Next Challenge');
    fireEvent.click(nextBtn);

    // Verify Question 2 is displayed
    expect(screen.getByText(/How should hollow assertion assert True be replaced/i)).toBeInTheDocument();

    // Select option B for Question 2
    const optionB = screen.getByText(/B\) Validate payload schema digest and assert negative edge cases\./i);
    fireEvent.click(optionB);

    // Submit test
    const submitBtn = screen.getByText(/Submit & Sign Attestation/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/CODE ARCHITECT \(LEVEL 3\)/i)).toBeInTheDocument();
      expect(screen.getByText(/VERIFIED CLEARANCE/i)).toBeInTheDocument();
      expect(screen.getByText(/100%/i)).toBeInTheDocument();
    });
  });
});
