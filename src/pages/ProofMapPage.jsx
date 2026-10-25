import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, MinusCircle, HelpCircle, ArrowRight, Grid, Network as NetworkIcon, ChevronRight, Filter, } from 'lucide-react';
import { useProofStack } from '../context/ProofStackContext';
import { AppLayout } from '../components/layout/AppLayout';
import { SkillStatusBadge, HonestyBadge } from '../components/common/ProofBadges';
import { Button } from '../components/ui/Button';
export const ProofMapPage = () => {
    const navigate = useNavigate();
    const { skills, evidenceItems, contracts, selectedStatusFilter, setSelectedStatusFilter, selectedSkillId, setSelectedSkillId, setSelectedEvidenceId, setActiveContractId, } = useProofStack();
    const [viewMode, setViewMode] = useState('matrix');
    // Filter skills
    const filteredSkills = selectedStatusFilter
        ? skills.filter((s) => s.currentStatus === selectedStatusFilter)
        : skills;
    const activeSkill = (skills && skills.find((s) => s.id === selectedSkillId)) ||
        filteredSkills?.[0] ||
        skills?.[0] || null;
    const supportingEvidence = (activeSkill && activeSkill.supportingEvidenceIds && Array.isArray(evidenceItems))
        ? evidenceItems.filter((e) => activeSkill.supportingEvidenceIds.includes(e.id))
        : [];
    const rejectedEvidence = (activeSkill && activeSkill.rejectedEvidenceIds && Array.isArray(evidenceItems))
        ? evidenceItems.filter((e) => activeSkill.rejectedEvidenceIds.includes(e.id))
        : [];
    const unclearEvidence = (activeSkill && activeSkill.unclearEvidenceIds && Array.isArray(evidenceItems))
        ? evidenceItems.filter((e) => activeSkill.unclearEvidenceIds.includes(e.id))
        : [];
    const relatedContract = (activeSkill && Array.isArray(contracts))
        ? contracts.find((c) => c.targetSkillId === activeSkill.id)
        : null;
    const handleOpenEvidence = (evidenceId) => {
        setSelectedEvidenceId(evidenceId);
        navigate('/app/evidence');
    };
    const handleOpenContract = (contractId) => {
        setActiveContractId(contractId);
        navigate('/app/contracts');
    };
    return (<AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Interactive Proof Map</h1>
              <HonestyBadge label="Derived Signal"/>
            </div>
            <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">
              Closed-loop technical capability topology backed by verified repository artifacts
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-[#131D32] border border-[#25324A] font-mono text-xs">
              <button onClick={() => setViewMode('matrix')} className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${viewMode === 'matrix' ? 'bg-violet-600 text-white font-bold' : 'text-[#9AA3AE] hover:text-white'}`}>
                <NetworkIcon className="w-3.5 h-3.5"/>
                <span>Topology</span>
              </button>
              <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${viewMode === 'grid' ? 'bg-violet-600 text-white font-bold' : 'text-[#9AA3AE] hover:text-white'}`}>
                <Grid className="w-3.5 h-3.5"/>
                <span>Categorized Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* STATUS FILTER PILLS */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-[#9AA3AE] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3"/> Filter State:
          </span>
          <button onClick={() => setSelectedStatusFilter(null)} className={`px-3 py-1 rounded-lg border transition-colors ${selectedStatusFilter === null
            ? 'bg-white/10 text-white border-white/20 font-bold'
            : 'bg-[#131D32] text-[#9AA3AE] border-[#25324A] hover:text-white'}`}>
            All Skills ({skills.length})
          </button>
          <button onClick={() => setSelectedStatusFilter('Demonstrated — Strong')} className={`px-3 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${selectedStatusFilter === 'Demonstrated — Strong'
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
            : 'bg-[#131D32] text-[#9AA3AE] border-[#25324A] hover:text-emerald-400'}`}>
            <CheckCircle2 className="w-3 h-3 text-emerald-400"/>
            <span>Demonstrated Strong ({skills.filter((s) => s.currentStatus === 'Demonstrated — Strong').length})</span>
          </button>
          <button onClick={() => setSelectedStatusFilter('Demonstrated — Basic')} className={`px-3 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${selectedStatusFilter === 'Demonstrated — Basic'
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
            : 'bg-[#131D32] text-[#9AA3AE] border-[#25324A] hover:text-amber-400'}`}>
            <Clock className="w-3 h-3 text-amber-400"/>
            <span>Demonstrated Basic ({skills.filter((s) => s.currentStatus === 'Demonstrated — Basic').length})</span>
          </button>
          <button onClick={() => setSelectedStatusFilter('Not demonstrated in this scope')} className={`px-3 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${selectedStatusFilter === 'Not demonstrated in this scope'
            ? 'bg-slate-500/20 text-slate-300 border-slate-500/40 font-bold'
            : 'bg-[#131D32] text-[#9AA3AE] border-[#25324A] hover:text-slate-300'}`}>
            <MinusCircle className="w-3 h-3 text-slate-400"/>
            <span>Not in Scope ({skills.filter((s) => s.currentStatus === 'Not demonstrated in this scope').length})</span>
          </button>
          <button onClick={() => setSelectedStatusFilter('Unclear')} className={`px-3 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${selectedStatusFilter === 'Unclear'
            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold'
            : 'bg-[#131D32] text-[#9AA3AE] border-[#25324A] hover:text-purple-400'}`}>
            <HelpCircle className="w-3 h-3 text-purple-400"/>
            <span>Unclear ({skills.filter((s) => s.currentStatus === 'Unclear').length})</span>
          </button>
        </div>

        {/* MAIN VISUALIZATION + DETAIL DRAWER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 7 COLS: SKILL TOPOLOGY OR GRID */}
          <div className="lg:col-span-7 space-y-4">
            {viewMode === 'matrix' ? (
        /* TOPOLOGY MATRIX / NETWORK NODES */
        <div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-4 relative overflow-hidden shadow-xl min-h-[500px]">
                <div className="flex items-center justify-between text-xs font-mono text-[#9AA3AE]">
                  <span>Connected Skill Topology (Click node to inspect forensic dossier)</span>
                  <span className="text-cyan-400">10 Verified Vectors</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {filteredSkills.map((skill) => {
                const isSelected = activeSkill.id === skill.id;
                return (<div key={skill.id} onClick={() => setSelectedSkillId(skill.id)} className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${isSelected
                        ? 'bg-[#1A2642] border-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.2)]'
                        : 'bg-[#0B1020] border-[#25324A] hover:border-violet-500/50'}`}>
                        {skill.updatedViaContract && (<div className="absolute top-0 right-0 px-2 py-0.5 bg-gradient-to-l from-emerald-500 to-cyan-500 text-[9px] font-mono font-bold text-black uppercase tracking-wider rounded-bl-lg">
                            Updated via Contract
                          </div>)}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between pr-2">
                            <span className="text-[10px] font-mono text-[#9AA3AE] uppercase">
                              {skill.category}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white tracking-tight">{skill.name}</h3>

                          <SkillStatusBadge status={skill.currentStatus} size="sm"/>

                          <p className="text-[11px] text-[#9AA3AE] line-clamp-2 leading-relaxed pt-1">
                            {skill.summary}
                          </p>

                          <div className="flex items-center justify-between text-[10px] font-mono text-[#9AA3AE] pt-2 border-t border-[#25324A]/60">
                            <span>Evidence: {skill.supportingEvidenceIds?.length || 0} artifacts</span>
                            <span className="text-cyan-400 font-semibold flex items-center gap-0.5">
                              Inspect <ChevronRight className="w-3 h-3"/>
                            </span>
                          </div>
                        </div>
                      </div>);
            })}
                </div>
              </div>) : (
        /* CATEGORIZED GRID VIEW */
        <div className="space-y-4">
                {['Language', 'Frontend', 'Backend', 'Data & Persistence', 'Security & Auth', 'Testing & Quality', 'DevOps & Collaboration'].map((cat) => {
                const catSkills = filteredSkills.filter((s) => s.category === cat);
                if (catSkills.length === 0)
                    return null;
                return (<div key={cat} className="p-4 rounded-xl bg-[#131D32] border border-[#25324A] space-y-2">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                        {cat}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catSkills.map((skill) => (<div key={skill.id} onClick={() => setSelectedSkillId(skill.id)} className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${activeSkill?.id === skill.id
                            ? 'bg-[#1A2642] border-cyan-400'
                            : 'bg-[#0B1020] border-[#25324A] hover:border-violet-500/40'}`}>
                            <span className="text-xs font-semibold text-white">{skill.name}</span>
                            <SkillStatusBadge status={skill.currentStatus} size="sm"/>
                          </div>))}
                      </div>
                    </div>);
            })}
              </div>)}
          </div>

          {/* RIGHT 5 COLS: SELECTED SKILL FORENSIC DOSSIER */}
          <div className="lg:col-span-5 space-y-4">
            {activeSkill ? (<div className="p-6 rounded-2xl bg-[#131D32] border border-[#25324A] space-y-5 font-mono text-xs">
                {/* Header Strip */}
                <div className="space-y-2 pb-3 border-b border-[#25324A]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#9AA3AE] uppercase tracking-wider">
                      {activeSkill.category} Vector
                    </span>
                    {activeSkill.updatedViaContract && (<span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                        Updated via Commit Contract
                      </span>)}
                  </div>

                  <h2 className="text-lg font-bold text-white tracking-tight">{activeSkill.name}</h2>
                  <SkillStatusBadge status={activeSkill.currentStatus} size="md"/>
                </div>

                {/* Claimed Proficiency vs Observed Signal */}
                <div className="p-3.5 rounded-xl bg-[#0B1020] border border-[#25324A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9AA3AE]">Self-Claimed Level:</span>
                    <strong className="text-white">{activeSkill.claimedProficiency}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9AA3AE]">Observable Evidence Invariants:</span>
                    <strong className="text-cyan-400">{activeSkill.supportingEvidenceIds?.length || 0} Verified</strong>
                  </div>
                </div>

                {/* Forensic Assessment Summary */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-violet-400 font-bold">Assessment Explanation:</span>
                  <p className="text-[#9AA3AE] leading-relaxed p-3 rounded-lg bg-[#0B1020] border border-[#25324A]">
                    {activeSkill.summary}
                  </p>
                </div>

                {/* Supporting Evidence List */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase text-emerald-400 font-bold">
                    Supporting Code Artifacts ({supportingEvidence.length}):
                  </span>
                  {supportingEvidence.length > 0 ? (supportingEvidence.map((evi) => (<div key={evi.id} onClick={() => handleOpenEvidence(evi.id)} className="p-3 rounded-lg bg-[#0B1020] border border-[#25324A] hover:border-emerald-500/50 cursor-pointer transition-colors space-y-1">
                        <div className="flex items-center justify-between text-white font-semibold">
                          <span className="truncate">{evi.title}</span>
                          <span className="text-[10px] text-emerald-400 shrink-0">Inspect →</span>
                        </div>
                        <div className="text-[10px] text-[#9AA3AE] flex items-center justify-between">
                          <code>{evi.filePath}</code>
                          <span>Commit {evi.contributionContext?.commitHash || 'verified'}</span>
                        </div>
                      </div>))) : (<div className="p-3 rounded-lg bg-[#0B1020] border border-[#25324A] text-[#9AA3AE]">
                      No accepted evidence artifacts in inspected scope.
                    </div>)}
                </div>

                {/* Rejected / Insufficient Evidence */}
                {rejectedEvidence.length > 0 && (<div className="space-y-2">
                    <span className="text-[10px] uppercase text-rose-400 font-bold">
                      Rejected Stubs & Refused Evidence ({rejectedEvidence.length}):
                    </span>
                    {rejectedEvidence.map((evi) => (<div key={evi.id} onClick={() => handleOpenEvidence(evi.id)} className="p-3 rounded-lg bg-[#0B1020] border border-rose-500/30 hover:border-rose-500/60 cursor-pointer transition-colors space-y-1">
                        <div className="flex items-center justify-between text-rose-300 font-semibold">
                          <span className="truncate">{evi.title}</span>
                          <span className="text-[10px] text-rose-400 shrink-0">Review Reason →</span>
                        </div>
                        <p className="text-[10px] text-[#9AA3AE]">{evi.shortExplanation}</p>
                      </div>))}
                  </div>)}

                {/* Unclear / Ambiguous Evidence */}
                {unclearEvidence.length > 0 && (<div className="space-y-2">
                    <span className="text-[10px] uppercase text-purple-400 font-bold">
                      Unclear / Context Required ({unclearEvidence.length}):
                    </span>
                    {unclearEvidence.map((evi) => (<div key={evi.id} onClick={() => handleOpenEvidence(evi.id)} className="p-3 rounded-lg bg-[#0B1020] border border-purple-500/30 hover:border-purple-500/60 cursor-pointer transition-colors space-y-1">
                        <div className="flex items-center justify-between text-purple-300 font-semibold">
                          <span className="truncate">{evi.title}</span>
                          <span className="text-[10px] text-purple-400 shrink-0">Inspect Signal →</span>
                        </div>
                        <p className="text-[10px] text-[#9AA3AE]">{evi.shortExplanation}</p>
                      </div>))}
                  </div>)}

                {/* Related Commit Contract CTA */}
                {relatedContract && (<div className="p-4 rounded-xl bg-gradient-to-r from-violet-600/10 to-cyan-600/10 border border-violet-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase text-violet-300 font-bold">
                        Targeted Commit Contract
                      </span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        {relatedContract.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{relatedContract.title}</h4>
                    <p className="text-[11px] text-[#9AA3AE]">{relatedContract.reasonGenerated}</p>
                    <Button variant="solid_paper" size="sm" onClick={() => handleOpenContract(relatedContract.id)} icon={<ArrowRight className="w-3.5 h-3.5 text-[#14171A]"/>} className="w-full justify-center mt-1">
                      Open Commit Contract
                    </Button>
                  </div>)}
              </div>) : (<div className="p-8 rounded-2xl bg-[#131D32] border border-[#25324A] text-center text-[#9AA3AE] font-mono text-xs">
                Select a skill from the map to inspect its evidence dossier.
              </div>)}
          </div>
        </div>
      </div>
    </AppLayout>);
};
