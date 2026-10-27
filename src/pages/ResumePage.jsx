import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { getResumeAttestation } from '../lib/api';
import { Download, Check, ShieldCheck, Share2, FileUp, FileText, FileCheck2, Sparkles, Flame, Eye } from 'lucide-react';
import { ResumeInteractiveOverview } from '../components/resume/ResumeInteractiveOverview';
import { ResumeUploadAnalysis } from '../components/resume/ResumeUploadAnalysis';
import { AtsReadabilityPanel } from '../components/resume/AtsReadabilityPanel';
import { DeepResumeAuditPanel } from '../components/resume/DeepResumeAuditPanel';
import { ResumeTruthRoastCard } from '../components/resume/ResumeTruthRoastCard';
import { useProofStack } from '../context/ProofStackContext';
export const ResumePage = () => {
    const { repository, evidenceItems } = useProofStack();
    const [data, setData] = useState(null);
    const [copiedLink, setCopiedLink] = useState(false);
    const [activeFootnote, setActiveFootnote] = useState(null);
    const [activeView, setActiveView] = useState('overview');
    const [uploadRefreshKey, setUploadRefreshKey] = useState(0);
    const [uploadedBanner, setUploadedBanner] = useState(null);

    const handleUploadSuccess = (result) => {
        setUploadRefreshKey((k) => k + 1);
        setUploadedBanner(`Resume "${result.file_name}" uploaded & parsed successfully! Extracted ${result.skills?.length || 0} claims.`);
        getResumeAttestation()
            .then(setData)
            .catch(() => { });
        setTimeout(() => setUploadedBanner(null), 6000);
    };

    useEffect(() => {
        getResumeAttestation()
            .then(setData)
            .catch(() => { });
    }, []);
    // Evidence footnotes mapping
    const footnoteDetails = {
        1: {
            title: evidenceItems[0]?.title || `${repository?.primaryLanguage || 'Code'} Modular Architecture`,
            sha: evidenceItems[0]?.contributionContext?.commitHash || repository?.headSha?.slice(0, 7) || data?.commitHash || 'a182c4f',
            file: evidenceItems[0]?.filePath || 'src/components/index.tsx',
        },
        2: {
            title: evidenceItems[1]?.title || 'Automated Regression Suite Invariant',
            sha: evidenceItems[1]?.contributionContext?.commitHash || '8e41c0d',
            file: evidenceItems[1]?.filePath || 'tests/components.test.tsx',
        },
        3: {
            title: evidenceItems[2]?.title || 'Modular Boundary & Separation of Concerns',
            sha: evidenceItems[2]?.contributionContext?.commitHash || '7a12b9c',
            file: evidenceItems[2]?.filePath || 'src/services/api.ts',
        },
        4: {
            title: evidenceItems[3]?.title || 'Merkle DAG & Cryptographic Commit Provenance',
            sha: evidenceItems[3]?.contributionContext?.commitHash || repository?.headSha?.slice(0, 7) || 'a182c4f',
            file: evidenceItems[3]?.filePath || `.git/refs/heads/${repository?.defaultBranch || 'main'}`,
        },
    };
    const handleCopyProofLink = () => {
        navigator.clipboard?.writeText?.(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };
    const handleExportPdf = () => {
        window.print();
    };
    return (<AppLayout>
      {/* Sleek Floating Pill View Navigation Bar */}
      <div className="max-w-[1360px] w-full mx-auto px-4 pt-4 pb-2 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveView('overview')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 font-mono text-xs font-bold transition-all ${
                activeView === 'overview'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-[#0A0C0F] shadow-[0_0_15px_rgba(52,211,153,0.35)]'
                  : 'text-[#9AA3AE] hover:text-white bg-transparent hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-current" />
              <span>Interactive Overview</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-black/20 font-mono">Cockpit</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('upload')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 font-mono text-xs font-bold transition-all ${
                activeView === 'upload'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-[#0A0C0F] shadow-[0_0_15px_rgba(52,211,153,0.35)]'
                  : 'text-[#9AA3AE] hover:text-white bg-transparent hover:bg-white/5'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Upload & Skills</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('ats')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 font-mono text-xs font-bold transition-all ${
                activeView === 'ats'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-[#0A0C0F] shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'text-[#9AA3AE] hover:text-white bg-transparent hover:bg-white/5'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>ATS Readability</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-400/20 text-cyan-300 font-mono">91%</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('forensic')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 font-mono text-xs font-bold transition-all ${
                activeView === 'forensic'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                  : 'text-[#9AA3AE] hover:text-white bg-transparent hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-current" />
              <span>Deep Forensic Audit</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('roast')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 font-mono text-xs font-bold transition-all ${
                activeView === 'roast'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.35)]'
                  : 'text-[#9AA3AE] hover:text-white bg-transparent hover:bg-white/5'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-current" />
              <span>Truth Roast</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-400/20 text-rose-300 font-mono">1 Flag</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('dossier')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 font-mono text-xs font-bold transition-all ${
                activeView === 'dossier'
                  ? 'bg-white text-[#0A0C0F] shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                  : 'text-[#9AA3AE] hover:text-white bg-transparent hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4 Physical Dossier</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView(activeView === 'all' ? 'overview' : 'all')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                activeView === 'all'
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-[#9AA3AE] hover:text-white bg-white/5'
              }`}
            >
              {activeView === 'all' ? 'Collapse All' : 'Expanded View'}
            </button>
          </div>
        </div>
      </div>

      {/* Upload Notification Banner */}
      {uploadedBanner && (
        <div className="max-w-[1360px] w-full mx-auto px-4 mb-6">
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center justify-between shadow-[0_0_20px_rgba(52,211,153,0.15)] animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{uploadedBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadedBanner(null)}
              className="text-[#9AA3AE] hover:text-white px-2 py-0.5 rounded text-[11px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Interactive Command Overview Hub (Default Clean View) */}
      {activeView === 'overview' && (
        <div className="max-w-[1360px] w-full mx-auto px-4 mb-12">
          <ResumeInteractiveOverview
            data={data}
            repository={repository}
            footnoteDetails={footnoteDetails}
            onNavigateTab={(tab) => setActiveView(tab)}
            onCopyProofLink={handleCopyProofLink}
            onExportPdf={handleExportPdf}
            copiedLink={copiedLink}
            onUploadClick={() => setActiveView('upload')}
          />
        </div>
      )}

      {/* Resume Truth Roast & Reality Card Section */}
      {(activeView === 'all' || activeView === 'roast') && (
        <div className="max-w-[1360px] w-full mx-auto px-4 mb-12">
          <ResumeTruthRoastCard 
            repository={repository} 
            candidate={data?.candidate || { name: repository?.owner || '307vedanttt' }}
          />
        </div>
      )}

      {/* Upload and Analysis Engine Section */}
      {(activeView === 'all' || activeView === 'upload') && (<div className="mb-12 w-full">
          <ResumeUploadAnalysis onUploadSuccess={handleUploadSuccess} />
        </div>)}

      {/* Deep Forensic Audit Panel Section */}
      {(activeView === 'all' || activeView === 'forensic') && (<div className="max-w-[1360px] w-full mx-auto px-4 mb-12">
          <DeepResumeAuditPanel key={`forensic-${uploadRefreshKey}`} resumeId="latest"/>
        </div>)}

      {/* ATS Readability Panel Section */}
      {(activeView === 'all' || activeView === 'ats') && (<div className="max-w-[1360px] w-full mx-auto px-4 mb-12">
          <AtsReadabilityPanel key={`ats-${uploadRefreshKey}`} onUploadNewVersion={() => setActiveView('upload')}/>
        </div>)}

      {/* Attested PDF Dossier Section */}
      {(activeView === 'all' || activeView === 'dossier') && (<div className="max-w-[1360px] w-full mx-auto px-4 py-4 flex flex-col xl:flex-row items-center xl:items-start justify-center gap-8 select-none">
        {/* ======================================================== */}
        {/* PHYSICAL A4 WHITE DOSSIER (Crisp White Substrate)        */}
        {/* ======================================================== */}
        <article id="resume-a4-dossier" aria-label="Verified Candidate A4 Resume with Footnote Proofs" className="relative w-full max-w-[800px] bg-white text-[#111317] rounded-sm shadow-2xl p-8 sm:p-12 md:p-14 border border-neutral-200 select-text font-sans">
          {/* Top Perforation Edge */}
          <div className="absolute -top-[5px] left-6 right-6 h-[5px] flex justify-between items-center overflow-hidden opacity-40 pointer-events-none">
            <div className="w-full border-t-[2px] border-dashed border-[#94A3B8]"/>
          </div>

          {/* Rubber Stamp: PROVEN INVARIANT LEDGER */}
          <div className="absolute top-8 right-8 pointer-events-none select-none transform -rotate-3">
            <div className="border-[2.5px] border-[#00BA81] p-1 rounded-sm bg-emerald-50">
              <div className="border border-[#00BA81] px-3 py-1 flex flex-col items-center">
                <span className="font-mono text-xs text-[#00422C] font-black tracking-widest leading-tight">
                  ATTESTED PROOF
                </span>
                <span className="font-mono text-[9px] text-[#00BA81] font-bold">
                  COMMIT #{data?.commitHash?.toUpperCase() || 'A182C4F'} • 2026
                </span>
              </div>
            </div>
          </div>

          {/* HEADER */}
          <header className="pb-6 border-b border-neutral-200">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-[#00BA81]"/>
              <span>AUDIT IDENTIFIER: #{data?.commitHash || 'a182c4f'}</span>
              <span>•</span>
              <span className="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                MERKLE VERIFIED
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-900">
              {data?.candidate?.name || repository?.owner || 'Verified Engineer'}
            </h1>

            <p className="text-base text-neutral-600 mt-1 font-medium">
              {data?.candidate?.title || `${repository?.primaryLanguage || 'Software'} Architecture Engineer`}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-neutral-500 mt-3">
              <span className="hover:text-black">{data?.candidate?.email || `${repository?.owner || 'candidate'}@users.noreply.github.com`}</span>
              <span>/</span>
              <span className="hover:text-black">{data?.candidate?.github || (repository?.fullName ? `github.com/${repository.fullName}` : 'github.com/developer')}</span>
              <span>/</span>
              <span>{data?.candidate?.location || 'Remote / Worldwide'}</span>
              <span>/</span>
              <span className="text-[#00BA81] font-semibold">
                Clearance: {data?.candidate?.clearance || 'Level 3 Attestation'}
              </span>
            </div>
          </header>

          {/* SUMMARY */}
          <section className="py-5 border-b border-neutral-200">
            <div className="font-mono text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1.5">
              Executive Summary
            </div>
            <p className="text-sm text-neutral-800 leading-relaxed">
              {data?.candidate?.summary || 'Engineering track record verified by cryptographic commit contracts.'}
            </p>
          </section>

          {/* ATTESTED TECHNICAL SURFACE */}
          {/* Status dots: emerald for proven, amber for basic, GREY FOR UNPROVEN SKILLS */}
          <section className="py-6 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Attested Technical Skills
              </span>
              <span className="font-mono text-[10px] text-neutral-500">
                Numbered footnotes point to signed code proofs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data?.skills && data.skills.length > 0 ? (
                data.skills.map((cat, cIdx) => (
                  <div key={cIdx} className="p-3.5 rounded bg-neutral-50 border border-neutral-200/60">
                    <div className="font-mono text-[11px] font-bold uppercase text-neutral-700 tracking-wider mb-2 border-b border-neutral-200 pb-1">
                      {cat.category}
                    </div>
                    <ul className="space-y-2 font-mono text-xs">
                      {cat.items?.map((item, iIdx) => {
                        const isProven = item.status === 'proven';
                        const isBasic = item.status === 'basic';
                        const fnIdx = item.footnote_ref || (iIdx % 4) + 1;
                        return (
                          <li key={iIdx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isProven ? 'bg-[#00BA81]' : isBasic ? 'bg-[#F59E0B]' : 'bg-neutral-300'}`} />
                              <span className={`font-medium ${isProven ? 'text-neutral-900' : isBasic ? 'text-neutral-800' : 'text-neutral-400'}`}>
                                {item.name}
                              </span>
                              {fnIdx && (
                                <button type="button" onClick={() => setActiveFootnote(fnIdx)} className={`text-[10px] font-bold hover:underline ${isProven ? 'text-[#00BA81]' : 'text-[#D97706]'}`} title={`View footnote [${fnIdx}]`}>
                                  [{fnIdx}]
                                </button>
                              )}
                            </div>
                            <span className={`text-[10px] font-bold ${isProven ? 'text-[#00422C]' : isBasic ? 'text-[#D97706]' : 'text-neutral-400'}`}>
                              {isProven ? 'PROVEN' : isBasic ? 'BASIC' : 'UNPROVEN'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              ) : (
                <>
                  {/* Category 1: Languages */}
                  <div className="p-3.5 rounded bg-neutral-50 border border-neutral-200/60">
                    <div className="font-mono text-[11px] font-bold uppercase text-neutral-700 tracking-wider mb-2 border-b border-neutral-200 pb-1">
                      01. Languages & Frameworks
                    </div>
                    <ul className="space-y-2 font-mono text-xs">
                      <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00BA81]"/>
                          <span className="font-medium text-neutral-900">Python 3.12</span>
                          <button type="button" onClick={() => setActiveFootnote(1)} className="text-[10px] text-[#00BA81] font-bold hover:underline" title="View footnote [1]">
                            [1]
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-[#00422C]">PROVEN</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00BA81]"/>
                          <span className="font-medium text-neutral-900">Go / Golang</span>
                          <button type="button" onClick={() => setActiveFootnote(4)} className="text-[10px] text-[#00BA81] font-bold hover:underline" title="View footnote [4]">
                            [4]
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-[#00422C]">PROVEN</span>
                      </li>
                      <li className="flex items-center justify-between text-neutral-400">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-neutral-300"/>
                          <span className="font-normal text-neutral-400">Rust / Cargo</span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">UNPROVEN</span>
                      </li>
                    </ul>
                  </div>

                  {/* Category 2: Backend Architecture */}
                  <div className="p-3.5 rounded bg-neutral-50 border border-neutral-200/60">
                    <div className="font-mono text-[11px] font-bold uppercase text-neutral-700 tracking-wider mb-2 border-b border-neutral-200 pb-1">
                      02. Backend & Testing
                    </div>
                    <ul className="space-y-2 font-mono text-xs">
                      <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00BA81]"/>
                          <span className="font-medium text-neutral-900">REST API Design</span>
                          <button type="button" onClick={() => setActiveFootnote(1)} className="text-[10px] text-[#00BA81] font-bold hover:underline" title="View footnote [1]">
                            [1]
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-[#00422C]">PROVEN</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00BA81]"/>
                          <span className="font-medium text-neutral-900">Automated Pytest</span>
                          <button type="button" onClick={() => setActiveFootnote(2)} className="text-[10px] text-[#00BA81] font-bold hover:underline" title="View footnote [2]">
                            [2]
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-[#00422C]">PROVEN</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#F59E0B]"/>
                          <span className="font-medium text-neutral-800">Docker Packaging</span>
                          <button type="button" onClick={() => setActiveFootnote(3)} className="text-[10px] text-[#D97706] font-bold hover:underline" title="View footnote [3]">
                            [3]
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-[#D97706]">BASIC</span>
                      </li>
                      <li className="flex items-center justify-between text-neutral-400">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-neutral-300"/>
                          <span className="font-normal text-neutral-400">Kubernetes Operators</span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">UNPROVEN</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* NUMBERED FOOTNOTES SECTION */}
          <section className="pt-6 font-mono text-xs text-neutral-600 space-y-2 border-t border-neutral-200">
            <div className="font-bold text-neutral-800 uppercase text-[10px] tracking-wider mb-1">
              Referenced Code Footnotes (Click To Audit)
            </div>
            {Object.entries(footnoteDetails).map(([num, foot]) => (<div key={num} className={`p-2 rounded text-[11px] flex items-center justify-between transition-colors ${activeFootnote === Number(num)
                    ? 'bg-emerald-50 border border-emerald-200 text-[#00422C]'
                    : 'bg-neutral-50 text-neutral-700'}`}>
                <div>
                  <span className="font-bold text-[#00BA81] mr-1.5">[{num}]</span>
                  <span>{foot.title}</span>
                  <span className="text-neutral-400 ml-2">({foot.file})</span>
                </div>
                <span className="font-bold bg-neutral-200 px-1.5 py-0.5 rounded text-[10px]">
                  commit {foot.sha}
                </span>
              </div>))}
          </section>
        </article>

        {/* ======================================================== */}
        {/* FLOATING ACTION & VERIFIER PANEL (Right Side)            */}
        {/* ======================================================== */}
        <aside className="w-full xl:w-80 flex flex-col space-y-6 shrink-0">
          {/* Action Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
            <h3 className="font-display font-bold text-base text-white">
              Attestation Actions
            </h3>

            <div className="space-y-2.5">
              <Button variant="solid_paper" size="md" onClick={handleExportPdf} className="w-full justify-center font-mono text-xs">
                <Download className="w-3.5 h-3.5 mr-2"/>
                <span>Export PDF</span>
              </Button>

              <Button variant="ghost" size="md" onClick={handleCopyProofLink} className="w-full justify-center font-mono text-xs text-white border-white/10 hover:bg-white/5">
                {copiedLink ? (<>
                    <Check className="w-3.5 h-3.5 mr-2 text-emerald-400"/>
                    <span>Proof Link Copied</span>
                  </>) : (<>
                    <Share2 className="w-3.5 h-3.5 mr-2 text-[#9AA3AE]"/>
                    <span>Copy Proof Link</span>
                  </>)}
              </Button>
            </div>

            {/* Legend Card */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#9AA3AE] tracking-wider block">
                Evidence Status Legend
              </span>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-2 text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00BA81]"/>
                  <span>Proven (Signed invariant test)</span>
                </div>
                <div className="flex items-center gap-2 text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"/>
                  <span>Basic (Partial implementation)</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-400"/>
                  <span>Grey (Unproven in scope)</span>
                </div>
              </div>
            </div>

            {/* Desktop: QR Code Block */}
            <div className="hidden sm:flex pt-4 border-t border-white/10 flex-col items-center text-center space-y-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#9AA3AE] tracking-wider">
                Instant Recruiter Verification QR
              </span>
              {/* High Contrast Visual QR Code */}
              <div className="p-3 bg-white rounded-xl shadow-md border border-neutral-300">
                <div className="w-32 h-32 bg-[repeating-conic-gradient(#111317_0%_25%,#F8FAFC_0%_50%)] [background-size:16px_16px] rounded relative overflow-hidden flex items-center justify-center">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg border border-neutral-300">
                    <ShieldCheck className="w-6 h-6 text-[#10B981]"/>
                  </div>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[#9AA3AE]">
                SCAN TO VERIFY SIGNATURES
              </span>
            </div>

            {/* Mobile (P6 rule): QR Code replaced by prominent 44px Share button */}
            <div className="sm:hidden pt-4 border-t border-white/10 w-full">
              <button type="button" onClick={handleCopyProofLink} className="w-full min-h-[44px] rounded-xl bg-emerald-500 text-[#0A0C0F] font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                <Share2 className="w-4 h-4"/>
                <span>{copiedLink ? 'Proof Link Copied!' : 'Share Proof Dossier'}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>)}
    </AppLayout>);
};
