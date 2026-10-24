import React, { useState, useMemo } from 'react';
import { generateBinaryDivisibilityDFA, simulateDFA } from './utils/dfa';
import { downloadOfflineApp } from './utils/download';
import { DFA, SimulationResult } from './types';
import { Header } from './components/Header';
import { DFAControls } from './components/DFAControls';
import { DFADiagram } from './components/DFADiagram';
import { TransitionTable } from './components/TransitionTable';
import { StringSimulator } from './components/StringSimulator';
import { TheorySection } from './components/TheorySection';
import { BatchTester } from './components/BatchTester';
import { ExportModal } from './components/ExportModal';
import {
  Cpu,
  Layers,
  Table as TableIcon,
  PlayCircle,
  HelpCircle,
  CheckSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [n, setN] = useState<number>(3); // Default to n = 3
  const [activeTab, setActiveTab] = useState<string>('simulator'); // 'simulator' | 'table' | 'batch' | 'theory'
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Active step index in the simulation
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(3); // for default '110'
  const [currentSimulation, setCurrentSimulation] = useState<SimulationResult>(() => {
    const initialDFA = generateBinaryDivisibilityDFA(3);
    return simulateDFA(initialDFA, '110');
  });

  // Generate DFA whenever n changes
  const dfa: DFA = useMemo(() => {
    return generateBinaryDivisibilityDFA(n);
  }, [n]);

  const handleGenerate = (newN: number) => {
    setN(newN);
  };

  // Current active step data for visual diagram & table highlighting
  const activeStep = currentSimulation.steps[currentStepIndex];
  const activeStateId = activeStep ? activeStep.toState : null;
  const activeTransition =
    activeStep && activeStep.symbol !== null
      ? {
          from: activeStep.fromState,
          to: activeStep.toState,
          symbol: activeStep.symbol,
        }
      : null;

  const handleSelectBinaryFromBatch = (binary: string) => {
    setActiveTab('simulator');
    // Scroll smoothly to simulator or diagram
    const simEl = document.getElementById('simulator-anchor');
    if (simEl) {
      simEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        onDownloadApp={() => downloadOfflineApp(dfa)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Hero Section */}
        <div id="hero" className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-900">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1.5 uppercase tracking-wider">
              <span>Theory of Computation</span>
              <span aria-hidden="true">·</span>
              <span>Formal Languages & Automata</span>
              <span aria-hidden="true">·</span>
              <span>Modular Arithmetic</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight text-balance">
              Binary Divisibility DFA Generator
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Dynamically construct a <strong className="text-slate-200">Deterministic Finite Automaton (DFA)</strong> with{' '}
              <strong className="text-slate-200">n states</strong> that validates whether any streaming binary string represents an integer divisible by{' '}
              <span className="font-mono text-indigo-300 font-bold">n</span> using incremental remainder transitions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 hidden sm:inline">Active Divisor:</span>
            <span className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/60 font-mono font-bold text-sm text-indigo-300">
              n = {n}
            </span>
          </div>
        </div>

        {/* Input & DFA Configuration Bar */}
        <DFAControls n={n} onGenerate={handleGenerate} />

        {/* Segmented View Control Tabs (Functional buttons with active states) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs sm:text-sm overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>Interactive Simulation & Diagram</span>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-3.5 py-1.5 font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Transition Table</span>
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-2 px-3.5 py-1.5 font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'batch'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Batch Verification</span>
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex items-center gap-2 px-3.5 py-1.5 font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'theory'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>How It Works & Proof</span>
            </button>
          </div>

          <span className="hidden lg:inline text-xs text-slate-400 font-mono">
            M = (Q, {'{0, 1}'}, δ, q0, {'{q0}'})
          </span>
        </div>

        {/* Tab 1: Interactive Simulation & Diagram (Primary Studio) */}
        {activeTab === 'simulator' && (
          <div id="simulator-anchor" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Visual State Diagram */}
              <div className="lg:col-span-7 space-y-6">
                <DFADiagram
                  dfa={dfa}
                  activeStateId={activeStateId}
                  activeTransition={activeTransition}
                />

                {/* Transition Table directly under diagram for quick reference */}
                <TransitionTable
                  dfa={dfa}
                  activeStateId={activeStateId}
                  activeSymbol={activeStep?.symbol || null}
                />
              </div>

              {/* Right Column: Binary String Simulator & Execution Stepper */}
              <div className="lg:col-span-5 space-y-6">
                <StringSimulator
                  dfa={dfa}
                  currentStepIndex={currentStepIndex}
                  setCurrentStepIndex={setCurrentStepIndex}
                  onSimulationChange={(sim) => setCurrentSimulation(sim)}
                />
              </div>
            </div>

            {/* Educational Section directly visible in studio */}
            <div className="pt-4 border-t border-slate-800/60">
              <TheorySection dfa={dfa} />
            </div>
          </div>
        )}

        {/* Tab 2: Transition Table Full View */}
        {activeTab === 'table' && (
          <div className="space-y-6">
            <TransitionTable
              dfa={dfa}
              activeStateId={activeStateId}
              activeSymbol={activeStep?.symbol || null}
            />
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <h4 className="text-sm font-bold text-slate-200 mb-2">
                Understanding the Transition Matrix for n = {dfa.n}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                For every state <span className="font-mono text-slate-300">qi</span> representing remainder{' '}
                <span className="font-mono text-slate-300">i</span>:
                reading bit <span className="font-mono text-sky-400">0</span> shifts the accumulated value to{' '}
                <span className="font-mono text-sky-400">2 × i</span>, so the next state is{' '}
                <span className="font-mono text-sky-400">q((2×i) mod {dfa.n})</span>. Reading bit{' '}
                <span className="font-mono text-sky-400">1</span> shifts and adds 1, transitioning to{' '}
                <span className="font-mono text-sky-400">q((2×i + 1) mod {dfa.n})</span>.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Batch Verification Suite */}
        {activeTab === 'batch' && (
          <div className="space-y-6">
            <BatchTester
              dfa={dfa}
              onSelectBinary={(bin) => handleSelectBinaryFromBatch(bin)}
            />
          </div>
        )}

        {/* Tab 4: How It Works & Theory Proof */}
        {activeTab === 'theory' && (
          <div className="space-y-6">
            <TheorySection dfa={dfa} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 sm:px-8 py-5 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium">Binary Divisibility DFA Generator</span>
            <span aria-hidden="true">·</span>
            <span>Theory of Computation & Automata Learning Tool</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsExportOpen(true)}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Export Formal Specs
            </button>
            <span aria-hidden="true">·</span>
            <span>Deterministic Modular Finite State Automaton</span>
          </div>
        </div>
      </footer>

      {/* Export Specs Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        dfa={dfa}
      />
    </div>
  );
}
