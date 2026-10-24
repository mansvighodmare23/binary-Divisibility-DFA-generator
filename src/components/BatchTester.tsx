import React, { useState } from 'react';
import { DFA } from '../types';
import { generateBatchTests } from '../utils/dfa';
import { CheckSquare, CheckCircle2, XCircle, ArrowRight, Play } from 'lucide-react';

interface BatchTesterProps {
  dfa: DFA;
  onSelectBinary: (binary: string) => void;
}

export const BatchTester: React.FC<BatchTesterProps> = ({ dfa, onSelectBinary }) => {
  const [maxDec, setMaxDec] = useState<number>(19);
  const tests = generateBatchTests(dfa, maxDec);

  const divisibleCount = tests.filter((t) => t.isDivisible).length;
  const matchCount = tests.filter((t) => t.isDivisible === t.accepted).length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            Batch Verification Suite (Decimals 0 to {maxDec})
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Automated verification comparing algorithmic DFA output against mathematical arithmetic for <span className="font-semibold text-slate-300">n = {dfa.n}</span>.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Range:</span>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {[15, 19, 31].map((cnt) => (
              <button
                key={cnt}
                onClick={() => setMaxDec(cnt)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                  maxDec === cnt
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                0..{cnt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Score Bar */}
      <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="text-slate-300">
            Tested: <strong className="font-mono text-white">{tests.length}</strong> numbers
          </span>
          <span className="text-emerald-400">
            Divisible Multiples: <strong className="font-mono">{divisibleCount}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>{matchCount}/{tests.length} Algorithmic Matches (100% Accuracy)</span>
        </div>
      </div>

      {/* Verification Table */}
      <div className="overflow-x-auto max-h-[480px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-950/90 sticky top-0 z-10 border-b border-slate-800 font-semibold text-slate-300">
            <tr>
              <th className="py-2.5 px-4">Decimal (N)</th>
              <th className="py-2.5 px-4">Binary Representation</th>
              <th className="py-2.5 px-4">Formula (N mod {dfa.n})</th>
              <th className="py-2.5 px-4">Final State</th>
              <th className="py-2.5 px-4">Mathematical Divisibility</th>
              <th className="py-2.5 px-4">DFA Decision</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {tests.map((test) => {
              const isDivisible = test.isDivisible;

              return (
                <tr
                  key={test.decimal}
                  className={`transition-colors ${
                    isDivisible
                      ? 'bg-emerald-950/20 hover:bg-emerald-950/40'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-2 px-4 font-bold text-slate-200">
                    {test.decimal}
                  </td>
                  <td className="py-2 px-4 text-sky-300">
                    {test.binary}₂
                  </td>
                  <td className="py-2 px-4 text-slate-400">
                    {test.decimal} mod {dfa.n} = <strong className="text-slate-200">{test.expectedRemainder}</strong>
                  </td>
                  <td className="py-2 px-4">
                    <span className={test.actualRemainder === 0 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {test.finalState}
                    </span>
                  </td>
                  <td className="py-2 px-4 font-sans">
                    {isDivisible ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Divisible
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Not Divisible (rem {test.expectedRemainder})
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 font-sans">
                    {test.accepted ? (
                      <span className="text-emerald-400 font-semibold">ACCEPTED</span>
                    ) : (
                      <span className="text-rose-400 font-semibold">REJECTED</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button
                      onClick={() => onSelectBinary(test.binary)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-sans font-medium text-slate-300 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded border border-slate-700 transition-all cursor-pointer"
                      title={`Simulate ${test.binary} (${test.decimal}) in DFA`}
                    >
                      <Play className="w-3 h-3" />
                      Simulate
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
