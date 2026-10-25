import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Stamp, ReceiptCard, CodeBlock, CoverageGauge, Chip, HealthChip, CounterChip, RecommendationCard, Treemap, Seal, ChainBlock, Button, } from '../components';
describe('Shared Component Library Unit Tests', () => {
    // 1. Stamp Tests
    describe('Stamp', () => {
        it('renders and has accessible label', () => {
            render(<Stamp status="proven"/>);
            const stamp = screen.getByRole('status', { name: /PROVEN status/i });
            expect(stamp).toBeInTheDocument();
            expect(stamp).toHaveTextContent('PROVEN');
        });
        it('escapes text properly and supports custom labels', () => {
            const dangerousLabel = '<script>alert(1)</script>';
            render(<Stamp status="attack" label={dangerousLabel}/>);
            const stamp = screen.getByRole('status');
            // Escaped properly, not executed or parsed as DOM script
            expect(stamp).toHaveTextContent('<script>alert(1)</script>');
            expect(document.querySelector('script:not([type])')).toBeNull();
        });
        it('renders all required status variants', () => {
            const statuses = [
                'proven',
                'basic',
                'not_shown',
                'unclear',
                'attack',
                'refused',
                'hollow',
                'fulfilled',
                'partly',
                'not_fulfilled',
            ];
            statuses.forEach((status) => {
                const { unmount } = render(<Stamp status={status}/>);
                expect(screen.getByRole('status')).toBeInTheDocument();
                unmount();
            });
        });
    });
    // 2. ReceiptCard Tests
    describe('ReceiptCard', () => {
        it('renders content with accessible label and serial', () => {
            render(<ReceiptCard serial="REC-0042" timestamp="2026-10-16 14:00 UTC">
          <p>Receipt verification body</p>
        </ReceiptCard>);
            expect(screen.getByRole('article', { name: /Physical Proof Receipt/i })).toBeInTheDocument();
            expect(screen.getByText('REC-0042')).toBeInTheDocument();
            expect(screen.getByText('Receipt verification body')).toBeInTheDocument();
        });
        it('escapes child text and prevents HTML injection', () => {
            const untrustedData = '<img src=x onerror=alert(1)>';
            render(<ReceiptCard>{untrustedData}</ReceiptCard>);
            expect(screen.getByText(untrustedData)).toBeInTheDocument();
            expect(document.querySelector('img[src="x"]')).toBeNull();
        });
    });
    // 3. CodeBlock Tests
    describe('CodeBlock', () => {
        it('renders code with line numbers and accessible region', () => {
            const snippet = 'const a = 1;\nconst b = 2;\nconst c = a + b;';
            render(<CodeBlock code={snippet} fileName="src/orders.py" highlightLines={[2]} highlightType="emerald"/>);
            expect(screen.getByRole('region', { name: /Source code evidence preview/i })).toBeInTheDocument();
            expect(screen.getByText('src/orders.py')).toBeInTheDocument();
            expect(screen.getByText('const a = 1;')).toBeInTheDocument();
            expect(screen.getByText('const b = 2;')).toBeInTheDocument();
        });
        it('strictly escapes code text and does not render HTML tags', () => {
            const maliciousSnippet = '<b id="injected-tag">alert</b>';
            render(<CodeBlock code={maliciousSnippet}/>);
            expect(document.getElementById('injected-tag')).toBeNull();
            expect(screen.getByText(maliciousSnippet)).toBeInTheDocument();
        });
    });
    // 4. CoverageGauge Tests
    describe('CoverageGauge', () => {
        it('renders Instrument Serif percentage, Evidence coverage, and requirements sublabel', () => {
            render(<CoverageGauge percentage={58} assessedCount={7} totalCount={10}/>);
            const gauge = screen.getByRole('meter', { name: /Evidence coverage 58%/i });
            expect(gauge).toBeInTheDocument();
            expect(gauge).toHaveAttribute('aria-valuenow', '58');
            expect(screen.getByText('58%')).toBeInTheDocument();
            expect(screen.getByText('Evidence coverage')).toBeInTheDocument();
            expect(screen.getByText('assessed 7 of 10 requirements')).toBeInTheDocument();
        });
    });
    // 5. Chips Tests
    describe('Chips (Chip, HealthChip, CounterChip)', () => {
        it('renders Chip with accessible content', () => {
            render(<Chip label="python" variant="proven"/>);
            expect(screen.getByText('python')).toBeInTheDocument();
        });
        it('renders HealthChip with pulse dot and operational state', () => {
            render(<HealthChip label="GitHub" isHealthy={true}/>);
            const health = screen.getByRole('status', { name: /GitHub service is operational/i });
            expect(health).toBeInTheDocument();
            expect(screen.getByText('GitHub')).toBeInTheDocument();
        });
        it('renders CounterChip with count and label', () => {
            render(<CounterChip label="Hollow signals refused" count={14} variant="attack"/>);
            const counter = screen.getByRole('status', { name: /Hollow signals refused: 14/i });
            expect(counter).toBeInTheDocument();
            expect(screen.getByText('14')).toBeInTheDocument();
        });
    });
    // 6. RecommendationCard Tests
    describe('RecommendationCard', () => {
        it('renders RECOMMENDATION tag, dashed styling, and escaped text', () => {
            const handleAction = vi.fn();
            render(<RecommendationCard title="Add SQLite query to db/queries.py" delta="+14 PTS" targetRequirement="SQL" buttonLabel="Execute Dry Run" onAction={handleAction}/>);
            expect(screen.getByRole('region', { name: /Actionable Recommendation/i })).toBeInTheDocument();
            expect(screen.getByText('RECOMMENDATION')).toBeInTheDocument();
            expect(screen.getByText('+14 PTS')).toBeInTheDocument();
            expect(screen.getByText('Add SQLite query to db/queries.py')).toBeInTheDocument();
            const button = screen.getByRole('button', { name: /Execute Dry Run/i });
            fireEvent.click(button);
            expect(handleAction).toHaveBeenCalledTimes(1);
        });
    });
    // 7. Treemap & TreemapTile Tests
    describe('Treemap & TreemapTile', () => {
        it('renders treemap with required legend "Rectangle size = file size only"', () => {
            const items = [
                {
                    id: '1',
                    name: 'orders.py',
                    path: 'api/routes/orders.py',
                    size: 420,
                    status: 'proven',
                    meta: '420 SLOC',
                    isPulsing: true,
                },
                {
                    id: '2',
                    name: 'db/queries.py',
                    path: 'db/queries.py',
                    size: 120,
                    status: 'not_shown',
                },
            ];
            const handleSelect = vi.fn();
            render(<Treemap items={items} onSelectTile={handleSelect}/>);
            expect(screen.getByRole('region', { name: /Repository Proof Treemap/i })).toBeInTheDocument();
            // Exact string required by user prompt
            expect(screen.getByText(/Rectangle size = file size only/i)).toBeInTheDocument();
            expect(screen.getByText('orders.py')).toBeInTheDocument();
            const tile = screen.getByRole('button', { name: /orders\.py/i });
            fireEvent.click(tile);
            expect(handleSelect).toHaveBeenCalledWith(items[0]);
        });
    });
    // 8. Seal and ChainBlock Tests
    describe('Seal and ChainBlock', () => {
        it('renders Seal with accessible label', () => {
            render(<Seal label="ATTESTED PROOF" sublabel="VERIFIED MERKLE LEDGER" status="proven"/>);
            expect(screen.getByRole('img', { name: /ATTESTED PROOF - VERIFIED MERKLE LEDGER/i })).toBeInTheDocument();
        });
        it('renders ChainBlock with block height, hashes, and copy button', () => {
            render(<ChainBlock blockHeight={842} commitHash="9f3c2ab" previousHash="e4a110f" timestamp="14:02:18 UTC" invariantsProven={4} author="Rohan" merkleRoot="0x981A7b91c...4f02"/>);
            expect(screen.getByRole('article', { name: /Ledger Block 842 for commit 9f3c2ab/i })).toBeInTheDocument();
            expect(screen.getByText('BLOCK #0842')).toBeInTheDocument();
            expect(screen.getByText('9f3c2ab')).toBeInTheDocument();
            expect(screen.getByText('+4 Invariant Checks')).toBeInTheDocument();
        });
    });
    // 9. Button Tests
    describe('Button', () => {
        it('renders all four variants: solid paper, solid ink, ghost, quiet text', () => {
            const { rerender } = render(<Button variant="solid_paper">Paper Button</Button>);
            expect(screen.getByRole('button', { name: /Paper Button/i })).toHaveClass('bg-[#F8FAFC]');
            rerender(<Button variant="solid_ink">Ink Button</Button>);
            expect(screen.getByRole('button', { name: /Ink Button/i })).toHaveClass('bg-[#0F172A]');
            rerender(<Button variant="ghost">Ghost Button</Button>);
            expect(screen.getByRole('button', { name: /Ghost Button/i })).toBeInTheDocument();
            rerender(<Button variant="quiet_text">Quiet Button</Button>);
            expect(screen.getByRole('button', { name: /Quiet Button/i })).toBeInTheDocument();
        });
        it('escapes content and handles click events', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>&lt;Click Me&gt;</Button>);
            const btn = screen.getByRole('button', { name: /<Click Me>/i });
            fireEvent.click(btn);
            expect(handleClick).toHaveBeenCalledTimes(1);
        });
    });
});
