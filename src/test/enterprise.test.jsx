import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EnterpriseRecruiterPage } from '../pages/EnterpriseRecruiterPage';
import { AuthProvider } from '../context/AuthContext';
import { ProofStackProvider } from '../context/ProofStackContext';
const renderEnterprisePage = () => {
    return render(<BrowserRouter>
      <AuthProvider>
        <ProofStackProvider>
          <EnterpriseRecruiterPage />
        </ProofStackProvider>
      </AuthProvider>
    </BrowserRouter>);
};
describe('Enterprise Recruiter Hub & Multi-Tenancy Suite', () => {
    it('renders enterprise header and core KPIs', async () => {
        renderEnterprisePage();
        expect(screen.getByText(/Cryptographic code verification portal/i)).toBeInTheDocument();
        expect(screen.getByText(/AST Code Proof Rate/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Hollow Signals Refused/i).length).toBeGreaterThan(0);
    });
    it('switches between Candidate Evaluations, Team RBAC, and SOC2 Audit Trail tabs', async () => {
        renderEnterprisePage();
        // Click Team & RBAC tab
        const teamTab = screen.getByText(/Team & RBAC/i);
        fireEvent.click(teamTab);
        expect(screen.getByText(/Organization Members & Roles/i)).toBeInTheDocument();
        // Click SOC2 Audit Trail tab
        const auditTab = screen.getByText(/SOC2 Audit Trail/i);
        fireEvent.click(auditTab);
        expect(screen.getByText(/Immutable Audit Ledger/i)).toBeInTheDocument();
        expect(screen.getByText(/SOC2 Type II Ready/i)).toBeInTheDocument();
        // Switch back to Candidates
        const candidatesTab = screen.getByText(/Candidate Evaluations/i);
        fireEvent.click(candidatesTab);
        expect(screen.getByPlaceholderText(/Filter candidate, role, or github/i)).toBeInTheDocument();
    });
    it('opens and closes the Evaluate Candidate modal', () => {
        renderEnterprisePage();
        const evaluateBtn = screen.getByRole('button', { name: /Evaluate Candidate/i });
        fireEvent.click(evaluateBtn);
        expect(screen.getByText(/Evaluate Candidate Portfolio/i)).toBeInTheDocument();
        expect(screen.getByText(/Trigger AST extraction and cryptographic proof analysis/i)).toBeInTheDocument();
        const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelBtn);
        expect(screen.queryByText(/Trigger AST extraction and cryptographic proof analysis/i)).not.toBeInTheDocument();
    });
});
