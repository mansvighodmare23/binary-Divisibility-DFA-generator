import React, { useState } from 'react';
import { ArrowRight, Sparkles, Hash, AlertTriangle } from 'lucide-react';

interface DFAControlsProps {
  n: number;
  onGenerate: (n: number) => void;
}

export const DFAControls: React.FC<DFAControlsProps> = ({ n, onGenerate }) => {
  const [inputValue, setInputValue] = useState<string>(n.toString());
  const [error, setError] = useState<string | null>(null);

  const presets = [
    { label: 'n = 3', val: 3, note: 'Classic Mod 3' },
    { label: 'n = 5', val: 5, note: 'Prime Mod 5' },
    { label: 'n = 7', val: 7, note: 'Prime Mod 7' },
    { label: 'n = 2', val: 2, note: 'Even/Odd' },
    { label: 'n = 4', val: 4, note: 'Power of 2' },
    { label: 'n = 10', val: 10, note: 'Decimal Base' },
  ];

  const handleApply = (targetValue: number) => {
    if (isNaN(targetValue) || targetValue < 1) {
      setError('Please enter a positive integer greater than or equal to 1.');
      return;
    }
    if (targetValue > 25) {
      setError('For visual clarity in the state diagram, n is capped at 25 states.');
      return;
    }
    setError(null);
    setInputValue(targetValue.toString());
    onGenerate(targetValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputValue.trim(), 10);
    handleApply(parsed);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg shadow-black/20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Input field and primary CTA */}
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="divisor-input" className="text-xs sm:text-sm font-semibold text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
              <Hash className="w-4 h-4 text-indigo-400" />
              Divisor (<span className="italic font-serif">n</span>):
            </label>
            <div className="relative">
              <input
                id="divisor-input"
                type="number"
                min="1"
                max="25"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError(null);
                }}
                className="w-24 px-3 py-2 text-sm font-bold bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-center transition-all"
                placeholder="e.g. 3"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Generate DFA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Preset quick buttons */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Presets:
          </span>
          {presets.map((p) => {
            const isActive = n === p.val;
            return (
              <button
                key={p.val}
                type="button"
                onClick={() => handleApply(p.val)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:bg-slate-700 hover:text-white'
                }`}
                title={p.note}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* DFA Formal Summary bar */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex flex-col">
          <span className="text-slate-400">Total States (Q)</span>
          <span className="font-mono font-semibold text-slate-100">
            {n} states ({n <= 6 ? Array.from({ length: n }, (_, i) => `q${i}`).join(', ') : `q0 … q${n - 1}`})
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Initial State (q₀)</span>
          <span className="font-mono font-semibold text-emerald-400">q0 (remainder 0)</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Accepting Set (F)</span>
          <span className="font-mono font-semibold text-emerald-400">{`{ q0 }`} (double circle)</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Alphabet (Σ)</span>
          <span className="font-mono font-semibold text-indigo-300">{`{ 0, 1 }`} (binary)</span>
        </div>
      </div>
    </div>
  );
};
