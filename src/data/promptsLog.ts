export interface PromptEntry {
  id: number;
  timestamp: string;
  category: string;
  userPrompt: string;
  objectives: string;
  deliverables: string;
  status: 'Completed' | 'In Progress';
}

export const PROMPTS_LOG: PromptEntry[] = [
  {
    id: 1,
    timestamp: '2026-10-07T09:31:03-07:00',
    category: 'Core Application Specification',
    userPrompt: `Create an interactive web application titled “Binary Divisibility DFA Generator”.

### Project Topic
Binary Divisibility: Given an integer n such as 3 or 5, dynamically generate a DFA transition table that accepts binary strings representing numbers divisible by n.

### Main Goal
The application should allow the user to enter any positive integer n and automatically construct a Deterministic Finite Automaton (DFA) that accepts binary strings whose corresponding binary number is divisible by n.

### Core DFA Logic
For a given n, create exactly n states: q0, q1, q2, ..., q(n-1)
Each state represents the remainder obtained when the binary number processed so far is divided by n.
q0 is the initial state and the only accepting/final state.
On input 0: δ(qi, 0) = q((2*i) mod n)
On input 1: δ(qi, 1) = q((2*i + 1) mod n)

Required Features:
1. Input Section for n with validation and presets (n=3, 5, 7)
2. Dynamic DFA Transition Table (State | Input 0 | Input 1 | State Type)
3. DFA State Diagram (circles, double-circle q0, arrows, zoom/pan)
4. Binary String Testing (decimal conversion, visited states, verdict)
5. Step-by-Step Simulation (Step | Input Symbol | Current State | Next State | Remainder)
6. Mathematical Explanation (transition formula & modular arithmetic proof)
7. Example Presets (n=3, 5, 7)
8. User Interface (clean, modern, student-friendly)
9. Educational Information ("How It Works" remainder mapping)
10. Technical Requirements (pure algorithmic DFA, modular, no mock data)`,
    objectives: 'Build complete interactive Theory of Computation educational tool with dynamic algorithmic DFA construction, SVG state diagram with zoom/pan/drag, step-by-step simulator, and batch verification suite.',
    deliverables: 'Constructed full React+TypeScript application: modular DFA algorithm, interactive vector SVG state diagram with real-time transition highlights, step-by-step stepper with Play/Pause, batch verification suite, and LaTeX/Markdown exports.',
    status: 'Completed',
  },
  {
    id: 2,
    timestamp: '2026-10-07T10:01:28-07:00',
    category: 'Export & Offline Packaging',
    userPrompt: 'download the app',
    objectives: 'Provide mechanisms for the user to download the application for local, offline, and academic use.',
    deliverables: 'Added one-click standalone single-file offline HTML app bundle (binary-divisibility-dfa-offline.html), SVG vector diagram download, LaTeX/Markdown/JSON/CSV file downloads, and AI Studio repository export instructions.',
    status: 'Completed',
  },
  {
    id: 3,
    timestamp: '2026-10-07T10:08:50-07:00',
    category: 'Deployment & Production Build',
    userPrompt: 'and deploy it',
    objectives: 'Compile production assets and deploy the web application to the live hosting environment.',
    deliverables: 'Executed production build (npm run build), verified production asset generation in dist/, validated app compilation, restarted dev server, and verified active live Cloud Run URLs.',
    status: 'Completed',
  },
  {
    id: 4,
    timestamp: '2026-10-15T23:47:42-07:00',
    category: 'Prompt History & Documentation',
    userPrompt: 'can you make excel sheet of all prompts',
    objectives: 'Compile an Excel-compatible spreadsheet of all user prompts throughout the project lifecycle, including timestamps, categories, prompt texts, and deliverables.',
    deliverables: 'Generated structured Excel-compatible spreadsheet (CSV with UTF-8 BOM for Microsoft Excel), integrated in-app prompt sheet exporter in UI, and presented full prompt log in tabular format.',
    status: 'Completed',
  },
];

/**
 * Returns an Excel-compatible CSV string with UTF-8 BOM for Microsoft Excel
 */
export function generatePromptsCSV(): string {
  // UTF-8 BOM (\uFEFF) ensures Excel opens special characters and multi-line fields correctly
  let csv = '\uFEFF"Prompt #","Timestamp","Category","User Prompt","Objectives & Requirements","Deliverables & Actions Taken","Status"\r\n';

  PROMPTS_LOG.forEach((p) => {
    const cleanPrompt = p.userPrompt.replace(/"/g, '""');
    const cleanObjectives = p.objectives.replace(/"/g, '""');
    const cleanDeliverables = p.deliverables.replace(/"/g, '""');
    csv += `"${p.id}","${p.timestamp}","${p.category}","${cleanPrompt}","${cleanObjectives}","${cleanDeliverables}","${p.status}"\r\n`;
  });

  return csv;
}
