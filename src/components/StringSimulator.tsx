import React, { useState, useEffect, useRef } from 'react';
import { DFA, SimulationResult, SimulationStep } from '../types';
import { simulateDFA } from '../utils/dfa';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Binary,
  Calculator,
  ArrowRight
} from 'lucide-react';

interface StringSimulatorProps {
  dfa: DFA;
  currentStepIndex: number;
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
  onSimulationChange?: (sim: SimulationResult) => void;
}

export const StringSimulator: React.FC<StringSimulatorProps> = ({
  dfa,
  currentStepIndex,
  setCurrentStepIndex,
  onSimulationChange,
}) => {
  const [inputStr, setInputStr] = useState<string>('110'); // Default to 6 (divisible by 3)
  const [simulation, setSimulation] = useState<SimulationResult>(() =>
    simulateDFA(dfa, '110')
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(800); // ms per step
  const timerRef = useRef<number | null>(null);

  // When DFA n changes, re-simulate current input
  useEffect(() => {
    const res = simulateDFA(dfa, inputStr);
    setSimulation(res);
    setCurrentStepIndex(res.steps.length - 1);
    setIsPlaying(false);
    if (onSimulationChange) onSimulationChange(res);
  }, [dfa.n]);

  // Handle Play/Pause auto-stepping
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= simulation.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playSpeed, simulation.steps.length]);

  const handleTestString = (valToTest: string) => {
    const res = simulateDFA(dfa, valToTest);
    setSimulation(res);
    setInputStr(valToTest);
    setCurrentStepIndex(res.steps.length > 0 ? res.steps.length - 1 : 0);
    setIsPlaying(false);
    if (onSimulationChange) onSimulationChange(res);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputStr(val);
  };

  const handleAppendBit = (bit: '0' | '1') => {
    const updated = inputStr + bit;
    handleTestString(updated);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTestString(inputStr);
  };

  // Step controls
  const handleStepForward = () => {
    if (currentStepIndex < simulation.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleResetStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleJumpToEnd = () => {
    setIsPlaying(false);
    setCurrentStepIndex(simulation.steps.length - 1);
  };

  // Preset generator helpers
  const presets = [
    { label: '0', val: '0', dec: 0 },
    { label: '11', val: '11', dec: 3 },
    { label: '101', val: '101', dec: 5 },
    { label: '110', val: '110', dec: 6 },
    { label: '1001', val: '1001', dec: 9 },
    { label: '1111', val: '1111', dec: 15 },
  ];

  // Divisible preset for current n
  const divisibleDec = dfa.n * 2; // e.g., 6 for n=3, 10 for n=5
  const nonDivisibleDec = dfa.n * 2 + 1; // remainder 1

  const activeStep: SimulationStep | undefined =
    simulation.steps[currentStepIndex] || simulation.steps[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Simulation Header */}
      <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Binary className="w-4 h-4 text-indigo-400" />
              Binary String Testing & Step-by-Step Simulation
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter any binary string or click a preset to trace state transitions against{' '}
              <span className="font-semibold text-slate-300">n = {dfa.n}</span>.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Presets:
            </span>
            {presets.map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => handleTestString(p.val)}
                className={`px-2 py-1 text-xs font-mono rounded border transition-all ${
                  inputStr === p.val
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
                title={`Decimal: ${p.dec}`}
              >
                {p.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handleTestString(divisibleDec.toString(2))}
              className="px-2 py-1 text-xs font-mono rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-all"
              title={`Test multiple of ${dfa.n} (${divisibleDec})`}
            >
              Divisible ({divisibleDec.toString(2)}₂)
            </button>
          </div>
        </div>

        {/* Input bar and action */}
        <form onSubmit={handleFormSubmit} className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={inputStr}
              onChange={handleInputChange}
              placeholder="e.g. 110, 1001, 10101"
              className="w-full pl-3 pr-24 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-sm tracking-wider focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600"
            />
            {/* Quick bit appenders inside input */}
            <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAppendBit('0')}
                className="px-2 py-1 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-all"
                title="Append bit 0"
              >
                +0
              </button>
              <button
                type="button"
                onClick={() => handleAppendBit('1')}
                className="px-2 py-1 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-all"
                title="Append bit 1"
              >
                +1
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>Test String</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {inputStr && (
            <button
              type="button"
              onClick={() => handleTestString('')}
              className="px-3 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all"
              title="Clear to empty string ε"
            >
              Clear
            </button>
          )}
        </form>

        {simulation.errorMessage && (
          <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            {simulation.errorMessage}
          </p>
        )}
      </div>

      {/* Outcome / Result Card */}
      {simulation.isValid && (
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Status Banner */}
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                simulation.isAccepted
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-700/60 text-rose-300'
              }`}
            >
              {simulation.isAccepted ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-7 h-7 text-rose-400 shrink-0" />
              )}
              <div>
                <div className="text-base font-extrabold tracking-tight">
                  {simulation.isAccepted ? 'ACCEPTED' : 'REJECTED'}
                </div>
                <div className="text-xs opacity-90">
                  {simulation.isAccepted
                    ? `Divisible by ${dfa.n} (Remainder = 0)`
                    : `Not divisible by ${dfa.n} (Remainder = ${simulation.remainder})`}
                </div>
              </div>
            </div>

            {/* Numerical details */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block">Binary String</span>
                <span className="font-mono font-bold text-slate-100 truncate block">
                  {simulation.sanitizedString || 'ε (empty)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Decimal Value</span>
                <span className="font-mono font-bold text-indigo-300 text-sm">
                  {simulation.decimalValue}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Final DFA State</span>
                <span className={`font-mono font-bold ${simulation.isAccepted ? 'text-emerald-400' : 'text-amber-400'}`}>
                  q{simulation.finalState} {simulation.finalState === 0 ? '(Accepting)' : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Modulus Result</span>
                <span className="font-mono font-bold text-slate-200">
                  {simulation.decimalValue} mod {dfa.n} = {simulation.remainder}
                </span>
              </div>
            </div>

            {/* Mathematical Sentence */}
            <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
              <Calculator className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block mb-0.5">Verification:</span>
                <span>
                  {simulation.decimalValue} = {dfa.n} × {Math.floor(simulation.decimalValue / dfa.n)} + {simulation.remainder}.
                  {simulation.isAccepted
                    ? ` Since the remainder is 0, the DFA halts in accepting state q0.`
                    : ` Since the remainder is ${simulation.remainder} ≠ 0, the DFA halts in non-accepting state q${simulation.finalState}.`}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Playback Controls */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetStep}
                disabled={currentStepIndex === 0}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 rounded border border-slate-700 transition-all cursor-pointer"
                title="Reset to Start (Step 0)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleStepBack}
                disabled={currentStepIndex <= 0}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 rounded border border-slate-700 transition-all cursor-pointer"
                title="Step Back"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded border transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
                }`}
                title={isPlaying ? 'Pause Auto-Play' : 'Auto-Play Simulation'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Play Steps</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleStepForward}
                disabled={currentStepIndex >= simulation.steps.length - 1}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 rounded border border-slate-700 transition-all cursor-pointer"
                title="Step Forward"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleJumpToEnd}
                disabled={currentStepIndex === simulation.steps.length - 1}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded border border-slate-700 transition-all cursor-pointer text-[11px]"
                title="Jump to Final Step"
              >
                End
              </button>
            </div>

            {/* Step Counter & Speed */}
            <div className="flex items-center gap-4">
              <div className="text-slate-300 font-mono">
                Step <span className="font-bold text-sky-400">{currentStepIndex}</span> of{' '}
                <span>{Math.max(0, simulation.steps.length - 1)}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>Speed:</span>
                <select
                  value={playSpeed}
                  onChange={(e) => setPlaySpeed(Number(e.target.value))}
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
                >
                  <option value={1200}>0.5×</option>
                  <option value={800}>1.0×</option>
                  <option value={400}>2.0×</option>
                </select>
              </div>
            </div>
          </div>

          {/* Current Step Live Formula Callout */}
          {activeStep && (
            <div className="mt-3 p-2.5 bg-indigo-950/40 border border-indigo-800/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-indigo-300">Active State:</span>
                <span className="font-mono px-2 py-0.5 bg-indigo-900/60 text-indigo-200 rounded font-bold">
                  q{activeStep.toState}
                </span>
                <span className="text-slate-400">
                  {activeStep.symbol !== null ? `(read '${activeStep.symbol}')` : '(initial)'}
                </span>
              </div>
              <div className="font-mono text-slate-300 text-xs">
                Calculation:{' '}
                <span className="text-sky-300 font-semibold">{activeStep.formulaText}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step-by-Step Transition Sequence Table */}
      <div className="overflow-x-auto max-h-[380px]">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead className="bg-slate-950/90 sticky top-0 z-10 border-b border-slate-800 font-semibold text-slate-300">
            <tr>
              <th className="py-2.5 px-4">Step</th>
              <th className="py-2.5 px-4">Input Symbol</th>
              <th className="py-2.5 px-4">Current State</th>
              <th className="py-2.5 px-4">Next State</th>
              <th className="py-2.5 px-4">Remainder</th>
              <th className="py-2.5 px-4 hidden md:table-cell">Transition Formula</th>
              <th className="py-2.5 px-4 hidden sm:table-cell">Decimal Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {simulation.steps.map((step) => {
              const isCurrent = step.stepIndex === currentStepIndex;

              return (
                <tr
                  key={step.stepIndex}
                  onClick={() => setCurrentStepIndex(step.stepIndex)}
                  className={`cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-sky-950/70 text-white font-bold ring-1 ring-inset ring-sky-500/60'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex items-center gap-1 ${isCurrent ? 'text-sky-400' : 'text-slate-400'}`}>
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />}
                      Step {step.stepIndex}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    {step.symbol === null ? (
                      <span className="text-slate-500 italic font-sans">Start</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-bold border border-slate-700">
                        {step.symbol}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-slate-300">q{step.fromState}</span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={step.toState === 0 ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
                      q{step.toState}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-slate-300">{step.remainder}</span>
                  </td>
                  <td className="py-2.5 px-4 hidden md:table-cell text-slate-400 font-mono text-[11px]">
                    {step.formulaText}
                  </td>
                  <td className="py-2.5 px-4 hidden sm:table-cell text-slate-300">
                    {step.accumulatedDecimal}{' '}
                    <span className="text-slate-500 text-[10px]">({step.accumulatedBinary}₂)</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span className="font-mono text-slate-300">
          Trace:{' '}
          {simulation.steps.map((s, idx) => (
            <span key={idx}>
              {idx > 0 && ' → '}
              <span className={s.stepIndex === currentStepIndex ? 'text-sky-400 font-bold' : ''}>
                q{s.toState}
              </span>
            </span>
          ))}
        </span>
        <span className="hidden sm:inline text-slate-400">
          Click any table row to inspect that state.
        </span>
      </div>
    </div>
  );
};
