import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Sparkles, X, Check, Eye, EyeOff, ShieldCheck, Github, Cpu, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { getSettings, updateSettings, AppSettings } from '../../lib/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSettingsSaved }) => {
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'anthropic' | 'mock' | 'none'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [githubToken, setGithubToken] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<AppSettings | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCurrentSettings();
    }
  }, [isOpen]);

  const loadCurrentSettings = async () => {
    try {
      const s = await getSettings();
      setCurrentConfig(s);
      if (s.llm_provider && ['gemini', 'openai', 'anthropic', 'mock', 'none'].includes(s.llm_provider.toLowerCase())) {
        setProvider(s.llm_provider.toLowerCase() as any);
      }
      if (s.llm_model) {
        setModel(s.llm_model);
      }
    } catch {
      // Ignored
    }
  };

  const handleProviderChange = (p: 'gemini' | 'openai' | 'anthropic' | 'mock' | 'none') => {
    setProvider(p);
    if (p === 'gemini') {
      setModel('gemini-1.5-flash');
    } else if (p === 'openai') {
      setModel('gpt-4o-mini');
    } else if (p === 'anthropic') {
      setModel('claude-3-5-sonnet-20241022');
    } else {
      setModel('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const updated = await updateSettings({
        llm_provider: provider,
        llm_api_key: apiKey.trim() ? apiKey.trim() : undefined,
        llm_model: model.trim() ? model.trim() : undefined,
        github_token: githubToken.trim() ? githubToken.trim() : undefined,
      });

      setCurrentConfig(updated);
      setSaveSuccess(true);
      if (onSettingsSaved) {
        onSettingsSaved();
      }
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings. Please verify server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#12161B] border border-white/15 rounded-2xl shadow-2xl p-6 sm:p-7 text-[#F4F2EC] z-10 space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-white/10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>INTELLIGENCE & SECRETS ENCLAVE</span>
              </div>
              <h2 id="settings-modal-title" className="font-display text-2xl text-white font-bold">
                API Keys & Engine Settings
              </h2>
              <p className="text-xs text-[#9AA3AE] font-mono">
                Connect your LLM and GitHub keys for live automated invariant validation.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9AA3AE] hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
            {/* LLM Provider Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase font-bold text-[#9AA3AE] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verification Engine Provider</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'gemini', label: 'Google Gemini' },
                  { id: 'openai', label: 'OpenAI GPT' },
                  { id: 'anthropic', label: 'Anthropic Claude' },
                  { id: 'mock', label: 'Mock Engine' },
                  { id: 'none', label: 'Deterministic (Off)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleProviderChange(item.id as any)}
                    className={`py-2 px-2.5 rounded-lg border text-[11px] font-semibold transition-all text-center ${
                      provider === item.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                        : 'bg-white/5 text-[#9AA3AE] border-white/10 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Input */}
            {provider !== 'none' && provider !== 'mock' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="llm-api-key" className="text-[11px] uppercase font-bold text-[#9AA3AE] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{provider.toUpperCase()} API Key</span>
                  </label>
                  {currentConfig?.has_llm_key && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{currentConfig.masked_llm_key}</span>
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    id="llm-api-key"
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={currentConfig?.has_llm_key ? 'Leave empty to keep configured key' : 'Enter API Key (e.g. AIzaSy... or sk-...)'}
                    className="w-full bg-[#08090C] border border-white/15 rounded-lg py-2.5 pl-3 pr-10 text-white placeholder-[#555E6C] focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 text-[#9AA3AE] hover:text-white"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Model Name */}
            {provider !== 'none' && provider !== 'mock' && (
              <div className="space-y-1.5">
                <label htmlFor="model-name" className="text-[11px] uppercase font-bold text-[#9AA3AE]">
                  Model Identifier
                </label>
                <input
                  id="model-name"
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. gemini-1.5-flash or gpt-4o-mini"
                  className="w-full bg-[#08090C] border border-white/15 rounded-lg py-2.5 px-3 text-white placeholder-[#555E6C] focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            )}

            {/* GitHub Personal Access Token */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label htmlFor="gh-token" className="text-[11px] uppercase font-bold text-[#9AA3AE] flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-emerald-400" />
                  <span>GitHub Access Token (Read-Only)</span>
                </label>
                {currentConfig?.has_github_token && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{currentConfig.masked_github_token}</span>
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  id="gh-token"
                  type={showGithubToken ? 'text' : 'password'}
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder={currentConfig?.has_github_token ? 'Leave empty to keep configured token' : 'Personal access token (ghp_...)'}
                  className="w-full bg-[#08090C] border border-white/15 rounded-lg py-2.5 pl-3 pr-10 text-white placeholder-[#555E6C] focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="absolute right-3 text-[#9AA3AE] hover:text-white"
                >
                  {showGithubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[#64748B]">
                Grants read-only access to inspect commit trees and code invariants without rate-limits.
              </p>
            </div>

            {/* Status / Error feedback */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Settings saved and verified! Engine updated.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="solid_paper"
                size="md"
                disabled={isLoading}
                icon={isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              >
                <span>{isLoading ? 'Verifying...' : 'Save & Connect'}</span>
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
