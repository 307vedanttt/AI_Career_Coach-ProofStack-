import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Check, Copy, Lock } from 'lucide-react';
import { Stamp } from '../stamps/Stamp';

export interface ChainBlockProps {
  blockHeight: number;
  commitHash: string;
  previousHash: string;
  timestamp: string;
  invariantsProven: number;
  author: string;
  merkleRoot: string;
  className?: string;
}

export const ChainBlock: React.FC<ChainBlockProps> = ({
  blockHeight,
  commitHash,
  previousHash,
  timestamp,
  invariantsProven,
  author,
  merkleRoot,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText?.(merkleRoot);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="article"
      aria-label={`Ledger Block ${blockHeight} for commit ${commitHash}`}
      className={clsx(
        'glass-panel rounded-panel p-4 flex flex-col justify-between font-mono text-xs select-none',
        'border-l-4 border-l-[#1F8A5B] transition-all hover:border-white/20',
        className
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <span className="text-white font-bold text-sm tracking-tight">
            BLOCK #{blockHeight.toString().padStart(4, '0')}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#9AA3AE] border border-white/10">
            {timestamp}
          </span>
        </div>

        <Stamp status="proven" size="sm" />
      </div>

      {/* Block Body Data */}
      <div className="my-3 space-y-2 text-[#9AA3AE]">
        <div className="flex items-center justify-between">
          <span>Commit SHA:</span>
          <span className="text-white font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
            {commitHash}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Previous Hash:</span>
          <span className="text-[#64748B] truncate max-w-[180px]">
            {previousHash}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Committer:</span>
          <span className="text-[#F4F2EC]">{author}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Invariants Proven:</span>
          <span className="text-[#34D399] font-bold">
            +{invariantsProven} Invariant Checks
          </span>
        </div>
      </div>

      {/* Merkle Root & Copy Action */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
        <div className="flex items-center space-x-1.5 truncate pr-2">
          <Lock className="w-3.5 h-3.5 text-[#1F8A5B] flex-shrink-0" aria-hidden="true" />
          <span className="text-[#6B7280]">Root:</span>
          <span className="text-white font-bold truncate">{merkleRoot}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Evidence hash copied' : 'Copy evidence root hash'}
          className="flex items-center space-x-1 text-[#34D399] hover:text-white px-2 py-1 rounded bg-[#1F8A5B]/10 hover:bg-[#1F8A5B]/20 transition-colors flex-shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
