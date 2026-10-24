import React from 'react';
import { DFA } from '../types';
import { BookOpen, Calculator, CheckCircle2, Lightbulb, Compass, Award } from 'lucide-react';

interface TheorySectionProps {
  dfa: DFA;
}

export const TheorySection: React.FC<TheorySectionProps> = ({ dfa }) => {
  return (
    <div className="space-y-6">
      {/* Educational Banner Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              How It Works: Modular Arithmetic & Binary DFAs
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Deterministic Finite Automata can perform division in real time because the remainder of a binary stream can be computed incrementally bit-by-bit without storing the full number in memory.
            </p>
          </div>
        </div>

        {/* State Mapping Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              1. State Remainder Mapping
            </h4>
            <p className="text-xs text-slate-300 mb-3">
              For any positive integer <span className="font-mono text-indigo-300">n</span>, dividing any integer by <span className="font-mono text-indigo-300">n</span> can yield exactly <span className="font-mono text-indigo-300">n</span> possible remainders: <span className="font-mono text-indigo-300">0, 1, 2, …, n-1</span>.
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded p-3 font-mono text-xs text-slate-300 space-y-1">
              <div>q0 → remainder 0 <span className="text-emerald-400 font-semibold">(divisible by {dfa.n})</span></div>
              <div>q1 → remainder 1</div>
              {dfa.n > 2 && <div>q2 → remainder 2</div>}
              {dfa.n > 4 && <div className="text-slate-500">…</div>}
              {dfa.n > 3 && <div>q{dfa.n - 1} → remainder {dfa.n - 1}</div>}
              <div className="pt-2 text-emerald-400 text-[11px] font-sans border-t border-slate-800">
                Since <strong className="font-mono">q0</strong> represents remainder 0, reaching <strong className="font-mono">q0</strong> at the end of the binary string guarantees that the number is divisible by {dfa.n}.
              </div>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              2. The Transition Formula
            </h4>
            <p className="text-xs text-slate-300 mb-2">
              When processing a binary string from left to right (Most Significant Bit to Least Significant Bit), appending a new bit <span className="font-mono text-sky-300">b ∈ {'{0, 1}'}</span> shifts the previous value <span className="font-mono text-sky-300">V</span> to the left:
            </p>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-center text-sky-300 my-2">
              V_new = 2 × V_prev + b
            </div>
            <p className="text-xs text-slate-300 mt-2">
              By modular arithmetic properties:
            </p>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-center text-emerald-300 my-2">
              (2 × V_prev + b) mod n = (2 × (V_prev mod n) + b) mod n
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Hence, knowing only the current remainder <span className="font-mono text-indigo-300">r = V_prev mod n</span> is sufficient to compute the new remainder!
            </p>
          </div>
        </div>

        {/* Formal Definition & 5-Tuple Box */}
        <div className="mt-5 bg-slate-950/70 border border-slate-800/80 rounded-lg p-4">
          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            Formal 5-Tuple Definition: M = (Q, Σ, δ, q₀, F)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
              <span className="text-slate-400 block text-[11px] font-sans">Set of States (Q)</span>
              <span className="text-slate-200 font-bold block mt-1">
                {'{ '}q0, …, q{dfa.n - 1}{' }'}
              </span>
              <span className="text-slate-400 text-[10px] block mt-0.5 font-sans">|Q| = {dfa.n} states</span>
            </div>

            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
              <span className="text-slate-400 block text-[11px] font-sans">Alphabet (Σ)</span>
              <span className="text-indigo-300 font-bold block mt-1">{'{ 0, 1 }'}</span>
              <span className="text-slate-400 text-[10px] block mt-0.5 font-sans">Binary alphabet</span>
            </div>

            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
              <span className="text-slate-400 block text-[11px] font-sans">Initial State (q₀)</span>
              <span className="text-emerald-400 font-bold block mt-1">q0</span>
              <span className="text-slate-400 text-[10px] block mt-0.5 font-sans">Starts at remainder 0</span>
            </div>

            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
              <span className="text-slate-400 block text-[11px] font-sans">Final States (F)</span>
              <span className="text-emerald-400 font-bold block mt-1">{'{ q0 }'}</span>
              <span className="text-slate-400 text-[10px] block mt-0.5 font-sans">Only remainder 0 accepted</span>
            </div>

            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg sm:col-span-2 lg:col-span-1">
              <span className="text-slate-400 block text-[11px] font-sans">Transition Function (δ)</span>
              <span className="text-sky-300 font-bold block mt-1 text-[11px]">
                δ(qi, b) = q((2i+b)%{dfa.n})
              </span>
              <span className="text-slate-400 text-[10px] block mt-0.5 font-sans">Deterministic function</span>
            </div>
          </div>
        </div>

        {/* Walkthrough Example */}
        <div className="mt-5 p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            Concrete Example: Tracing "110" on n = 3
          </h4>
          <p className="text-xs text-slate-300 mb-3">
            Let binary string <span className="font-mono text-white">w = 110₂</span>, which equals decimal <span className="font-mono text-white">6₁₀</span>. Since <span className="font-mono text-emerald-300">6 mod 3 = 0</span>, it is divisible by 3.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
              <div className="text-slate-400 text-[10px]">Step 0 (Start)</div>
              <div className="font-bold text-emerald-400 mt-1">Start → q0</div>
              <div className="text-[10px] text-slate-400 mt-0.5">r = 0, val = 0</div>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
              <div className="text-slate-400 text-[10px]">Step 1 (Read '1')</div>
              <div className="font-bold text-sky-400 mt-1">q0 → q1</div>
              <div className="text-[10px] text-slate-400 mt-0.5">(2×0+1)%3 = 1</div>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
              <div className="text-slate-400 text-[10px]">Step 2 (Read '1')</div>
              <div className="font-bold text-sky-400 mt-1">q1 → q0</div>
              <div className="text-[10px] text-slate-400 mt-0.5">(2×1+1)%3 = 0</div>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
              <div className="text-slate-400 text-[10px]">Step 3 (Read '0')</div>
              <div className="font-bold text-emerald-400 mt-1">q0 → q0</div>
              <div className="text-[10px] text-slate-400 mt-0.5">(2×0+0)%3 = 0</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Final state is <strong>q0</strong> ∈ F. The string is accepted!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
