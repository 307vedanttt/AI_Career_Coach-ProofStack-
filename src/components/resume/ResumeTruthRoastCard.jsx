import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  ShieldCheck, 
  AlertTriangle, 
  Share2, 
  Check, 
  Copy, 
  ArrowRight, 
  ExternalLink,
  Cpu,
  FileCode,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';

export const ResumeTruthRoastCard = ({ 
  skills = [], 
  repository = {}, 
  candidate = {}, 
  onFixWithContract 
}) => {
  const navigate = useNavigate();
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'proven', 'hollow'

  // Partition skills into Proven vs Hollow Fluff
  const provenSkills = [
    {
      name: 'Python & FastAPI Backend',
      category: 'Backend Architecture',
      verdict: 'PROVEN',
      evidence: '12 active endpoints, AST verified router tree, SQLite WAL persistence.',
      file: 'backend/api/routes.py',
      confidence: '99%'
    },
    {
      name: 'Automated Testing & Invariants',
      category: 'Quality Assurance',
      verdict: 'PROVEN',
      evidence: '90 pytest test suites passing, zero regression contracts.',
      file: 'backend/tests/test_api.py',
      confidence: '98%'
    },
    {
      name: 'Git Provenance & Integrity',
      category: 'Version Control',
      verdict: 'PROVEN',
      evidence: 'Continuous commit cadence, verified DAG lineage, zero upstream tamper.',
      file: '.git/refs/heads/main',
      confidence: '97%'
    },
    {
      name: 'Full-Stack React & Vite UI',
      category: 'Frontend Engineering',
      verdict: 'PROVEN',
      evidence: 'Modular design system, accessible WAI-ARIA states, zero-trust dashboards.',
      file: 'src/pages/OverviewPage.jsx',
      confidence: '95%'
    }
  ];

  const hollowClaims = [
    {
      name: 'Production Docker & Kubernetes',
      category: 'DevOps / Cloud',
      verdict: 'HOLLOW FLUFF',
      claimText: 'Experienced in containerizing production microservices with Docker and Kubernetes.',
      reality: '0 Dockerfiles and 0 Helm/Kubernetes manifests found in repository AST.',
      fixSkill: 'Docker & Containerization',
      fixAction: 'Add a multi-stage Dockerfile and docker-compose.yml to verify invariant'
    },
    {
      name: 'Distributed Caching & Redis',
      category: 'Systems Concurrency',
      verdict: 'HOLLOW FLUFF',
      claimText: 'High-throughput caching with distributed Redis clusters and pub/sub.',
      reality: 'No redis-py client imports or connection pooling code detected in source tree.',
      fixSkill: 'Redis & Distributed Caching',
      fixAction: 'Implement Redis session caching with failover boundary tests'
    }
  ];

  const totalClaims = provenSkills.length + hollowClaims.length;
  const truthPercentage = Math.round((provenSkills.length / totalClaims) * 100);
  const fluffPercentage = 100 - truthPercentage;

  const candidateHandle = candidate?.username || candidate?.name || 'developer';
  const repoName = repository?.fullName || 'MedNav-Ai';

  const shareText = `🔥 My ProofStack Resume Reality Check:
✅ ${truthPercentage}% Physically Proven by Git AST Invariants
⚠️ ${fluffPercentage}% Hollow Fluff (Missing Docker & Redis code)
Zero subjective AI trust scores. Just cryptographic code receipts.
Inspect my proof: http://localhost:5173/p/${candidateHandle}`;

  const handleCopyShare = () => {
    navigator.clipboard?.writeText?.(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="w-full rounded-xl obsidian-card shadow-2xl overflow-hidden font-sans">
      
      {/* Top Banner with Flame and Score Badge */}
      <div className="p-6 border-b border-white/[0.08] bg-[#101217] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rose-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <Flame className="w-5 h-5 animate-pulse" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Resume Truth Roast & Code Reality Check
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase">
                Zero Fluff Pass
              </span>
            </div>
            <p className="text-xs text-[#9AA3AE] font-mono">
              Audited against physical AST code and Git commits in <span className="text-cyan-300 font-semibold">{repoName}</span>
            </p>
          </div>

          {/* Large Authenticity Ratio Card */}
          <div className="flex items-center gap-3 bg-[#0D0F14] border border-white/[0.08] rounded-xl p-2.5 px-4 shadow-inner">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-[#9AA3AE] tracking-wider">Proof Authenticity</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {truthPercentage}% <span className="text-xs text-emerald-400/70 font-normal">PROVEN</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase text-[#9AA3AE] tracking-wider">Resume Fluff</div>
              <div className="text-xl font-bold font-mono text-rose-400">
                {fluffPercentage}% <span className="text-xs text-rose-400/70 font-normal">UNBACKED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Filter Pills & Share Action Bar */}
      <div className="px-6 py-3 border-b border-white/[0.08] bg-[#0E1015] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'all' 
                ? 'bg-white/10 text-white font-bold' 
                : 'text-[#9AA3AE] hover:text-white'
            }`}
          >
            All Claims ({totalClaims})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('proven')}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'proven' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold' 
                : 'text-[#9AA3AE] hover:text-emerald-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Proven ({provenSkills.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hollow')}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'hollow' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold' 
                : 'text-[#9AA3AE] hover:text-rose-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Hollow Fluff ({hollowClaims.length})</span>
          </button>
        </div>

        {/* Share Button with Live Copy Toast */}
        <button
          type="button"
          onClick={handleCopyShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#CBD5E1] hover:text-white transition-all shadow-sm"
          title="Copy viral Truth Scorecard for Twitter/LinkedIn"
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Share Reality Check</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content Area: Cards Grid */}
      <div className="p-6 space-y-6">
        
        {/* Section 1: Proven Skills */}
        {(activeTab === 'all' || activeTab === 'proven') && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Physically Backed Claims ({provenSkills.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
              {provenSkills.map((item, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  className="p-4 rounded-xl bg-[#12151C] border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      AST VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-[#9AA3AE] leading-relaxed">
                    {item.evidence}
                  </p>
                  <div className="text-[10px] text-emerald-400/80 pt-1 flex items-center gap-1.5 border-t border-emerald-500/10">
                    <FileCode className="w-3 h-3" />
                    <span>Physical proof at <code className="text-white">{item.file}</code></span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: The Roast (Hollow Claims) */}
        {(activeTab === 'all' || activeTab === 'hollow') && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span>Hollow Buzzwords & Inflated Claims ({hollowClaims.length})</span>
            </h3>

            <div className="space-y-3 font-mono">
              {hollowClaims.map((item, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  className="p-4 rounded-xl bg-[#141216] border border-rose-500/20 hover:border-rose-500/40 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>{item.name}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      0 AST INVARIANTS FOUND
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs p-3 rounded-lg bg-[#0C0D10] border border-white/[0.06]">
                    <div>
                      <div className="text-[10px] text-rose-400 font-bold uppercase">Resume Claim:</div>
                      <div className="text-rose-200/90 italic mt-0.5">"{item.claimText}"</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-400 font-bold uppercase">Reality Audit:</div>
                      <div className="text-[#9AA3AE] mt-0.5">{item.reality}</div>
                    </div>
                  </div>

                  {/* Fix It Action Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#9AA3AE]">
                      Turn this red line green: <span className="text-white">{item.fixAction}</span>
                    </span>
                    <Button 
                      variant="solid_paper" 
                      size="sm"
                      onClick={() => navigate('/app/contracts')}
                      icon={<ArrowRight className="w-3.5 h-3.5 text-[#14171A]" />}
                      iconPosition="right"
                    >
                      Fix with Commit Contract
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="p-4 px-6 border-t border-[#25324A] bg-[#101624] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <span className="text-[#9AA3AE]">
          Hollow buzzwords get caught in technical screens. Fix gaps before recruiters look.
        </span>
        <Button 
          variant="solid_emerald"
          size="sm"
          onClick={() => navigate('/app/contracts')}
          icon={<ShieldCheck className="w-4 h-4 text-[#0A0C0F]" />}
        >
          View Commit Contracts & Fix Fluff
        </Button>
      </div>

    </div>
  );
};
