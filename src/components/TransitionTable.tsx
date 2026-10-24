import React, { useState } from 'react';
import { DFA } from '../types';
import { Copy, Check, Info } from 'lucide-react';
import { getMarkdownExport } from '../utils/dfa';

interface TransitionTableProps {
  dfa: DFA;
  activeStateId?: number | null;
  activeSymbol?: '0' | '1' | null;
}

export const TransitionTable: React.FC<TransitionTableProps> = ({
  dfa,
  activeStateId,
  activeSymbol,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyMarkdown = async () => {
    try {
      const text = getMarkdownExport(dfa);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Table Header Controls */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-slate-950/80 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>DFA Transition Table (δ)</span>
            <span className="text-xs font-normal text-slate-400">· Divisibility by {dfa.n}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Formula: <span className="font-mono text-indigo-300">δ(qi, b) = q((2×i + b) mod {dfa.n})</span>
          </p>
        </div>

        <button
          onClick={handleCopyMarkdown}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700/80 transition-all cursor-pointer whitespace-nowrap"
          title="Copy Markdown Table"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied Table</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Markdown</span>
            </>
          )}
        </button>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead className="bg-slate-950/90 sticky top-0 z-10 border-b border-slate-800 font-semibold text-slate-300">
            <tr>
              <th className="py-3 px-4 sm:px-6">State</th>
              <th className={`py-3 px-4 sm:px-6 ${activeSymbol === '0' ? 'text-sky-300 bg-sky-950/30' : ''}`}>
                Input 0 <span className="text-slate-400 font-normal hidden md:inline">(2×i mod {dfa.n})</span>
              </th>
              <th className={`py-3 px-4 sm:px-6 ${activeSymbol === '1' ? 'text-sky-300 bg-sky-950/30' : ''}`}>
                Input 1 <span className="text-slate-400 font-normal hidden md:inline">((2×i + 1) mod {dfa.n})</span>
              </th>
              <th className="py-3 px-4 sm:px-6">State Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {dfa.states.map((state) => {
              const to0 = dfa.transitions[state.id]['0'];
              const to1 = dfa.transitions[state.id]['1'];
              const isRowActive = activeStateId === state.id;

              return (
                <tr
                  key={state.id}
                  className={`transition-colors ${
                    isRowActive
                      ? 'bg-sky-950/50 text-white font-bold ring-1 ring-inset ring-sky-500/50'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  {/* State Name */}
                  <td className="py-2.5 px-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      {state.isStart && (
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.5 rounded">
                          → START
                        </span>
                      )}
                      <span className={`font-bold ${state.isAccepting ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {state.name}
                      </span>
                      <span className="text-slate-400 text-xs font-normal">
                        (r = {state.remainder})
                      </span>
                    </div>
                  </td>

                  {/* Transition on 0 */}
                  <td
                    className={`py-2.5 px-4 sm:px-6 ${
                      isRowActive && activeSymbol === '0'
                        ? 'bg-sky-500/20 text-sky-200 font-bold'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={to0 === 0 ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
                        q{to0}
                      </span>
                      <span className="text-slate-400 text-[11px] font-normal hidden sm:inline">
                        ({(2 * state.id) % dfa.n})
                      </span>
                    </div>
                  </td>

                  {/* Transition on 1 */}
                  <td
                    className={`py-2.5 px-4 sm:px-6 ${
                      isRowActive && activeSymbol === '1'
                        ? 'bg-sky-500/20 text-sky-200 font-bold'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={to1 === 0 ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
                        q{to1}
                      </span>
                      <span className="text-slate-400 text-[11px] font-normal hidden sm:inline">
                        ({(2 * state.id + 1) % dfa.n})
                      </span>
                    </div>
                  </td>

                  {/* State Type */}
                  <td className="py-2.5 px-4 sm:px-6 font-sans">
                    {state.isAccepting ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Initial & Accepting (Final)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Non-accepting (Remainder {state.remainder})
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Annotation */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Table size: {dfa.n} states × 2 input symbols = {dfa.n * 2} transitions.</span>
        </span>
        <span className="font-mono text-[11px] text-emerald-400">
          Accepting Condition: δ*(q0, w) = q0
        </span>
      </div>
    </div>
  );
};
