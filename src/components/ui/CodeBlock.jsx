import React from 'react';
import { clsx } from 'clsx';
export const CodeBlock = ({ code, startLine = 1, highlightLines = [], highlightType = 'emerald', fileName, className, ariaLabel = 'Source code evidence preview', }) => {
    // Safe line-by-line split without dangerouslySetInnerHTML
    const lines = code.replace(/\r\n/g, '\n').split('\n');
    const highlightBorderClasses = {
        emerald: 'bg-[#1F8A5B]/15 border-l-4 border-l-[#1F8A5B]',
        red: 'bg-[#FF5C4D]/15 border-l-4 border-l-[#FF5C4D]',
        amber: 'bg-[#F5A524]/15 border-l-4 border-l-[#F5A524]',
    };
    const highlightLineNumberClasses = {
        emerald: 'text-[#34D399] font-bold',
        red: 'text-[#FF5C4D] font-bold',
        amber: 'text-[#F5A524] font-bold',
    };
    return (<div role="region" aria-label={ariaLabel} className={clsx('rounded-lg bg-[#0F1318] text-[#D4D8DE] border border-white/10 font-mono text-[13px] leading-[20px] shadow-inner overflow-hidden', className)}>
      {/* Optional file header */}
      {fileName && (<div className="flex items-center justify-between px-3.5 py-1.5 bg-black/40 border-b border-white/10 text-xs text-[#9AA3AE] select-none">
          <span className="font-medium text-white/90">{fileName}</span>
          <span className="text-[11px] text-[#6B7280]">UTF-8 • Checked</span>
        </div>)}

      {/* Code viewport with line numbers */}
      <pre className="p-3 overflow-x-auto m-0 font-mono">
        <code>
          {lines.map((lineContent, index) => {
            const currentLineNum = startLine + index;
            const isHighlighted = highlightLines.includes(currentLineNum);
            return (<div key={currentLineNum} className={clsx('flex items-center -mx-3 px-3 py-0.5 transition-colors', isHighlighted && highlightBorderClasses[highlightType])}>
                {/* Gutter / Line Number */}
                <span className={clsx('w-8 text-right pr-3 select-none text-xs text-[#4E5664] flex-shrink-0', isHighlighted && highlightLineNumberClasses[highlightType])} aria-hidden="true">
                  {currentLineNum}
                </span>

                {/* Line text escaped by React automatically */}
                <span className="whitespace-pre overflow-x-visible text-[#E6EDF3]">
                  {lineContent || ' '}
                </span>
              </div>);
        })}
        </code>
      </pre>
    </div>);
};
