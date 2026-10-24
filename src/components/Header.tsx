import React from 'react';
import { Cpu, FileCode2, Play, Table, HelpCircle, CheckSquare, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenExport: () => void;
  onDownloadApp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  onDownloadApp,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Cpu className="w-4 h-4" />
        </div>
        <a href="#hero" className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
          Binary Divisibility DFA
        </a>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`transition-colors flex items-center gap-1.5 ${
            activeTab === 'simulator' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          Simulation & Diagram
        </button>
        <button
          onClick={() => setActiveTab('table')}
          className={`transition-colors flex items-center gap-1.5 ${
            activeTab === 'table' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          Transition Table
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`transition-colors flex items-center gap-1.5 ${
            activeTab === 'batch' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Batch Verification
        </button>
        <button
          onClick={() => setActiveTab('theory')}
          className={`transition-colors flex items-center gap-1.5 ${
            activeTab === 'theory' ? 'text-indigo-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          How It Works
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href="/binary-divisibility-dfa-project.zip"
          download="binary-divisibility-dfa-project.zip"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          title="Download complete GitHub-ready ZIP archive"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Code ZIP</span>
        </a>

        <button
          onClick={onDownloadApp}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          title="Download standalone offline single-file HTML app"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download App</span>
        </button>

        <button
          onClick={onOpenExport}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export Specs</span>
        </button>
      </div>
    </header>
  );
};
