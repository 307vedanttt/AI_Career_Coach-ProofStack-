import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import {
  getAssessments,
  getEvidence,
  getContracts,
  postDryRun,
  getProofMap,
} from '../lib/api';
import { DashboardPage } from '../pages/DashboardPage';
import { ContractsPage } from '../pages/ContractsPage';
import { EvidenceDrawer } from '../components/drawer/EvidenceDrawer';
import { mockEvidenceItems, mockRejectedCandidates } from '../lib/api';

describe('App Screens & Data Layer Tests', () => {
  // 1. Data Layer API Tests
  describe('API Layer Functions', () => {
    it('fetches assessments and returns 7 requirements', async () => {
      const assessments = await getAssessments();
      expect(assessments.length).toBe(7);
      expect(assessments[0].requirementName).toBe('SQL');
    });

    it('fetches evidence item with audit trail and code', async () => {
      const evidence = await getEvidence('evi-rest');
      expect(evidence.title).toBe('REST API');
      expect(evidence.status).toBe('proven');
      expect(evidence.code).toContain('APIRouter');
    });

    it('fetches contracts and executes dry-run simulation', async () => {
      const contracts = await getContracts();
      expect(contracts.length).toBe(4);
      expect(contracts[0].requirementTarget).toBe('SQL');

      const dryRunResult = await postDryRun(contracts[0].id);
      expect(dryRunResult.beforePercentage).toBe(58);
      expect(dryRunResult.afterPercentage).toBe(72);
      expect(dryRunResult.status).toBe('fulfilled');
    });

    it('fetches proofmap with 4 commit snapshots', async () => {
      const proofMap = await getProofMap();
      expect(proofMap.snapshots.length).toBe(4);
      expect(proofMap.activeSnapshot.percentage).toBe(58);
      expect(proofMap.files.length).toBe(9);
    });
  });

  // 2. Dashboard Screen Tests
  describe('Dashboard Screen (/app)', () => {
    it('renders top health strip, requirements list, and proof map', () => {
      render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );

      // Top strip
      expect(screen.getByText('Files analyzed')).toBeInTheDocument();
      expect(screen.getByText('Push to verdict')).toBeInTheDocument();
      expect(screen.getAllByText('14').length).toBeGreaterThan(0);

      // Requirements list
      expect(screen.getByText('SQL')).toBeInTheDocument();
      expect(screen.getByText('REST API')).toBeInTheDocument();
      expect(screen.getByText('7 SCOPED')).toBeInTheDocument();

      // Center Proof Map
      expect(screen.getByText('LIVE MERKLE SYNC')).toBeInTheDocument();
      expect(screen.getByText(/Rectangle size = file size only/i)).toBeInTheDocument();

      // Right column gauge & recommendation
      expect(screen.getByText('Evidence coverage')).toBeInTheDocument();
      expect(screen.getByText(/Add one query \+ one test/i)).toBeInTheDocument();
    });

    it('supports interactive state switching for judge inspection', () => {
      render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );

      // Switch to empty state
      fireEvent.click(screen.getByRole('button', { name: /^Empty$/i }));
      expect(screen.getByText(/No active repository connected/i)).toBeInTheDocument();

      // Switch to rate-limited state
      fireEvent.click(screen.getByRole('button', { name: /Rate Limited/i }));
      expect(screen.getByText(/GitHub Rate Limit Reached/i)).toBeInTheDocument();

      // Switch to error state
      fireEvent.click(screen.getByRole('button', { name: /^Error$/i }));
      expect(screen.getByText(/Connection to Engine Severed/i)).toBeInTheDocument();

      // Reset back to normal
      fireEvent.click(screen.getByRole('button', { name: /^Normal$/i }));
      expect(screen.getByText('LIVE MERKLE SYNC')).toBeInTheDocument();
    });
  });

  // 3. Commit Contracts Screen Tests
  describe('Commit Contracts Screen (/app/contracts)', () => {
    it('renders keynote requirement headline and coach record', () => {
      render(
        <BrowserRouter>
          <ContractsPage />
        </BrowserRouter>
      );

      expect(screen.getByText(/Predictive Invariant Acceptance/i)).toBeInTheDocument();
      expect(screen.getByText(/3 fulfilled/i)).toBeInTheDocument();
      expect(screen.getByText(/1 partly/i)).toBeInTheDocument();
      expect(screen.getByText(/1 missed/i)).toBeInTheDocument();
      expect(screen.getByText(/Formal Invariant Conditions/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Execute Dry Run on Contract/i })).toBeInTheDocument();
    });

    it('triggers dry-run contract execution and slams final stamp', async () => {
      render(
        <BrowserRouter>
          <ContractsPage />
        </BrowserRouter>
      );

      const dryRunBtn = screen.getByRole('button', { name: /Execute Dry Run on Contract/i });
      fireEvent.click(dryRunBtn);

      // Wait for predicted coverage boost banner
      await waitFor(
        () => {
          expect(screen.getByText(/PREDICTED COVERAGE BOOST/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });

  // 4. Evidence Drawer Tests
  describe('Evidence Drawer', () => {
    it('renders PROVEN evidence and toggles to candidate HOLLOW variant', async () => {
      const handleClose = () => {};
      render(
        <EvidenceDrawer
          isOpen={true}
          onClose={handleClose}
          evidence={mockEvidenceItems['evi-rest']}
          rejectedCandidate={mockRejectedCandidates['cand-sql']}
        />
      );

      // Default PROVEN view
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('REST API')).toBeInTheDocument();
      expect(screen.getByText('Mounted route')).toBeInTheDocument();

      // Toggle to Candidate (HOLLOW)
      const hollowBtn = screen.getByRole('button', { name: /Candidate \(HOLLOW\)/i });
      fireEvent.click(hollowBtn);

      await waitFor(() => {
        expect(screen.getByText('Automated Testing Invariant')).toBeInTheDocument();
        expect(screen.getByText(/Hollow Signal Guard Triggered/i)).toBeInTheDocument();
      });
    });

    it('calls onClose when close button is clicked', () => {
      let closed = false;
      render(
        <EvidenceDrawer
          isOpen={true}
          onClose={() => {
            closed = true;
          }}
          evidence={mockEvidenceItems['evi-rest']}
        />
      );

      const closeBtn = screen.getByRole('button', { name: /Close evidence inspection drawer/i });
      fireEvent.click(closeBtn);
      expect(closed).toBe(true);
    });
  });

  // 5. Break-Me Adversarial Scoreboard Tests
  describe('Adversarial Scoreboard (/breakme)', () => {
    it('renders adversarial suite with 3 big counters, template picker and streaming table', async () => {
      const { BreakMePage } = await import('../pages/BreakMePage');
      render(
        <BrowserRouter>
          <BreakMePage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Adversarial Fuzz & Fraud Resistance Ledger/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/AIR-GAPPED EVALUATION/i)).toBeInTheDocument();
        expect(screen.getByText(/Upgrades Granted/i)).toBeInTheDocument();
        expect(screen.getByText(/GUARD INVARIANT INTACT/i)).toBeInTheDocument();
        expect(screen.getByText(/INJECTION TEMPLATE MATRIX/i)).toBeInTheDocument();
      });
    });
  });

  // 6. Resume Attestation Dossier Tests
  describe('Resume Attestation Dossier (/resume)', () => {
    it('renders physical A4 dossier with candidate, footnotes, legend, and QR', async () => {
      const { ResumePage } = await import('../pages/ResumePage');
      render(
        <BrowserRouter>
          <ResumePage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('ROHAN VERMA')).toBeInTheDocument();
        expect(screen.getAllByText(/AUDIT IDENTIFIER/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/Attested Technical Skills/i)).toBeInTheDocument();
        expect(screen.getByText(/Evidence Status Legend/i)).toBeInTheDocument();
        expect(screen.getByText(/Export PDF/i)).toBeInTheDocument();
        expect(screen.getByText(/Copy Proof Link/i)).toBeInTheDocument();
      });
    });
  });

  // 7. Verify Ledger Page Tests
  describe('Verify Ledger Page (/verify)', () => {
    it('renders 8-block chain, CHAIN VALID seal, and required quote', async () => {
      const { VerifyPage } = await import('../pages/VerifyPage');
      render(
        <BrowserRouter>
          <VerifyPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Receipts prove our record was not changed/i)
        ).toBeInTheDocument();
        expect(screen.getByText('BLOCK #0001')).toBeInTheDocument();
        expect(screen.getByText('BLOCK #0008')).toBeInTheDocument();
      });
    });

    it('toggles tampered variant showing broken link and shake', async () => {
      const { VerifyPage } = await import('../pages/VerifyPage');
      render(
        <BrowserRouter>
          <VerifyPage />
        </BrowserRouter>
      );

      const tamperBtn = screen.getByRole('button', { name: /Simulate broken tamper link/i });
      fireEvent.click(tamperBtn);

      await waitFor(() => {
        expect(screen.getByText('CHAIN BROKEN')).toBeInTheDocument();
        expect(screen.getAllByText('LINK BROKEN').length).toBeGreaterThan(0);
      });
    });
  });

  // 8. Public Repo Scanner Tests
  describe('Public Repo Scanner (/app/scanner)', () => {
    it('allows entering github handle and running audit scan', async () => {
      const { ScannerPage } = await import('../pages/ScannerPage');
      render(
        <BrowserRouter>
          <ScannerPage />
        </BrowserRouter>
      );

      expect(screen.getByText('Audit Public Proof')).toBeInTheDocument();
      const input = screen.getByPlaceholderText(/e\.g\. rohan or octocat/i);
      expect(input).toHaveValue('octocat');

      const scanBtn = screen.getByRole('button', { name: /Scan & Attest Invariants/i });
      fireEvent.click(scanBtn);

      await waitFor(
        () => {
          expect(screen.getByText('Audit Receipt #0492-ZK')).toBeInTheDocument();
          expect(screen.getByText('58%')).toBeInTheDocument();
          expect(screen.getByText('AUDIT SEALED')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  // 9. How We Judge Specification Page Tests
  describe('How We Judge Page (/how-we-judge)', () => {
    it('renders SPEC sections 4.5, 4.6, 4.7, and 8.5', async () => {
      const { HowWeJudgePage } = await import('../pages/HowWeJudgePage');
      render(
        <BrowserRouter>
          <HowWeJudgePage />
        </BrowserRouter>
      );

      expect(screen.getByText(/How We Judge: Signal Weights, Caps & Invariant Rules/i)).toBeInTheDocument();
      expect(screen.getByText(/SPEC § 4.5/i)).toBeInTheDocument();
      expect(screen.getByText(/SPEC § 4.6/i)).toBeInTheDocument();
      expect(screen.getByText(/SPEC § 4.7/i)).toBeInTheDocument();
      expect(screen.getByText(/SPEC § 8.5/i)).toBeInTheDocument();
      expect(screen.getByText(/Receipts prove our record was not changed/i)).toBeInTheDocument();
    });
  });
});
