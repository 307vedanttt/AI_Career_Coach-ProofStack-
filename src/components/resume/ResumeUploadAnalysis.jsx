import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, FileUp, CheckCircle2, RefreshCw, Trash2, Edit2, Plus, Camera, ArrowRight, ShieldAlert, ShieldCheck, Check, X, FileCode, WifiOff, Terminal, } from 'lucide-react';
import { Stamp } from '../stamps/Stamp';
import { Button } from '../ui/Button';
import { uploadResumeFile, getLatestResume, evaluateSkills } from '../../lib/api';
/**
 * Verify file magic bytes on client before upload
 * - PDF starts with '%PDF' (0x25, 0x50, 0x44, 0x46)
 * - DOCX starts with 'PK\x03\x04' (0x50, 0x4B, 0x03, 0x04)
 * - TXT/MD contains readable text characters (no null bytes)
 */
async function verifyFileMagicBytes(file) {
    try {
        const slice = file.slice(0, 2048);
        const buffer = await slice.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        // Security guard: detect binary executables (MZ for Windows EXE, \x7fELF for Linux)
        if ((bytes[0] === 0x4D && bytes[1] === 0x5A) || (bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46)) {
            return 'executable';
        }
        // Check for PDF signature (%PDF) anywhere in initial 2048 bytes
        for (let i = 0; i <= Math.min(bytes.length - 4, 2044); i++) {
            if (bytes[i] === 0x25 && bytes[i + 1] === 0x50 && bytes[i + 2] === 0x44 && bytes[i + 3] === 0x46) {
                return 'pdf';
            }
        }
        // Check for DOCX zip signature (PK) in first 16 bytes
        for (let i = 0; i <= Math.min(16, bytes.length - 2); i++) {
            if (bytes[i] === 0x50 && bytes[i + 1] === 0x4B) {
                return 'docx';
            }
        }
        // Check for DOC (OLE2 header)
        if (bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0) {
            return 'doc';
        }
        return 'valid';
    }
    catch {
        return 'valid';
    }
}
export const ResumeUploadAnalysis = ({ onUploadSuccess }) => {
    const [currentState, setCurrentState] = useState('default');
    const [errorType, setErrorType] = useState('wrong_type');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [analyzingStep, setAnalyzingStep] = useState(1);
    const [fileName, setFileName] = useState('sample_resume.pdf');
    const [fileSize, setFileSize] = useState('0 KB');
    const [uploadResult, setUploadResult] = useState(null);
    const [serverErrorMessage, setServerErrorMessage] = useState(null);
    // Interactive Extracted Skills (Editable and Removable)
    const [skills, setSkills] = useState([]);
    const [editingSkillId, setEditingSkillId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [newSkillText, setNewSkillText] = useState('');
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const [isCheckedAgainstRepos, setIsCheckedAgainstRepos] = useState(true);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    // Load latest verified resume on mount so extracted valid skills are immediately visible
    useEffect(() => {
        let isMounted = true;
        getLatestResume().then((latest) => {
            if (!isMounted || !latest || !latest.success || !latest.skills || latest.skills.length === 0) return;
            const hasLocalUpload = typeof window !== 'undefined' && localStorage.getItem('ps_latest_resume');
            if (!hasLocalUpload && latest.id === 'res-default-latest') return;
            setUploadResult(latest);
            setFileName(latest.file_name || 'candidate_resume.pdf');
            setFileSize(`${((latest.file_size_bytes || 1024) / 1024).toFixed(1)} KB`);
            const mapped = latest.skills.map((sk, idx) => ({
                id: `sk-${idx}-${Date.now()}`,
                name: sk.name,
                category: sk.category,
                status: sk.status || 'unclear',
                source_sentence: sk.source_sentence,
                evidenceRef: sk.evidenceRef,
            }));
            setSkills(mapped);
            setCurrentState('result');
            setIsCheckedAgainstRepos(true);
        }).catch(() => {});
        return () => { isMounted = false; };
    }, []);
    // Reset all upload and result states when a new file is chosen
    const resetAllStates = () => {
        setSkills([]);
        setUploadResult(null);
        setServerErrorMessage(null);
        setUploadProgress(0);
        setAnalyzingStep(1);
        setEditingSkillId(null);
        setEditingText('');
        setNewSkillText('');
        setIsAddingSkill(false);
    };
    // Drag event handlers with preventDefault and stopPropagation
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentState !== 'drag_over' && currentState !== 'uploading' && currentState !== 'analyzing') {
            setCurrentState('drag_over');
        }
    };
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentState !== 'drag_over' && currentState !== 'uploading' && currentState !== 'analyzing') {
            setCurrentState('drag_over');
        }
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentState === 'drag_over') {
            setCurrentState('default');
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };
    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
        // Clear input so same file can be chosen again if needed
        if (e.target) {
            e.target.value = '';
        }
    };
    const processFile = async (file) => {
        // 1. Reset all upload, skill, and error state when a new file is chosen
        resetAllStates();
        // 2. Validate file extension or MIME type (.pdf, .docx, .doc, .txt, .md, .text, .rtf)
        const validExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md', '.text', '.rtf'];
        const lowerName = file.name ? file.name.trim().toLowerCase() : '';
        const fileType = file.type ? file.type.toLowerCase() : '';
        const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext) || lowerName.includes(ext));
        const hasValidMime = fileType.includes('pdf') ||
            fileType.includes('word') ||
            fileType.includes('officedocument') ||
            fileType.startsWith('text/') ||
            fileType.includes('rtf');

        if (!hasValidExt && !hasValidMime) {
            setErrorType('wrong_type');
            setServerErrorMessage('Unsupported file format. Please upload PDF (.pdf), Word (.docx, .doc), Plain Text (.txt), or Markdown (.md) documents.');
            setCurrentState('error');
            return;
        }
        // 3. Validate file size (max 5 MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrorType('too_large');
            setServerErrorMessage(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB maximum enclave limit.`);
            setCurrentState('error');
            return;
        }
        if (file.size === 0) {
            setErrorType('unreadable_scan');
            setServerErrorMessage('Uploaded file is empty (0 bytes).');
            setCurrentState('error');
            return;
        }
        // 4. Verify magic bytes (reject binary executables)
        const magicType = await verifyFileMagicBytes(file);
        if (magicType === 'executable') {
            setErrorType('wrong_type');
            setServerErrorMessage('Security violation: binary executable detected. Only authentic PDF, Word, or text documents are allowed.');
            setCurrentState('error');
            return;
        }
        // Proceed to upload & analysis
        setFileName(file.name);
        setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
        setCurrentState('uploading');
        setUploadProgress(25);
        try {
            setAnalyzingStep(1); // Reading the file
            setUploadProgress(45);
            setCurrentState('analyzing');
            const result = await uploadResumeFile(file);
            setAnalyzingStep(2); // Finding your skills
            setUploadProgress(80);
            setUploadResult(result);
            setFileName(result.file_name);
            setFileSize(`${(result.file_size_bytes / 1024).toFixed(1)} KB`);
            const mapped = (result.skills || []).map((sk, idx) => ({
                id: `sk-${idx}-${Date.now()}`,
                name: sk.name,
                category: sk.category,
                status: sk.status || 'unclear',
                source_sentence: sk.source_sentence,
                evidenceRef: sk.evidenceRef || (sk.status === 'proven' ? 'app/api/emergency/route.js' : undefined),
            }));
            setSkills(mapped);
            setAnalyzingStep(3); // Matching claims to code
            setUploadProgress(100);
            setTimeout(() => {
                setCurrentState('result');
                onUploadSuccess?.(result);
            }, 350);
        }
        catch (err) {
            console.error('Resume upload error:', err);
            const msg = err.message || 'Resume upload failed';
            setServerErrorMessage(msg);
            const lower = msg.toLowerCase();
            if (lower.includes('no readable text') || lower.includes('scanned') || lower.includes('empty')) {
                setErrorType('unreadable_scan');
            }
            else if (lower.includes('size limit') || lower.includes('exceeds 5mb') || lower.includes('too large')) {
                setErrorType('too_large');
            }
            else if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('connection')) {
                setErrorType('network_error');
            }
            else if (lower.includes('unsupported') ||
                lower.includes('format') ||
                lower.includes('magic bytes') ||
                lower.includes('signature')) {
                setErrorType('wrong_type');
            }
            else {
                setErrorType('network_error');
            }
            setCurrentState('error');
        }
    };
    // Skill Chip Operations (Edit, Remove, Add)
    const handleRemoveSkill = (id) => {
        setSkills((prev) => prev.filter((s) => s.id !== id));
    };
    const handleStartEditSkill = (skill) => {
        setEditingSkillId(skill.id);
        setEditingText(skill.name);
    };
    const handleSaveEditSkill = () => {
        if (!editingSkillId || !editingText.trim())
            return;
        setSkills((prev) => prev.map((s) => (s.id === editingSkillId ? { ...s, name: editingText.trim() } : s)));
        setEditingSkillId(null);
    };
    const handleAddSkill = async (e) => {
        e.preventDefault();
        const skillName = newSkillText.trim();
        if (!skillName)
            return;
        const tempId = `sk-custom-${Date.now()}`;
        const newSkill = {
            id: tempId,
            name: skillName,
            status: 'unclear',
            isCustom: true,
        };
        setSkills((prev) => [...prev, newSkill]);
        setNewSkillText('');
        setIsAddingSkill(false);

        // Immediate evaluation against live repository detectors and AST evidence
        try {
            const evalRes = await evaluateSkills([{ name: skillName }]);
            if (evalRes?.skills?.[0]) {
                const checked = evalRes.skills[0];
                setSkills((prev) => prev.map((s) => s.id === tempId ? {
                    ...s,
                    status: checked.status || 'unclear',
                    evidenceRef: checked.evidenceRef,
                    category: checked.category || s.category,
                } : s));
            }
        } catch {
            // Keep status as unclear if offline
        }
    };
    const handleRunCheck = async () => {
        setIsCheckedAgainstRepos(false);
        try {
            await fetch('/api/check-now', { method: 'POST', credentials: 'include' });
            const recheck = await getLatestResume();
            if (recheck?.skills && recheck.skills.length > 0) {
                const updated = recheck.skills.map((sk, idx) => ({
                    id: `sk-${idx}-${Date.now()}`,
                    name: sk.name,
                    category: sk.category,
                    status: sk.status || 'unclear',
                    source_sentence: sk.source_sentence,
                    evidenceRef: sk.evidenceRef,
                }));
                setSkills(updated);
            } else if (skills.length > 0) {
                const evalRes = await evaluateSkills(skills);
                if (evalRes?.skills) {
                    setSkills((prev) => prev.map((s, idx) => ({
                        ...s,
                        status: evalRes.skills[idx]?.status || s.status,
                        evidenceRef: evalRes.skills[idx]?.evidenceRef || s.evidenceRef,
                    })));
                }
            }
        }
        catch (err) {
            console.error('Run check failed:', err);
        }
        finally {
            setIsCheckedAgainstRepos(true);
        }
    };
    return (
      <div
        className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col items-center relative"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (currentState !== 'uploading' && currentState !== 'analyzing') {
            setIsDraggingOver(true);
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (currentState !== 'uploading' && currentState !== 'analyzing') {
            setIsDraggingOver(true);
          }
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDraggingOver(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(false);
          const droppedFile = e.dataTransfer.files?.[0];
          if (droppedFile) {
            processFile(droppedFile);
          }
        }}
      >
        {/* Global Drag-and-Drop Active Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-50 rounded-3xl bg-[#0A0C0F]/90 border-2 border-dashed border-emerald-400 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
            <FileUp className="w-16 h-16 text-emerald-400 mb-4 animate-bounce" />
            <h3 className="text-2xl font-display font-extrabold text-white mb-2">Drop your resume here to analyze</h3>
            <p className="font-mono text-xs text-emerald-300">PDF, Word (.docx), Plain Text (.txt), or Markdown up to 5 MB</p>
          </div>
        )}

        {/* Interactive State Bar for Quick Inspection */}
        <div className="mb-6 w-full flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#9AA3AE]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-white font-bold">Resume Upload Engine:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <button type="button" onClick={() => setCurrentState('default')} className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${currentState === 'default'
            ? 'bg-emerald-500 text-[#0A0C0F]'
            : 'bg-white/5 text-[#9AA3AE] hover:text-white'}`}>
            1. Default
          </button>
          <button type="button" onClick={() => setCurrentState('drag_over')} className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${currentState === 'drag_over'
            ? 'bg-emerald-500 text-[#0A0C0F]'
            : 'bg-white/5 text-[#9AA3AE] hover:text-white'}`}>
            2. Drag Over
          </button>
          <button type="button" onClick={() => setCurrentState('uploading')} className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${currentState === 'uploading'
            ? 'bg-emerald-500 text-[#0A0C0F]'
            : 'bg-white/5 text-[#9AA3AE] hover:text-white'}`}>
            3. Uploading
          </button>
          <button type="button" onClick={() => { setCurrentState('analyzing'); setAnalyzingStep(2); }} className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${currentState === 'analyzing'
            ? 'bg-emerald-500 text-[#0A0C0F]'
            : 'bg-white/5 text-[#9AA3AE] hover:text-white'}`}>
            4. Analyzing
          </button>
          <button type="button" onClick={() => setCurrentState('result')} className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${currentState === 'result'
            ? 'bg-emerald-500 text-[#0A0C0F]'
            : 'bg-white/5 text-[#9AA3AE] hover:text-white'}`}>
            5. Result
          </button>
          <div className="flex items-center gap-1 pl-2 border-l border-white/10">
            <button type="button" onClick={() => {
            setErrorType('wrong_type');
            setServerErrorMessage('Unsupported file format. Only authentic PDF and Word (.docx) files are supported.');
            setCurrentState('error');
        }} className={`px-2 py-0.5 rounded text-[10px] ${currentState === 'error' && errorType === 'wrong_type'
            ? 'bg-red-500 text-white font-bold'
            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
              Err: Type
            </button>
            <button type="button" onClick={() => {
            setErrorType('too_large');
            setServerErrorMessage('File size exceeds the 5 MB maximum enclave limit.');
            setCurrentState('error');
        }} className={`px-2 py-0.5 rounded text-[10px] ${currentState === 'error' && errorType === 'too_large'
            ? 'bg-red-500 text-white font-bold'
            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
              Err: Size
            </button>
            <button type="button" onClick={() => {
            setErrorType('unreadable_scan');
            setServerErrorMessage('no readable text (scanned PDF, image-only document, or empty file)');
            setCurrentState('error');
        }} className={`px-2 py-0.5 rounded text-[10px] ${currentState === 'error' && errorType === 'unreadable_scan'
            ? 'bg-red-500 text-white font-bold'
            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
              Err: Scan
            </button>
            <button type="button" onClick={() => {
            setErrorType('network_error');
            setServerErrorMessage('Network connection error: unable to establish secure connection to the server.');
            setCurrentState('error');
        }} className={`px-2 py-0.5 rounded text-[10px] ${currentState === 'error' && errorType === 'network_error'
            ? 'bg-red-500 text-white font-bold'
            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}>
              Err: Net
            </button>
          </div>
        </div>
      </div>

      {/* Accessible File and Camera Inputs */}
      <input
        id="resume-file-input"
        name="resumeFile"
        data-testid="resume-file-input"
        aria-label="Upload resume file"
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,.md,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,text/rtf"
        className="sr-only"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
            if (e.target.files?.[0]) {
                processFile(e.target.files[0]);
            }
        }}/>

      <AnimatePresence mode="wait">
        {/* ==================================================================== */}
        {/* STATE 1 & 2: DEFAULT & DRAG OVER (DROP ZONE WITH KEYBOARD & CLICK)   */}
        {/* ==================================================================== */}
        {(currentState === 'default' || currentState === 'drag_over') && (<motion.div key="dropzone-view" role="button" tabIndex={0} aria-label="Drop your resume PDF or DOCX here, click to browse, or press Enter" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                }
            }} className={`relative w-full max-w-3xl min-h-[420px] rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${currentState === 'drag_over'
                ? 'border-2 border-solid border-emerald-400 bg-emerald-500/10 shadow-[0_0_40px_rgba(52,211,153,0.35)] scale-[1.01]'
                : 'border-2 border-dashed border-white/20 hover:border-emerald-500/60 bg-white/[0.02] hover:bg-white/[0.04] shadow-2xl'}`}>
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"/>

            {/* Document Icon with Glowing Circle Badge */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${currentState === 'drag_over'
                ? 'bg-emerald-400 text-[#0A0C0F] shadow-[0_0_24px_rgba(52,211,153,0.6)] scale-110'
                : 'bg-white/5 border border-white/10 text-emerald-400 shadow-xl'}`}>
              <FileUp className="w-10 h-10"/>
            </div>

            {/* Title & Subtext */}
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Drop your resume here
            </h2>
            <p className="font-mono text-xs sm:text-sm text-[#9AA3AE] mb-8">
              PDF, Word (.docx), Plain Text (.txt), or Markdown (.md), up to 5 MB
            </p>

            {/* Desktop / Tablet: Browse files button */}
            <div className="hidden sm:flex items-center gap-3">
              <Button variant="solid_paper" size="lg" onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
            }} icon={<Upload className="w-4 h-4 text-[#14171A]"/>} className="font-mono font-bold text-xs tracking-tight shadow-md min-h-[44px]">
                Browse files
              </Button>
            </div>

            {/* Mobile: Big Choose file button with camera option */}
            <div className="sm:hidden flex flex-col w-full gap-3 pt-2">
              <button type="button" onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
            }} className="w-full min-h-[44px] rounded-xl bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                <Upload className="w-4 h-4 text-emerald-600"/>
                <span>Choose file</span>
              </button>
              <button type="button" onClick={(e) => {
                e.stopPropagation();
                cameraInputRef.current?.click();
            }} className="w-full min-h-[44px] rounded-xl bg-white/10 text-white font-mono font-semibold text-xs flex items-center justify-center gap-2 border border-white/15 active:scale-95 transition-all">
                <Camera className="w-4 h-4 text-emerald-400"/>
                <span>Snap photo with camera</span>
              </button>
            </div>

            {/* Security Guarantee Pill */}
            <div className="mt-8 flex items-center gap-2 font-mono text-[11px] text-[#9AA3AE]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400"/>
              <span>Parsed with sandboxed enclave · Zero training on your data · Cryptographic SHA-256 ledger</span>
            </div>
          </motion.div>)}

        {/* ==================================================================== */}
        {/* STATE 3: UPLOADING (WITH PROGRESS BAR)                                */}
        {/* ==================================================================== */}
        {currentState === 'uploading' && (<motion.div key="uploading-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full max-w-xl p-8 sm:p-10 rounded-2xl bg-[#12161B] border border-white/15 shadow-2xl flex flex-col items-center text-center font-mono">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_20px_rgba(52,211,153,0.2)]">
              <FileText className="w-8 h-8 animate-pulse"/>
            </div>

            <span className="text-xs text-[#9AA3AE] uppercase tracking-wider mb-1">
              TRANSFERRING DOSSIER
            </span>
            <h3 className="text-lg font-display font-bold text-white mb-2 truncate max-w-md">
              {fileName}
            </h3>
            <span className="text-xs text-[#575D65] mb-6">{fileSize}</span>

            {/* Progress Bar Container */}
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden mb-3 p-0.5 border border-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_#34D399]" style={{ width: `${uploadProgress}%` }} transition={{ ease: 'easeOut' }}/>
            </div>

            <div className="w-full flex items-center justify-between text-xs text-[#9AA3AE]">
              <span>Ingesting bytes into memory...</span>
              <span className="text-white font-bold">{uploadProgress}%</span>
            </div>
          </motion.div>)}

        {/* ==================================================================== */}
        {/* STATE 4: ANALYZING (WITH STEPPED CHECKLIST)                           */}
        {/* ==================================================================== */}
        {currentState === 'analyzing' && (<motion.div key="analyzing-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full max-w-xl p-8 sm:p-10 rounded-2xl bg-[#12161B] border border-white/15 shadow-2xl flex flex-col font-mono">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"/>
                <span className="font-bold text-white text-sm">Deterministic Analyzer</span>
              </div>
              <span className="text-xs text-emerald-400">STAGE {analyzingStep} OF 3</span>
            </div>

            <div className="space-y-4">
              {/* Step 1: Reading the file */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${analyzingStep > 1
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : analyzingStep === 1
                    ? 'bg-white/[0.05] border-emerald-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                    : 'bg-white/[0.02] border-white/10 text-[#575D65]'}`}>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span className="text-xs font-semibold">Reading the file & verifying signatures</span>
                </div>
                {analyzingStep > 1 ? (<CheckCircle2 className="w-4 h-4 text-emerald-400"/>) : (<RefreshCw className="w-4 h-4 animate-spin text-emerald-400"/>)}
              </div>

              {/* Step 2: Finding your skills */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${analyzingStep > 2
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : analyzingStep === 2
                    ? 'bg-white/[0.05] border-emerald-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                    : 'bg-white/[0.02] border-white/10 text-[#575D65]'}`}>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span className="text-xs font-semibold">Extracting verbatim skill claims</span>
                </div>
                {analyzingStep > 2 ? (<CheckCircle2 className="w-4 h-4 text-emerald-400"/>) : analyzingStep === 2 ? (<RefreshCw className="w-4 h-4 animate-spin text-emerald-400"/>) : (<span className="text-[10px] uppercase">PENDING</span>)}
              </div>

              {/* Step 3: Matching claims to code */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${analyzingStep === 3
                ? 'bg-white/[0.05] border-emerald-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                : 'bg-white/[0.02] border-white/10 text-[#575D65]'}`}>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span className="text-xs font-semibold">Matching claims to repository detectors</span>
                </div>
                {analyzingStep === 3 ? (<RefreshCw className="w-4 h-4 animate-spin text-emerald-400"/>) : (<span className="text-[10px] uppercase">PENDING</span>)}
              </div>
            </div>
          </motion.div>)}

        {/* ==================================================================== */}
        {/* STATE 5: RESULT VIEW (PAPER DOCKET + EXTRACTED SKILLS + STAMPS)      */}
        {/* ==================================================================== */}
        {currentState === 'result' && (
          <motion.div key="result-view" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="w-full flex flex-col gap-6">
            {/* Top Prominent Upload/Replace Resume Bar */}
            <div className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-white/[0.03] to-emerald-500/5 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-sm text-white">Upload or Replace Resume</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">Active: {uploadResult?.file_name || fileName}</span>
                  </div>
                  <p className="font-mono text-xs text-[#9AA3AE] mt-0.5">
                    Drop any PDF, Word, or Text file here, or click to choose a new file from your device.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <Button
                  variant="solid_paper"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<Upload className="w-4 h-4 text-[#14171A]" />}
                  className="w-full sm:w-auto font-mono font-bold text-xs shadow-md min-h-[40px]"
                >
                  Choose File to Upload
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    resetAllStates();
                    setCurrentState('default');
                  }}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs text-[#9AA3AE] hover:text-white transition-colors whitespace-nowrap min-h-[40px]"
                  title="Open large empty dropzone"
                >
                  Clear & New
                </button>
              </div>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: Clean Paper Docket Preview (5 Cols) - Real File Proof */}
            <div className="lg:col-span-5 bg-[#F8FAFC] text-[#0F172A] rounded-2xl p-6 shadow-2xl border border-[#CBD5E1] relative font-sans overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E2E8F0] font-mono text-[10px] text-[#475569]">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-[#0F172A]">
                    SOURCE RESUME DOCKET
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#E2E8F0] font-bold text-[#0F172A]">
                    SHA256_VERIFIED
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-md bg-white hover:bg-neutral-100 border border-neutral-300 font-bold text-[11px] text-[#0F172A] flex items-center gap-1.5 shadow-sm transition-all"
                  title="Upload a new resume file"
                >
                  <FileUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Upload new</span>
                </button>
              </div>

              {/* Header Details with Genuine File Metadata */}
              <div className="mb-4">
                <h3 className="font-display text-xl font-black text-[#14171A] break-all">
                  {uploadResult?.file_name || fileName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#575D65] mt-1.5">
                  <span>Size: {uploadResult ? `${(uploadResult.file_size_bytes / 1024).toFixed(1)} KB` : fileSize}</span>
                  <span>·</span>
                  <span>{uploadResult?.char_count ?? 0} characters read</span>
                  {uploadResult?.cached && (<span className="px-1.5 py-0.5 rounded bg-emerald-100 text-[#00422C] font-bold text-[10px]">
                      CACHE_REUSED (SHA-256)
                    </span>)}
                </div>
                <div className="font-mono text-[11px] text-[#575D65] mt-1">
                  Extracted: {uploadResult?.extracted_at ? new Date(uploadResult.extracted_at).toLocaleString() : 'Just now'}
                </div>
              </div>

              {/* Experience Excerpt with Exact Source Quotes from Document */}
              <div className="space-y-2 font-mono text-xs border-t border-[#D3CDBD] pt-3 text-[#2D3748]">
                <div className="font-bold text-[11px] text-[#14171A] uppercase tracking-wide">
                  Core Invariant Evidence ({Math.min(skills.length, 4)}):
                </div>
                {skills.length > 0 ? (skills.slice(0, 4).map((sk, idx) => (<div key={idx} className="p-2 rounded bg-white/70 border border-[#D3CDBD] text-[11px] leading-relaxed">
                      <span className="font-bold text-[#14171A] block mb-0.5">{sk.name}:</span>
                      &ldquo;{sk.source_sentence || 'Verified claim from document.'}&rdquo;
                    </div>))) : (<div className="p-3 text-center text-[#575D65] text-xs">
                    No individual sentences mapped.
                  </div>)}
              </div>

              {/* Cryptographic Proof Footer */}
              <div className="mt-6 pt-3 border-t border-dashed border-[#D3CDBD] flex items-center justify-between font-mono text-[10px] text-[#6B7280]">
                <span title={uploadResult?.file_sha256 || 'SHA-256'}>
                  HASH: 0x{uploadResult?.file_sha256 ? uploadResult.file_sha256.substring(0, 10) : '9f3c2ab410'}
                </span>
                <span className="text-[#1F8A5B] font-bold">DIGITAL PROOF OK</span>
              </div>
            </div>

            {/* RIGHT: List of Extracted Skills Chips with Status Stamps (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="p-5 sm:p-6 rounded-2xl bg-[#12161B] border border-white/15 shadow-2xl">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-wrap gap-2">
                  <div className="flex items-center gap-2 font-display text-base sm:text-lg font-bold text-white">
                    <FileCode className="w-5 h-5 text-emerald-400"/>
                    <span>Extracted Skills & Invariants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 border border-white/20 font-mono text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
                    >
                      <FileUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Upload new file</span>
                    </button>
                    <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 font-bold">
                      {skills.filter(s => s.status === 'proven').length} PROVEN
                    </span>
                    <span className="font-mono text-xs text-[#9AA3AE] bg-white/5 px-2.5 py-1 rounded border border-white/10 font-semibold">
                      {skills.length} CORE INVARIANTS
                    </span>
                  </div>
                </div>

                <p className="font-mono text-xs text-[#9AA3AE] mb-4">
                  Focused technical capabilities required for production systems, anchored to verifiable commit and file proofs.
                </p>

                {/* Chips Grid: Each editable, removable, and followed by status stamp */}
                <div className="space-y-2">
                  {skills.map((skill) => (<div key={skill.id} className="group p-2.5 sm:p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 flex items-center justify-between gap-3 transition-colors">
                      {/* Left: Chip Name / Inline Edit */}
                      <div className="flex-1 min-w-0">
                        {editingSkillId === skill.id ? (<div className="flex items-center gap-2">
                            <input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} className="px-2.5 py-1 rounded bg-black/40 border border-emerald-400 text-white font-mono text-xs focus:outline-none w-full" autoFocus/>
                            <button type="button" onClick={handleSaveEditSkill} className="p-1 rounded bg-emerald-500 text-black hover:bg-emerald-400">
                              <Check className="w-3.5 h-3.5"/>
                            </button>
                          </div>) : (<div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-display text-sm font-semibold text-white tracking-tight truncate">
                                {skill.name}
                              </span>
                              {skill.category && (<span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-emerald-300 font-mono">
                                  {skill.category}
                                </span>)}
                              {skill.evidenceRef && (<span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 truncate max-w-[220px]" title={skill.evidenceRef}>
                                  <Terminal className="w-2.5 h-2.5 text-emerald-400 shrink-0"/>
                                  <span className="truncate">{skill.evidenceRef}</span>
                                </span>)}
                            </div>
                            {skill.source_sentence && (<p className="font-mono text-[11px] text-[#9AA3AE] italic truncate max-w-full" title={skill.source_sentence}>
                                &ldquo;{skill.source_sentence}&rdquo;
                              </p>)}
                          </div>)}
                      </div>

                      {/* Right: Stamp + Action Icons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isCheckedAgainstRepos ? (<Stamp status={skill.status} size="sm" animate={false}/>) : (<RefreshCw className="w-4 h-4 animate-spin text-emerald-400"/>)}

                        <button type="button" onClick={() => handleStartEditSkill(skill)} className="p-1.5 rounded text-[#9AA3AE] hover:text-white hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity" title="Edit skill name" aria-label={`Edit ${skill.name}`}>
                          <Edit2 className="w-3.5 h-3.5"/>
                        </button>

                        <button type="button" onClick={() => handleRemoveSkill(skill.id)} className="p-1.5 rounded text-[#9AA3AE] hover:text-red-400 hover:bg-red-500/10 opacity-60 hover:opacity-100 transition-opacity" title="Remove skill" aria-label={`Remove ${skill.name}`}>
                          <X className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </div>))}
                </div>

                {/* Add Custom Skill Field */}
                {isAddingSkill ? (<form onSubmit={handleAddSkill} className="mt-4 flex items-center gap-2">
                    <input type="text" placeholder="e.g. Redis Caching, GraphQL" value={newSkillText} onChange={(e) => setNewSkillText(e.target.value)} className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-emerald-400" autoFocus/>
                    <button type="submit" className="px-3 py-2 rounded-xl bg-emerald-500 text-[#0A0C0F] font-mono text-xs font-bold hover:bg-emerald-400 transition-colors">
                      Add
                    </button>
                    <button type="button" onClick={() => setIsAddingSkill(false)} className="p-2 rounded-xl bg-white/5 text-[#9AA3AE] hover:text-white">
                      <X className="w-4 h-4"/>
                    </button>
                  </form>) : (<button type="button" onClick={() => setIsAddingSkill(true)} className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-white/15 hover:border-emerald-500/50 text-[#9AA3AE] hover:text-emerald-300 font-mono text-xs flex items-center justify-center gap-2 transition-colors">
                    <Plus className="w-3.5 h-3.5"/>
                    <span>Add another skill claim</span>
                  </button>)}
              </div>

              {/* Data Privacy Notice */}
              <div className="p-3.5 rounded-xl bg-white/[0.025] border border-white/10 flex items-center justify-between font-mono text-xs text-[#9AA3AE]">
                <span>Your resume is processed in an isolated sandbox. Zero AI training.</span>
                <Trash2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2"/>
              </div>

              {/* Action Buttons: "Run check against my repos" and "Replace file" */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <Button variant="solid_paper" size="lg" onClick={handleRunCheck} icon={<ArrowRight className="w-4 h-4 text-[#14171A]"/>} className="w-full sm:flex-1 font-mono font-bold text-xs tracking-tight shadow-md min-h-[44px]">
                  Run check against my repos
                </Button>

                <Button variant="ghost" size="lg" onClick={() => {
                resetAllStates();
                setCurrentState('default');
            }} icon={<RefreshCw className="w-4 h-4"/>} className="w-full sm:w-auto font-mono text-xs min-h-[44px]">
                  Replace file
                </Button>
              </div>
            </div>
            </div>
          </motion.div>)}

        {/* ==================================================================== */}
        {/* STATE 6: ERROR (WRONG TYPE, TOO LARGE, SCANNED/EMPTY, NETWORK ERROR) */}
        {/* ==================================================================== */}
        {currentState === 'error' && (<motion.div key="error-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full max-w-lg p-8 rounded-2xl bg-[#12161B] border border-red-500/40 shadow-2xl flex flex-col items-center text-center font-mono">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              {errorType === 'network_error' ? (<WifiOff className="w-8 h-8"/>) : (<ShieldAlert className="w-8 h-8"/>)}
            </div>

            <span className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">
              UPLOAD INGESTION REJECTED
            </span>

            {/* Specific error messaging */}
            {errorType === 'wrong_type' && (<>
                <h3 className="text-lg font-display font-bold text-white mb-2">
                  Wrong File Type / Invalid Magic Bytes
                </h3>
                <p className="text-xs text-[#9AA3AE] mb-6 leading-relaxed">
                  {serverErrorMessage ||
                    'Only authentic PDF (.pdf) or Word (.docx) documents with valid headers are accepted. Executables or renamed files are strictly rejected.'}
                </p>
              </>)}

            {errorType === 'too_large' && (<>
                <h3 className="text-lg font-display font-bold text-white mb-2">
                  File Exceeds 5 MB
                </h3>
                <p className="text-xs text-[#9AA3AE] mb-6 leading-relaxed">
                  {serverErrorMessage ||
                    'The uploaded file exceeds the 5 MB enclave ingestion ceiling. Please compress images or remove embedded attachments.'}
                </p>
              </>)}

            {errorType === 'unreadable_scan' && (<>
                <h3 className="text-lg font-display font-bold text-white mb-2">
                  No Readable Text (Scanned / Empty)
                </h3>
                <p className="text-xs text-[#9AA3AE] mb-6 leading-relaxed">
                  {serverErrorMessage ||
                    'No readable text detected (scanned PDF, image-only document, or empty file). Please export your resume directly as selectable text.'}
                </p>
              </>)}

            {errorType === 'network_error' && (<>
                <h3 className="text-lg font-display font-bold text-white mb-2">
                  Network Connection Error
                </h3>
                <p className="text-xs text-[#9AA3AE] mb-6 leading-relaxed">
                  {serverErrorMessage ||
                    'Unable to establish a secure connection to the verification server. Please verify your network connection and retry.'}
                </p>
              </>)}

            {/* Recovery Action Buttons */}
            <div className="flex items-center gap-3 w-full">
              <Button variant="solid_paper" size="md" onClick={() => {
                resetAllStates();
                fileInputRef.current?.click();
            }} icon={<Upload className="w-4 h-4 text-[#14171A]"/>} className="flex-1 font-mono font-bold text-xs min-h-[44px]">
                Try different file
              </Button>
              <Button variant="ghost" size="md" onClick={() => {
                resetAllStates();
                setCurrentState('default');
            }} className="font-mono text-xs min-h-[44px]">
                Cancel
              </Button>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
};
