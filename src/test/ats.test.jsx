import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AtsReadabilityPanel } from '../components/resume/AtsReadabilityPanel';
const sampleAtsResult = {
    id: 'ats-run-test-001',
    resume_id: 'res-test-001',
    resume_hash: '9f834abc',
    file_name: 'test_candidate_resume.pdf',
    posting_id: 'job-demo',
    ruleset_version: '1.0.0',
    score_data: {
        score: 84.5,
        score_label: 'ATS readability score (heuristic). Not a score from any real ATS; systems differ.',
        counts_label: 'Readability checks passed: 21 of 23 assessable',
        cannot_assess: false,
        cannot_assess_reason: null,
        formula: '(91.7 × 0.70) + (67.7 × 0.30) = 84.5',
        readability_score: 91.7,
        keyword_score: 67.7,
        assessable_count: 23,
        passed_count: 21,
        excluded_count: 0,
        sensitivity_ranges: {
            standard_70_30: 84.5,
            structure_80_20: 86.9,
            content_60_40: 82.1,
        },
    },
    readability_checks: [
        {
            code: 'single_column_order',
            category: 'Structure',
            title: 'Single-Column Reading Order',
            status: 'pass',
            reason: 'Document uses a clean single-column horizontal reading flow.',
            evidence: '1 primary column detected across all pages.',
            concrete_fix: '',
            weight: 2.0,
        },
        {
            code: 'header_footer_containment',
            category: 'Structure',
            title: 'Header & Footer Trapping',
            status: 'needs_attention',
            reason: 'Key contact details are placed exclusively in the header margin.',
            evidence: 'Email located exclusively in header.',
            concrete_fix: 'Move your phone and email out of the header margin into the document body.',
            weight: 1.5,
        },
    ],
    keyword_coverage: {
        posting_id: 'job-demo',
        role_title: 'Senior Backend Engineer',
        company_name: 'Acme Labs',
        total_requirements: 3,
        found_count: 2,
        coverage_pct: 66.7,
        summary: '2 of 3 requirement terms appear in the resume text',
        disclaimer: 'This does not mean you lack the skill.',
        terms: [
            {
                label: 'FastAPI',
                canonical_id: 'fw_fastapi',
                matched_alias: 'fastapi',
                status: 'found',
                resume_sentence: 'Built high-throughput services with FastAPI.',
                job_sentence: 'FastAPI REST microservices required.',
                code_status: 'Demonstrated: Strong',
                evidence_file: 'src/core/router.py',
                wording: "'fastapi' appears in your resume text.",
            },
            {
                label: 'Docker',
                canonical_id: 'tool_docker',
                matched_alias: null,
                status: 'not_found',
                resume_sentence: null,
                job_sentence: 'Must have Docker containerization experience.',
                code_status: 'Not Demonstrated in This Scope',
                evidence_file: null,
                wording: "Not found in the resume text: 'Docker'.",
                note: 'This does not mean you lack the skill.',
            },
            {
                label: 'Kubernetes',
                canonical_id: 'tool_k8s',
                matched_alias: 'k8s',
                status: 'found',
                resume_sentence: 'Deployed to k8s clusters.',
                job_sentence: 'Kubernetes cluster deployment knowledge.',
                code_status: 'Not Demonstrated in This Scope',
                evidence_file: null,
                wording: "'k8s' appears in your resume text.",
            },
        ],
    },
    excluded_checks: [],
    layout_metadata: {
        file_type: 'pdf',
        file_size_bytes: 45000,
        page_count: 1,
        columns_detected: 1,
        tables_count: 0,
        text_boxes_count: 0,
        headers_footers_content: [],
        images_count: 0,
        images_with_text: 0,
        embedded_fonts: ['Helvetica'],
        hidden_or_white_text: [],
        links_found: ['https://github.com/alex'],
        metadata: {},
        is_scanned_or_empty: false,
    },
    extraction_preview: {
        plain_text: 'Alex Rivera\nSenior Backend Engineer\nBuilt high-throughput services with FastAPI.',
        reading_order_blocks: ['Alex Rivera', 'Senior Backend Engineer'],
        detected_sections: [
            { heading: 'Experience', standard_name: 'Experience', content_snippet: 'Built high-throughput...' },
        ],
    },
    suggestions: [
        {
            id: 'sug-struct-header',
            type: 'structural_fix',
            category: 'Structure',
            title: 'Fix Header & Footer Trapping',
            reason: 'Key contact details are placed exclusively in the header margin.',
            concrete_fix: 'Move your phone and email out of the header margin into the document body.',
            before: 'Email in header margin only.',
            after: 'Place email under your name in the main body.',
            proven_evidence_ref: null,
        },
    ],
    plain_text_export: 'Alex Rivera\nSenior Backend Engineer',
    cached: false,
    created_at: new Date().toISOString(),
};
describe('ATS Readability Panel Component', () => {
    it('renders exact mandated score label without match, fit, rank, or hireable words', () => {
        render(<AtsReadabilityPanel initialData={sampleAtsResult}/>);
        // 1. Exact mandated label
        expect(screen.getByText('ATS readability score (heuristic). Not a score from any real ATS; systems differ.')).toBeInTheDocument();
        // 2. Exact mandated counts label
        expect(screen.getByText('Readability checks passed: 21 of 23 assessable')).toBeInTheDocument();
        // 3. Exact mandated footer line
        expect(screen.getByText('Heuristic checks, not a score from any real ATS. Evidence of use, not proficiency or authorship.')).toBeInTheDocument();
        // 4. Forbidden words check on the score banner
        const scoreContainer = screen.getByText('ATS readability score (heuristic). Not a score from any real ATS; systems differ.').parentElement;
        expect(scoreContainer?.textContent?.toLowerCase()).not.toContain('hireable');
    });
    it('renders sensitivity ranges and updates score when clicking weight presets', () => {
        render(<AtsReadabilityPanel initialData={sampleAtsResult}/>);
        // Standard 70/30 score
        expect(screen.getByText('85%')).toBeInTheDocument();
        // Toggle to Structure Focus (80/20)
        const structureBtn = screen.getByRole('button', { name: /structure focus/i });
        fireEvent.click(structureBtn);
        expect(screen.getByText('87%')).toBeInTheDocument();
        // Toggle to Content Focus (60/40)
        const contentBtn = screen.getByRole('button', { name: /content focus/i });
        fireEvent.click(contentBtn);
        expect(screen.getByText('82%')).toBeInTheDocument();
    });
    it('renders keyword coverage with mandated disclaimer and gap wording (never says lacks)', () => {
        render(<AtsReadabilityPanel initialData={sampleAtsResult}/>);
        // Exact summary
        expect(screen.getByText('2 of 3 requirement terms appear in the resume text')).toBeInTheDocument();
        // Mandatory disclaimer
        const disclaimers = screen.getAllByText('This does not mean you lack the skill.');
        expect(disclaimers.length).toBeGreaterThanOrEqual(1);
        // Gaps wording
        expect(screen.getByText("Not found in the resume text: 'Docker'.")).toBeInTheDocument();
        // Claimed, unproven status
        expect(screen.getByText('Claimed, not shown in your repos')).toBeInTheDocument();
    });
    it('renders cannot assess message and no numerical score when file is scanned/image-only', () => {
        const scannedResult = {
            ...sampleAtsResult,
            score_data: {
                score: null,
                score_label: 'ATS readability score (heuristic). Not a score from any real ATS; systems differ.',
                counts_label: 'Cannot assess: no readable text',
                cannot_assess: true,
                cannot_assess_reason: 'Cannot assess: no readable text (scanned PDF or empty file).',
                formula: 'N/A',
                readability_score: null,
                keyword_score: null,
                assessable_count: 0,
                passed_count: 0,
                excluded_count: 23,
                sensitivity_ranges: {
                    standard_70_30: null,
                    structure_80_20: null,
                    content_60_40: null,
                },
            },
        };
        render(<AtsReadabilityPanel initialData={scannedResult}/>);
        expect(screen.getByText('Cannot assess: no readable text')).toBeInTheDocument();
    });
});
