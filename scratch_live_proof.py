import asyncio
import json
import io
import pymupdf
from sqlalchemy import select

from backend.db.session import AsyncSessionLocal
from backend.services.ats_service import ats_service
from backend.models.models import ResumeExtraction

async def run_live_proof():
    async with AsyncSessionLocal() as session:
        # 1. Real user resume from database
        stmt = select(ResumeExtraction).where(
            ResumeExtraction.file_sha256 == '4db198d8aef77d5a31173d607323682b72cb808f3db1449cd1aedc10ee153c39'
        )
        real_rec = (await session.execute(stmt)).scalars().first()
        if not real_rec:
            print("ERROR: Real resume not found in DB")
            return

        real_layout = ats_service.extract_document_layout(real_rec.raw_bytes, real_rec.file_name)
        real_checks = ats_service.run_readability_checks(real_layout)
        real_kw = await ats_service.run_keyword_coverage(real_layout.extracted_text, 'job-demo', real_rec.user_id, session)
        real_score = ats_service.calculate_score(real_checks, real_kw)

        print("=" * 70)
        print("LIVE PROOF PART 1: REAL RESUME (Vedant Patke)")
        print("=" * 70)
        print(f"File Name: {real_rec.file_name}")
        print(f"File SHA-256: {real_rec.file_sha256}")
        print(f"Page Count: {real_layout.page_count} | Columns Detected: {real_layout.columns_detected}")
        print(f"Tables: {real_layout.tables_count} | Text Boxes: {real_layout.text_boxes_count}")
        print(f"Characters Read: {len(real_layout.extracted_text)}")
        print("\nSCORE & ARITHMETIC:")
        print(f"Exact Score Label: \"{real_score['score_label']}\"")
        print(f"Readability Score: {real_score['readability_score']}%")
        print(f"Keyword Score: {real_score['keyword_score']}%")
        print(f"Final Weighted Score (70/30): {real_score['score']}%")
        print(f"Counts Label: \"{real_score['counts_label']}\"")
        print(f"Formula: {real_score['formula']}")
        print(f"Sensitivity Ranges: {json.dumps(real_score['sensitivity_ranges'], indent=2)}")

        print("\nALL 23 READABILITY CHECKS FOR REAL RESUME:")
        for idx, c in enumerate(real_checks, 1):
            badge = f"[{c['status'].upper()}]"
            print(f"{idx:2d}. {badge:18s} {c['title']} (wt {c['weight']})")
            print(f"    Reason:   {c['reason']}")
            if c['evidence']:
                print(f"    Evidence: {c['evidence']}")
            if c['status'] == 'needs_attention' and c['concrete_fix']:
                print(f"    Fix:      {c['concrete_fix']}")

        print("\nKEYWORD COVERAGE AGAINST REAL POSTING (Senior Backend Engineer):")
        print(f"Summary:    \"{real_kw['summary']}\"")
        print(f"Disclaimer: \"{real_kw['disclaimer']}\"")
        for t in real_kw['terms']:
            print(f"\n  • Requirement: {t['label']}")
            print(f"    Status:      {t['status']} (Wording: \"{t['wording']}\")")
            print(f"    Repo Proof:  {t['code_status']}")
            if t['status'] == 'not_found':
                print(f"    Note:        \"{t['note']}\"")

        # 2. Deliberately degraded version (2 columns, contact details strictly in header, missing sections)
        doc = pymupdf.open()
        p = doc.new_page(width=612, height=792)
        # Put contact in header only (top 30pt)
        p.insert_text((50, 25), "Vedant Patke | vedant@example.com | +1 555-0199", fontsize=9)
        # Left column
        p.insert_text((50, 100), "SKILLS", fontsize=12)
        p.insert_text((50, 120), "Linear Regression, Supervised Learning, Python, C", fontsize=9)
        # Right column
        p.insert_text((350, 100), "PROJECTS", fontsize=12)
        p.insert_text((350, 120), "House Price Prediction model using Scikit-learn", fontsize=9)
        # Add table-like rectangles for layout
        p.draw_rect(pymupdf.Rect(40, 90, 300, 300))
        p.draw_rect(pymupdf.Rect(340, 90, 580, 300))
        bad_bytes = doc.tobytes()

        bad_layout = ats_service.extract_document_layout(bad_bytes, "degraded_resume.pdf")
        bad_checks = ats_service.run_readability_checks(bad_layout)
        bad_kw = await ats_service.run_keyword_coverage(bad_layout.extracted_text, 'job-demo', real_rec.user_id, session)
        bad_score = ats_service.calculate_score(bad_checks, bad_kw)

        print("\n" + "=" * 70)
        print("LIVE PROOF PART 2: DELIBERATELY DEGRADED RESUME (Two-Column & Header Trapping)")
        print("=" * 70)
        print(f"New Score: {bad_score['score']}% (dropped from {real_score['score']}%)")
        print(f"New Formula: {bad_score['formula']}")
        print(f"Columns: {bad_layout.columns_detected} | Tables: {bad_layout.tables_count}")
        print("\nBEFORE / AFTER CHECKS COMPARISON:")
        diff_count = 0
        for curr in bad_checks:
            prev = next((p for p in real_checks if p['code'] == curr['code']), None)
            if prev and prev['status'] != curr['status']:
                diff_count += 1
                print(f"• {curr['title']}: {prev['status']} -> {curr['status']}")
                print(f"    Reason: {curr['reason']}")
                if curr['concrete_fix']:
                    print(f"    Fix:    {curr['concrete_fix']}")
        if diff_count == 0:
            print("No checks changed status.")

        print("\n" + "=" * 70)
        print("LIVE PROOF COMPLETED SUCCESSFULLY")
        print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_live_proof())
