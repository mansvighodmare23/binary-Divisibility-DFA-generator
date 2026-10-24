import React, { useState } from 'react';
import { DFA } from '../types';
import { getLaTeXExport, getMarkdownExport } from '../utils/dfa';
import { downloadFile, downloadOfflineApp, downloadCsv, downloadPromptsExcel } from '../utils/download';
import { PROMPTS_LOG, generatePromptsCSV } from '../data/promptsLog';
import { X, Copy, Check, FileCode2, Download, Globe, Terminal, FileSpreadsheet, MessagesSquare, FolderArchive } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dfa: DFA;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, dfa }) => {
  const [activeFormat, setActiveFormat] = useState<'latex' | 'markdown' | 'json' | 'csv' | 'prompts'>('prompts');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const getContent = () => {
    switch (activeFormat) {
      case 'prompts':
        return generatePromptsCSV();
      case 'latex':
        return getLaTeXExport(dfa);
      case 'markdown':
        return getMarkdownExport(dfa);
      case 'json':
        return JSON.stringify(dfa, null, 2);
      case 'csv': {
        let csv = 'State,Input 0,Input 1,State Type,Remainder\n';
        for (const s of dfa.states) {
          csv += `${s.name},q${dfa.transitions[s.id]['0']},q${dfa.transitions[s.id]['1']},"${s.isAccepting ? 'Initial & Accepting' : 'Non-accepting'}",${s.remainder}\n`;
        }
        return csv;
      }
    }
  };

  const codeContent = getContent();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadActiveFormat = () => {
    switch (activeFormat) {
      case 'prompts':
        downloadPromptsExcel();
        break;
      case 'latex':
        downloadFile(`binary-dfa-n${dfa.n}.tex`, codeContent, 'application/x-latex');
        break;
      case 'markdown':
        downloadFile(`binary-dfa-n${dfa.n}.md`, codeContent, 'text/markdown');
        break;
      case 'json':
        downloadFile(`binary-dfa-n${dfa.n}.json`, codeContent, 'application/json');
        break;
      case 'csv':
        downloadCsv(dfa);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Download & Export DFA Specifications
              </h3>
              <p className="text-xs text-slate-400">
                Prompts Excel log, standalone offline app, academic formats, and raw datasets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close Export Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick GitHub ZIP Download Card */}
        <div className="p-4 bg-indigo-950/40 border-b border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-indigo-200">
                GitHub Ready Project Repository (.zip)
              </h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Complete codebase with clean structure, README.md, package.json, TypeScript config, and no node_modules bloat. Ready to push directly to GitHub.
              </p>
            </div>
          </div>
          <a
            href="/binary-divisibility-dfa-project.zip"
            download="binary-divisibility-dfa-project.zip"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-500/30 transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download GitHub ZIP</span>
          </a>
        </div>

        {/* Quick Excel Prompts Download Card */}
        <div className="p-4 bg-emerald-950/30 border-b border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-200">
                Excel Sheet of All Prompts (Spreadsheet Export)
              </h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Structured log of all project prompts, timestamps, categories, and implementation deliverables formatted with UTF-8 BOM for Microsoft Excel.
              </p>
            </div>
          </div>
          <button
            onClick={downloadPromptsExcel}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm shadow-emerald-500/30 transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Prompts (.csv for Excel)</span>
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveFormat('prompts')}
              className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeFormat === 'prompts'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessagesSquare className="w-3 h-3" />
              <span>Prompts Sheet</span>
            </button>
            <button
              onClick={() => setActiveFormat('latex')}
              className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                activeFormat === 'latex'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LaTeX (.tex)
            </button>
            <button
              onClick={() => setActiveFormat('markdown')}
              className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                activeFormat === 'markdown'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Markdown (.md)
            </button>
            <button
              onClick={() => setActiveFormat('json')}
              className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                activeFormat === 'json'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              JSON (.json)
            </button>
            <button
              onClick={() => setActiveFormat('csv')}
              className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                activeFormat === 'csv'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Transitions CSV
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadActiveFormat}
              className="flex items-center gap-1.5 px-3 py-1.5 font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Content View: Prompts Table or Code Pre */}
        {activeFormat === 'prompts' ? (
          <div className="p-4 overflow-y-auto bg-slate-950/90 text-xs text-slate-300 leading-relaxed max-h-[380px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">User Prompt</th>
                    <th className="py-2 px-3">Deliverables</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {PROMPTS_LOG.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-900/60 align-top">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-200">{entry.id}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap text-[11px]">{entry.timestamp}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-indigo-300 font-medium">{entry.category}</td>
                      <td className="py-2.5 px-3 max-w-xs font-mono text-[11px] text-slate-300 whitespace-pre-wrap">{entry.userPrompt}</td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px]">{entry.deliverables}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-4 overflow-y-auto bg-slate-950/90 font-mono text-xs text-slate-300 leading-relaxed max-h-[380px]">
            <pre className="whitespace-pre-wrap selection:bg-indigo-700 selection:text-white">
              {codeContent}
            </pre>
          </div>
        )}

        {/* Modal Footer with Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadOfflineApp(dfa)}
              className="text-indigo-400 hover:text-indigo-300 underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              Download Standalone HTML App
            </button>
            <span>·</span>
            <span>Opens directly in Excel, Google Sheets, or LaTeX editors.</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
