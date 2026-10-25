import React from 'react';

/**
 * Pure React JS (.jsx) component verifying JavaScript interoperability.
 */
export function JsxTestBadge({ label = 'React JS Component Active' }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span>{label}</span>
    </div>
  );
}

export default JsxTestBadge;
