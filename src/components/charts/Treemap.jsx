import React from 'react';
import { clsx } from 'clsx';
export const TreemapTile = ({ item, onClick, className }) => {
    const statusStyles = {
        proven: 'bg-gradient-to-br from-[#1F8A5B]/85 to-[#0F5A38]/95 border-[#1F8A5B]/60 text-white shadow-[0_4px_14px_rgba(31,138,91,0.25)]',
        basic: 'bg-gradient-to-br from-[#B7791F]/85 to-[#8C5712]/95 border-[#B7791F]/60 text-white shadow-[0_4px_14px_rgba(183,121,31,0.25)]',
        not_shown: 'bg-gradient-to-br from-[#64748B]/40 to-[#334155]/60 border-[#64748B]/40 border-dashed text-slate-200 shadow-[0_4px_14px_rgba(0,0,0,0.3)]',
        unclear: 'bg-gradient-to-br from-[#6D5BD0]/80 to-[#4F3FB0]/90 border-[#6D5BD0]/50 text-white shadow-[0_4px_14px_rgba(109,91,208,0.25)]',
        attack: 'bg-gradient-to-br from-[#C2362B]/85 to-[#8A1F17]/95 border-[#C2362B]/60 text-white shadow-[0_4px_14px_rgba(194,54,43,0.3)]',
        refused: 'bg-gradient-to-br from-[#FF5C4D]/85 to-[#B82F24]/95 border-[#FF5C4D]/60 text-white',
        hollow: 'bg-gradient-to-br from-[#FF5C4D]/85 to-[#B82F24]/95 border-[#FF5C4D]/60 text-white',
        fulfilled: 'bg-gradient-to-br from-[#1F8A5B]/85 to-[#0F5A38]/95 border-[#1F8A5B]/60 text-white',
        partly: 'bg-gradient-to-br from-[#B7791F]/85 to-[#8C5712]/95 border-[#B7791F]/60 text-white',
        not_fulfilled: 'bg-gradient-to-br from-[#64748B]/40 to-[#334155]/60 border-[#64748B]/40 text-slate-200',
        pending: 'bg-gradient-to-br from-[#64748B]/40 to-[#334155]/60 border-[#64748B]/40 text-slate-200',
    };
    return (<div role="button" tabIndex={0} aria-label={`${item.name}, ${item.status} status, ${item.size} lines of code`} onClick={() => onClick?.(item)} onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(item);
            }
        }} className={clsx('relative rounded-[12px] p-3 flex flex-col justify-between border cursor-pointer select-none transition-all duration-200', 'hover:brightness-110 hover:scale-[1.01]', item.span || 'col-span-1 row-span-1', statusStyles[item.status] || statusStyles.not_shown, item.isPulsing && 'ring-2 ring-[#34D399] shadow-[0_0_24px_rgba(52,211,153,0.6)] animate-pulse', className)}>
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 pr-1">
          <span className="text-sm font-bold tracking-tight block truncate">
            {item.name}
          </span>
          <span className="text-[10px] font-mono opacity-80 block truncate mt-0.5">
            {item.path}
          </span>
        </div>
        {item.meta && (<span className="px-1.5 py-0.5 rounded bg-black/30 border border-white/20 text-[10px] font-mono font-bold flex-shrink-0">
            {item.meta}
          </span>)}
      </div>

      {/* Optional attached physical paper tag */}
      {item.paperTag && (<div className="self-end mt-2 bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-tight shadow-md flex items-center gap-1.5 transform rotate-[1deg]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"/>
          <span>{item.paperTag}</span>
        </div>)}
    </div>);
};
export const Treemap = ({ items, title = 'Proof Map', onSelectTile, className, }) => {
    return (<div role="region" aria-label="Repository Proof Treemap" className={clsx('glass-panel rounded-panel p-4 flex flex-col justify-between select-none', className)}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1F8A5B]/20 text-[#34D399] border border-[#1F8A5B]/30 font-medium font-mono">
            LIVE MERKLE SYNC
          </span>
        </div>

        {/* Legend explicitly stating: "Rectangle size = file size only" */}
        <span className="text-xs text-[#9AA3AE] font-mono italic">
          Rectangle size = file size only
        </span>
      </div>

      {/* Treemap Mosaic Grid */}
      <div className="grid grid-cols-6 gap-2 my-3 min-h-[260px]">
        {items.map((item) => (<TreemapTile key={item.id} item={item} onClick={onSelectTile}/>))}
      </div>

      {/* Legend Footer */}
      <footer className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#9AA3AE]">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#1F8A5B]"/>
          <span className="text-[#F4F2EC] font-medium">PROVEN</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#B7791F]"/>
          <span className="text-[#F4F2EC] font-medium">BASIC</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#64748B]"/>
          <span className="text-[#F4F2EC] font-medium">NOT SHOWN IN SCOPE</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#6D5BD0]"/>
          <span className="text-[#F4F2EC] font-medium">UNCLEAR</span>
        </div>
      </footer>
    </div>);
};
