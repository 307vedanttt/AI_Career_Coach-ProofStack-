import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LandingNav } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';
import { FinalCtaSection } from '../components/landing/FinalCtaSection';
import { LandingFooter } from '../components/landing/LandingFooter';
describe('Landing Page Components & Accessibility Tests', () => {
    it('renders LandingNav with accessible banner landmark and brand link', () => {
        render(<BrowserRouter>
        <LandingNav />
      </BrowserRouter>);
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /ProofStack Homepage/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Analyze my repository/i })).toBeInTheDocument();
    });
    it('renders HeroSection with word-by-word headline and action buttons', () => {
        render(<BrowserRouter>
        <HeroSection />
      </BrowserRouter>);
        expect(screen.getByRole('region', { name: /ProofStack Introduction Hero/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Analyze my repository now/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /See How It Proves It/i })).toBeInTheDocument();
    });
    it('renders FinalCtaSection with docket receipt and navigation links', () => {
        render(<BrowserRouter>
        <FinalCtaSection />
      </BrowserRouter>);
        expect(screen.getByRole('region', { name: /Call to Action: Analyze Repository/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Launch interactive demo in styleguide/i })).toBeInTheDocument();
        expect(screen.getByText(/EVIDENCE DOCKET RECEIPT/i)).toBeInTheDocument();
    });
    it('renders LandingFooter with honest notice and landmarks', () => {
        render(<BrowserRouter>
        <LandingFooter />
      </BrowserRouter>);
        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
        expect(screen.getByText(/Evidence of use, not a ranking of people/i)).toBeInTheDocument();
    });
    it('handles prefers-reduced-motion gracefully', () => {
        // Mock matchMedia for prefers-reduced-motion: reduce
        window.matchMedia = vi.fn().mockImplementation((query) => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));
        const { unmount } = render(<BrowserRouter>
        <HeroSection />
      </BrowserRouter>);
        expect(screen.getByRole('region', { name: /ProofStack Introduction Hero/i })).toBeInTheDocument();
        unmount();
    });
});
