import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  LayoutDashboard, 
  FileCheck2, 
  FileText, 
  Layers, 
  FileUp, 
  Flame, 
  Brain, 
  Activity, 
  Sparkles, 
  Scale, 
  Zap,
  Terminal,
  ExternalLink
} from 'lucide-react';

export const FeaturesHubModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'core', 'resume', 'forensics', 'tools'
  const [searchQuery, setSearchQuery] = useState('');

  const features = [
    // Core Golden Journey
    {
      id: 'feat-overview',
      category: 'core',
      title: 'Overview Dossier & Live Scanner',
      route: '/app',
      badge: 'CORE JOURNEY',
      badgeColor: 'emerald',
      icon: LayoutDashboard,
      description: 'Candidate technical coverage matrix, AST distribution, recommended contracts, and multi-stage live audit scanner.'
    },
    {
      id: 'feat-audit',
      category: 'core',
      title: 'Repository Audit & Provenance',
      route: '/app/audit',
      badge: 'CORE JOURNEY',
      badgeColor: 'emerald',
      icon: ShieldCheck,
      description: 'Lineage verification, standalone vs forked root ancestor, cryptographic signatures, and Git commit DAG analysis.'
    },
    {
      id: 'feat-evidence',
      category: 'core',
      title: 'Physical Evidence Invariants',
      route: '/app/evidence',
      badge: 'CORE JOURNEY',
      badgeColor: 'emerald',
      icon: FileCheck2,
      description: 'AST code snippets, line ranges, and strict four-state verification (Strong, Basic, Unclear, Not Demonstrated).'
    },
    {
      id: 'feat-contracts',
      category: 'core',
      title: 'Commit Contracts & Dry-Run Simulator',
      route: '/app/contracts',
      badge: 'CORE JOURNEY',
      badgeColor: 'emerald',
      icon: FileText,
      description: 'Interactive developer commitments to close skill gaps, featuring live dry-run simulation and tamper-proof wax seal stamps.'
    },
    {
      id: 'feat-proofmap',
      category: 'core',
      title: 'ProofMap & Merkle File Tree',
      route: '/app/proof-map',
      badge: 'CORE JOURNEY',
      badgeColor: 'cyan',
      icon: Layers,
      description: 'Interactive Merkle DAG visualization of repository file structure, historical commit snapshots, and test density.'
    },

    // Viral & Resume Intelligence
    {
      id: 'feat-roast',
      category: 'resume',
      title: 'Resume Truth Roast & Reality Check',
      route: '/resume',
      badge: 'VIRAL FEATURE',
      badgeColor: 'rose',
      icon: Flame,
      description: 'Compares resume claims against physical AST code. Computes Proven Code vs Hollow Fluff and generates shareable social cards.'
    },
    {
      id: 'feat-cadence',
      category: 'forensics',
      title: 'AI Ghostwrite & Cognitive Forensics',
      route: '/app/audit',
      badge: 'INVESTOR MOAT',
      badgeColor: 'cyan',
      icon: Brain,
      description: 'Proves 98.4% Organic Human Authorship vs 1.6% 1-shot LLM dumping by analyzing commit entropy and the "Struggle Footprint".'
    },
    {
      id: 'feat-upload',
      category: 'resume',
      title: 'Resume Upload & AST Skill Extractor',
      route: '/resume',
      badge: 'RESUME ENGINE',
      badgeColor: 'emerald',
      icon: FileUp,
      description: 'Drag & drop PDF/Word parsing with single-line verbatim quote anchors bound to real repository source files.'
    },
    {
      id: 'feat-dossier',
      category: 'resume',
      title: 'Attested Physical A4 Paper Dossier',
      route: '/resume',
      badge: 'DOCUMENT SPEC',
      badgeColor: 'violet',
      icon: FileText,
      description: 'Architectural A4 white substrate document with numbered physical footnotes, Merkle audit identifier, and live QR code.'
    },
    {
      id: 'feat-deep-audit',
      category: 'resume',
      title: 'Deep Resume Forensic Studio',
      route: '/resume',
      badge: 'AI OPTIMIZER',
      badgeColor: 'amber',
      icon: Sparkles,
      description: 'Google XYZ formula scoring (Accomplished [X] by doing [Y]), metric density tracking, and power verb analysis.'
    },
    {
      id: 'feat-ats',
      category: 'resume',
      title: 'Deterministic ATS Readability Parser',
      route: '/resume',
      badge: 'PARSER ENGINE',
      badgeColor: 'emerald',
      icon: FileCheck2,
      description: '87% standard ATS compatibility breakdown, 1-column linear text stream preview, and formatting guardrails.'
    },

    // Developer & Evaluation Tools
    {
      id: 'feat-diagnostics',
      category: 'tools',
      title: 'Live Cluster Diagnostics',
      route: '/diagnostics',
      badge: 'SYSTEM HEALTH',
      badgeColor: 'cyan',
      icon: Zap,
      description: 'Real-time telemetry on GitHub rate limits, SSE webhook event bus, SQLite WAL latency, and verification engine status.'
    },
    {
      id: 'feat-rubric',
      category: 'tools',
      title: 'Judge Evaluation Rubric',
      route: '/how-we-judge',
      badge: 'EVALUATION',
      badgeColor: 'violet',
      icon: Scale,
      description: 'Transparent 5-dimension scoring rubric (Authenticity, Technical Depth, UI Polish, Innovation, Utility).'
    },
    {
      id: 'feat-landing',
      category: 'tools',
      title: 'Public Product Landing Page',
      route: '/',
      badge: 'SHOWCASE',
      badgeColor: 'emerald',
      icon: Terminal,
      description: 'Hero presentation, interactive problem showcase, evidence docket receipt preview, and product story.'
    }
  ];

  const filteredFeatures = features.filter((feat) => {
    const matchesCategory = filter === 'all' || feat.category === filter;
    const matchesQuery = 
      feat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.route.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleLaunch = (route) => {
    onClose();
    navigate(route);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="features-hub-title"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#0D121D] border border-[#25324A] rounded-2xl shadow-2xl overflow-hidden font-sans z-10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-[#25324A] bg-[#101624] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="features-hub-title" className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>ProofStack Feature Hub & Capabilities Directory</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {features.length} MODULES
                </span>
              </h2>
              <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">
                Explore every core workflow, forensic analyzer, and developer tool in the project
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#9AA3AE] hover:text-white transition-colors focus:outline-none"
            aria-label="Close features modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-[#25324A] bg-[#0F1420] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto font-mono text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-white/10 text-white font-bold' 
                  : 'text-[#9AA3AE] hover:text-white'
              }`}
            >
              All ({features.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('core')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'core' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold' 
                  : 'text-[#9AA3AE] hover:text-white'
              }`}
            >
              Core Journey (5)
            </button>
            <button
              type="button"
              onClick={() => setFilter('resume')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'resume' 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold' 
                  : 'text-[#9AA3AE] hover:text-white'
              }`}
            >
              Resume Suite (4)
            </button>
            <button
              type="button"
              onClick={() => setFilter('forensics')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'forensics' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold' 
                  : 'text-[#9AA3AE] hover:text-white'
              }`}
            >
              AI Forensics (2)
            </button>
            <button
              type="button"
              onClick={() => setFilter('tools')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'tools' 
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold' 
                  : 'text-[#9AA3AE] hover:text-white'
              }`}
            >
              Diagnostics & Meta (3)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-[#9AA3AE] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search capabilities or routes..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#080B11] border border-[#25324A] rounded-lg text-xs font-mono text-white placeholder-[#9AA3AE]/50 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Feature Cards Grid (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={feat.id}
                  onClick={() => handleLaunch(feat.route)}
                  className="p-4 rounded-xl bg-white/[0.02] border border-[#25324A] hover:border-cyan-500/40 hover:bg-white/[0.04] transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                          {feat.title}
                        </span>
                      </div>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                        feat.badgeColor === 'emerald'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : feat.badgeColor === 'rose'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : feat.badgeColor === 'cyan'
                              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                              : feat.badgeColor === 'amber'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-violet-500/10 text-violet-300 border-violet-500/30'
                      }`}>
                        {feat.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#9AA3AE] leading-relaxed line-clamp-2">
                      {feat.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                    <code className="text-[11px] text-white/50 group-hover:text-cyan-300 transition-colors">
                      {feat.route}
                    </code>
                    <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      <span>Open Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFeatures.length === 0 && (
            <div className="py-12 text-center text-[#9AA3AE] font-mono text-xs">
              No features match "{searchQuery}". Try searching for "audit", "contracts", or "resume".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#25324A] bg-[#101624] flex items-center justify-between text-xs font-mono shrink-0">
          <span className="text-[#9AA3AE]">
            ProofStack Zero-Trust Verification Engine v4.0
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold"
          >
            Close Directory
          </button>
        </div>

      </div>
    </div>
  );
};
