import React, { useState, useEffect, useMemo } from 'react';
import { Github, X, Search, Zap, Star, GitFork, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, FolderGit2, Code2, User, } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProofStack } from '../../context/ProofStackContext';
import { fetchUserGithubRepositories } from '../../lib/api';
export const RepositorySelectorModal = ({ isOpen, onClose, }) => {
    const { user } = useAuth();
    const { repository, connectNewRepository, connectedRepos } = useProofStack();
    const [activeUsername, setActiveUsername] = useState(() => {
        return user?.login || (typeof window !== 'undefined' ? localStorage.getItem('ps_github_username') : '') || '307vedanttt';
    });
    const [handleInput, setHandleInput] = useState(activeUsername);
    const [customRepoUrl, setCustomRepoUrl] = useState('');
    const [searchFilter, setSearchFilter] = useState('');
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [analyzingId, setAnalyzingId] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);
    // Sync with user login if it changes
    useEffect(() => {
        const effective = user?.login || (typeof window !== 'undefined' ? localStorage.getItem('ps_github_username') : '') || '307vedanttt';
        if (effective && effective !== 'developer') {
            setActiveUsername(effective);
            setHandleInput(effective);
        }
    }, [user?.login]);
    // Fetch repositories for current handle
    const loadRepos = async (handleToFetch) => {
        setLoading(true);
        setStatusMessage(null);
        try {
            const data = await fetchUserGithubRepositories(handleToFetch);
            setRepos(data);
        }
        catch (err) {
            setStatusMessage({
                type: 'error',
                text: `Unable to load GitHub repositories for @${handleToFetch}: ${err?.message || 'Rate limit or network error'}.`,
            });
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (isOpen) {
            const effective = user?.login || (typeof window !== 'undefined' ? localStorage.getItem('ps_github_username') : '') || activeUsername;
            if (effective && effective !== activeUsername) {
                setActiveUsername(effective);
                setHandleInput(effective);
            }
            loadRepos(effective || activeUsername);
        }
    }, [isOpen, user?.login]);
    // Handle switching GitHub handle
    const handleUpdateUsername = (e) => {
        e.preventDefault();
        const clean = handleInput.trim().replace(/^@/, '');
        if (clean) {
            setActiveUsername(clean);
            if (typeof window !== 'undefined') {
                localStorage.setItem('ps_github_username', clean);
            }
            loadRepos(clean);
        }
    };
    // Analyze an existing discovered repo
    const handleAnalyzeRepo = async (repo) => {
        setAnalyzingId(repo.id);
        setStatusMessage({
            type: 'info',
            text: `Connecting ${repo.full_name} and executing AST proof extraction...`,
        });
        try {
            // Connect repo and analyze
            const success = await connectNewRepository(repo.repo_url);
            if (success) {
                setStatusMessage({
                    type: 'success',
                    text: `Successfully analyzed ${repo.full_name}! Provenance ledger and evidence maps are active.`,
                });
                setTimeout(() => {
                    onClose();
                }, 900);
            }
            else {
                setStatusMessage({
                    type: 'error',
                    text: `Verification completed with partial evidence. Switch to workspace to inspect.`,
                });
            }
        }
        catch (err) {
            setStatusMessage({
                type: 'error',
                text: `Analysis failed: ${err?.message || 'Check network connection'}.`,
            });
        }
        finally {
            setAnalyzingId(null);
        }
    };
    // Analyze a custom pasted URL
    const handleCustomAnalyze = async (e) => {
        e.preventDefault();
        const clean = customRepoUrl.trim();
        if (!clean)
            return;
        const fullUrl = clean.startsWith('http') ? clean : `https://github.com/${clean.replace(/\.git$/, '')}`;
        setAnalyzingId('custom');
        setStatusMessage({
            type: 'info',
            text: `Connecting ${clean} and executing live AST proof extraction...`,
        });
        try {
            const success = await connectNewRepository(fullUrl);
            if (success) {
                setStatusMessage({
                    type: 'success',
                    text: `Successfully verified and connected repository! Loading workspace...`,
                });
                setTimeout(() => {
                    onClose();
                }, 900);
            }
            else {
                setStatusMessage({
                    type: 'error',
                    text: `Repository analysis initiated. Inspect results in Dashboard.`,
                });
            }
        }
        catch (err) {
            setStatusMessage({
                type: 'error',
                text: `Error analyzing repository: ${err?.message || 'Check repo visibility'}.`,
            });
        }
        finally {
            setAnalyzingId(null);
        }
    };
    // 1-Click Benchmark selection for any public repo in the world
    const handleSelectBenchmark = async (slug) => {
        setCustomRepoUrl(slug);
        setAnalyzingId(slug);
        setStatusMessage({
            type: 'info',
            text: `Fetching live GitHub API metadata and AST proof ledger for ${slug}...`,
        });
        try {
            const success = await connectNewRepository(slug);
            if (success) {
                setStatusMessage({
                    type: 'success',
                    text: `Successfully verified and connected ${slug}! Provenance ledger and evidence maps are active.`,
                });
                setTimeout(() => {
                    onClose();
                }, 900);
            }
            else {
                setStatusMessage({
                    type: 'error',
                    text: `Verification initiated. Open Dashboard to view results.`,
                });
            }
        }
        catch (err) {
            setStatusMessage({
                type: 'error',
                text: `Analysis failed: ${err?.message || 'Check network connection'}.`,
            });
        }
        finally {
            setAnalyzingId(null);
        }
    };
    // Filter repos by search
    const filteredRepos = useMemo(() => {
        const q = searchFilter.toLowerCase().trim();
        if (!q)
            return repos;
        return repos.filter((r) => r.name.toLowerCase().includes(q) ||
            (r.description && r.description.toLowerCase().includes(q)) ||
            (r.language && r.language.toLowerCase().includes(q)));
    }, [repos, searchFilter]);
    if (!isOpen)
        return null;
    return (<div role="dialog" aria-modal="true" aria-labelledby="repo-modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0E1528] border border-[#25324A] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#25324A] bg-[#131D32] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <FolderGit2 className="w-5 h-5"/>
            </div>
            <div>
              <h2 id="repo-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                GitHub Provenance & AST Code Analyzer
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-medium border border-emerald-500/30">
                  LIVE API
                </span>
              </h2>
              <p className="text-xs text-[#9AA3AE]">
                Select any public GitHub repository to extract commit provenance, generate Merkle trees, and assess code quality.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#9AA3AE] hover:text-white transition-colors" aria-label="Close dialog">
            <X className="w-4 h-4"/>
          </button>
        </div>

        {/* STATUS BANNER */}
        {statusMessage && (<div className={`px-6 py-2.5 text-xs font-mono flex items-center gap-2 border-b transition-all ${statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : statusMessage.type === 'error'
                    ? 'bg-red-950/60 border-red-800 text-red-300'
                    : 'bg-violet-950/60 border-violet-800 text-violet-200 animate-pulse'}`}>
            {statusMessage.type === 'success' ? (<CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0"/>) : statusMessage.type === 'error' ? (<AlertCircle className="w-4 h-4 text-red-400 shrink-0"/>) : (<RefreshCw className="w-4 h-4 text-violet-400 animate-spin shrink-0"/>)}
            <span className="truncate">{statusMessage.text}</span>
          </div>)}

        {/* MODAL BODY */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* SECTION 1: QUICK ANALYZE ANY GITHUB URL */}
          <div className="p-4 rounded-xl bg-[#131D32]/70 border border-[#25324A] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                <Code2 className="w-3.5 h-3.5 text-violet-400"/>
                <span>Quick Analyze Any GitHub URL</span>
              </div>
              <span className="text-[10px] text-[#9AA3AE] font-mono">Accepts full URL or owner/repo</span>
            </div>

            <form onSubmit={handleCustomAnalyze} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Github className="absolute left-3.5 top-3 w-4 h-4 text-[#9AA3AE] pointer-events-none"/>
                <input type="text" value={customRepoUrl} onChange={(e) => setCustomRepoUrl(e.target.value)} placeholder="e.g. facebook/react or https://github.com/username/project" className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B1020] border border-[#25324A] text-white placeholder-[#9AA3AE]/40 text-xs font-mono focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"/>
              </div>
              <button type="submit" disabled={!customRepoUrl.trim() || analyzingId === 'custom'} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold font-mono flex items-center justify-center gap-2 shadow-md transition-all shrink-0">
                {analyzingId === 'custom' ? (<>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin"/>
                    <span>Analyzing AST...</span>
                  </>) : (<>
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300"/>
                    <span>Inspect & Verify</span>
                  </>)}
              </button>
            </form>

            {/* 1-Click Popular World Repositories Benchmark Pills */}
            <div className="pt-1">
              <span className="text-[10px] text-[#9AA3AE] font-mono block mb-1.5 font-medium">
                Benchmark Public Repositories (1-Click Verification):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
            { slug: 'facebook/react', label: 'facebook/react', stars: '251k★', lang: 'React' },
            { slug: 'vercel/next.js', label: 'vercel/next.js', stars: '143k★', lang: 'Next.js' },
            { slug: 'microsoft/TypeScript', label: 'microsoft/TypeScript', stars: '104k★', lang: 'TypeScript' },
            { slug: 'torvalds/linux', label: 'torvalds/linux', stars: '252k★', lang: 'C Kernel' },
            { slug: 'pallets/flask', label: 'pallets/flask', stars: '72k★', lang: 'Python' },
            { slug: 'python/cpython', label: 'python/cpython', stars: '71k★', lang: 'Python' },
            { slug: 'octocat/Spoon-Knife', label: 'octocat/Spoon-Knife', stars: 'Fork Demo', lang: 'HTML' },
            { slug: 'fastapi/fastapi', label: 'fastapi/fastapi', stars: '85k★', lang: 'Python' },
            { slug: '307vedanttt/MedNav-Ai', label: '307vedanttt/MedNav-Ai', stars: 'Candidate', lang: 'Full-Stack' },
        ].map((bench) => (<button key={bench.slug} type="button" onClick={() => handleSelectBenchmark(bench.slug)} disabled={analyzingId !== null} className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all flex items-center gap-1.5 group ${analyzingId === bench.slug
                ? 'bg-violet-600/40 border-violet-500 text-white animate-pulse'
                : 'bg-white/5 hover:bg-violet-600/20 border-white/10 hover:border-violet-500/40 text-white/90 hover:text-white'}`}>
                    <span className="group-hover:text-violet-300 font-semibold">{bench.label}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-amber-300">{bench.stars}</span>
                  </button>))}
              </div>
            </div>
          </div>

          {/* SECTION 2: GITHUB ACCOUNT SWITCHER & REPO DISCOVERY */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/20">
                  <img src={`https://github.com/${activeUsername}.png`} alt={activeUsername} className="w-full h-full object-cover" onError={(e) => {
            e.target.style.display = 'none';
        }}/>
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <span>Discovered Repositories for</span>
                    <span className="text-emerald-400">@{activeUsername}</span>
                  </h3>
                  <p className="text-[10px] text-[#9AA3AE] font-mono">
                    Found {repos.length} public {repos.length === 1 ? 'repository' : 'repositories'}
                  </p>
                </div>
              </div>

              {/* CHANGE USERNAME FORM */}
              <form onSubmit={handleUpdateUsername} className="flex items-center gap-1.5">
                <div className="relative">
                  <User className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#9AA3AE]"/>
                  <input type="text" value={handleInput} onChange={(e) => setHandleInput(e.target.value)} placeholder="GitHub username" className="w-36 pl-8 pr-2 py-1.5 rounded-lg bg-[#0B1020] border border-[#25324A] text-white placeholder-[#9AA3AE]/40 text-xs font-mono focus:outline-none focus:border-violet-500"/>
                </div>
                <button type="submit" disabled={loading || !handleInput.trim() || handleInput === activeUsername} className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-[11px] font-mono font-semibold transition-colors">
                  Load
                </button>
                <button type="button" onClick={() => loadRepos(activeUsername)} disabled={loading} title="Refresh repository list" className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#9AA3AE] hover:text-white transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`}/>
                </button>
              </form>
            </div>

            {/* SEARCH FILTER BAR */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#9AA3AE] pointer-events-none"/>
              <input type="text" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} placeholder="Filter repositories by title or language..." className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0B1020] border border-[#25324A] text-white placeholder-[#9AA3AE]/40 text-xs font-mono focus:outline-none focus:border-violet-500"/>
            </div>

            {/* REPOSITORY CARDS GRID */}
            {loading ? (<div className="py-12 flex flex-col items-center justify-center gap-3 font-mono text-xs text-[#9AA3AE]">
                <RefreshCw className="w-6 h-6 animate-spin text-violet-400"/>
                <span>Querying GitHub API for @{activeUsername} repositories...</span>
              </div>) : filteredRepos.length === 0 ? (<div className="py-12 text-center rounded-xl bg-[#0B1020]/50 border border-[#25324A] p-6 font-mono">
                <FolderGit2 className="w-8 h-8 text-[#9AA3AE]/40 mx-auto mb-2"/>
                <p className="text-xs text-white/80 font-bold">No matching repositories found</p>
                <p className="text-[11px] text-[#9AA3AE] mt-1">
                  Try searching for another term or paste the exact GitHub repository URL above.
                </p>
              </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredRepos.map((repo) => {
                const isActive = repository?.fullName?.toLowerCase() === repo.full_name.toLowerCase() ||
                    repository?.name?.toLowerCase() === repo.name.toLowerCase();
                const isAnalyzing = analyzingId === repo.id;
                return (<div key={repo.id} className={`group p-4 rounded-xl border transition-all flex flex-col justify-between ${isActive
                        ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'bg-[#0B1020] border-[#25324A] hover:border-violet-500/40 hover:bg-[#0E1528]'}`}>
                      <div>
                        {/* Header: Name + Active indicator / link */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="font-mono text-xs font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                            {repo.name}
                          </h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isActive && (<span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"/>
                                ACTIVE
                              </span>)}
                            <a href={repo.repo_url} target="_blank" rel="noreferrer" className="text-[#9AA3AE] hover:text-white transition-colors" title="View on GitHub">
                              <ExternalLink className="w-3 h-3"/>
                            </a>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-[#9AA3AE] line-clamp-2 leading-relaxed mb-3">
                          {repo.description || 'Public GitHub repository code repository.'}
                        </p>
                      </div>

                      <div>
                        {/* Badges: Language, Stars, Forks */}
                        <div className="flex items-center gap-3 text-[10px] font-mono text-[#9AA3AE] mb-3">
                          {repo.language && (<span className="flex items-center gap-1 text-white/90">
                              <span className="w-2 h-2 rounded-full bg-violet-400"/>
                              <span>{repo.language}</span>
                            </span>)}
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400"/>
                            <span>{repo.stars_count}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-3 h-3 text-[#9AA3AE]"/>
                            <span>{repo.forks_count}</span>
                          </span>
                        </div>

                        {/* Action Button */}
                        <button type="button" onClick={() => handleAnalyzeRepo(repo)} disabled={isAnalyzing} className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${isActive
                        ? 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/10 hover:bg-violet-600 active:scale-[0.99] text-white hover:text-white'}`}>
                          {isAnalyzing ? (<>
                              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400"/>
                              <span>Analyzing Codebase...</span>
                            </>) : isActive ? (<>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400"/>
                              <span>Active — Re-Audit</span>
                            </>) : (<>
                              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300"/>
                              <span>Analyze Repository</span>
                            </>)}
                        </button>
                      </div>
                    </div>);
            })}
              </div>)}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-[#25324A] bg-[#131D32] flex items-center justify-between text-[11px] font-mono text-[#9AA3AE] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"/>
            <span>Connected Repositories in Session: {connectedRepos.length}</span>
          </div>
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>);
};
