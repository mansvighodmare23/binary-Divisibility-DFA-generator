import { DFA, DFAState, SimulationResult, SimulationStep } from '../types';

/**
 * Dynamically builds a Deterministic Finite Automaton (DFA)
 * for binary strings divisible by integer n.
 */
export function generateBinaryDivisibilityDFA(n: number): DFA {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error('n must be a positive integer (n >= 1)');
  }

  const states: DFAState[] = [];
  const transitions: Record<number, { '0': number; '1': number }> = {};

  for (let i = 0; i < n; i++) {
    states.push({
      id: i,
      name: `q${i}`,
      remainder: i,
      isStart: i === 0,
      isAccepting: i === 0,
    });

    const nextOn0 = (2 * i) % n;
    const nextOn1 = (2 * i + 1) % n;

    transitions[i] = {
      '0': nextOn0,
      '1': nextOn1,
    };
  }

  return {
    n,
    states,
    transitions,
    alphabet: ['0', '1'],
    startState: 0,
    acceptingStates: [0],
  };
}

/**
 * Simulates a binary string through the DFA step-by-step.
 */
export function simulateDFA(dfa: DFA, binaryInput: string): SimulationResult {
  const sanitized = binaryInput.replace(/\s+/g, '');

  if (sanitized.length > 0 && !/^[01]+$/.test(sanitized)) {
    return {
      inputString: binaryInput,
      sanitizedString: sanitized,
      isValid: false,
      errorMessage: 'Invalid character detected. Binary strings must only contain digits 0 and 1.',
      decimalValue: 0,
      steps: [],
      finalState: 0,
      isAccepted: false,
      isDivisible: false,
      remainder: 0,
    };
  }

  // Initial step at state q0 before reading any symbols
  const steps: SimulationStep[] = [
    {
      stepIndex: 0,
      symbol: null,
      fromState: dfa.startState,
      toState: dfa.startState,
      remainder: 0,
      accumulatedBinary: 'ε',
      accumulatedDecimal: 0,
      formulaText: 'Initial state q0 (empty input / remainder 0)',
    },
  ];

  let currentState = dfa.startState;
  let accumulatedDecimal = 0;
  let accumulatedBinary = '';

  for (let i = 0; i < sanitized.length; i++) {
    const symbol = sanitized[i] as '0' | '1';
    const bitVal = symbol === '1' ? 1 : 0;
    const fromState = currentState;
    const nextState = dfa.transitions[currentState][symbol];

    accumulatedBinary += symbol;
    accumulatedDecimal = accumulatedDecimal * 2 + bitVal;
    const formulaText = `(2 × ${fromState} + ${bitVal}) mod ${dfa.n} = ${(2 * fromState + bitVal)} mod ${dfa.n} = ${nextState}`;

    steps.push({
      stepIndex: i + 1,
      symbol,
      fromState,
      toState: nextState,
      remainder: nextState,
      accumulatedBinary,
      accumulatedDecimal,
      formulaText,
    });

    currentState = nextState;
  }

  const isAccepted = dfa.acceptingStates.includes(currentState);
  const isDivisible = currentState === 0;

  return {
    inputString: binaryInput,
    sanitizedString: sanitized,
    isValid: true,
    decimalValue: accumulatedDecimal,
    steps,
    finalState: currentState,
    isAccepted,
    isDivisible,
    remainder: currentState,
  };
}

/**
 * Returns automated batch test results for standard decimal integers 0..maxDec
 */
export function generateBatchTests(dfa: DFA, maxDec: number = 19) {
  const results = [];
  for (let d = 0; d <= maxDec; d++) {
    const bin = d.toString(2);
    const sim = simulateDFA(dfa, bin);
    results.push({
      decimal: d,
      binary: bin,
      expectedRemainder: d % dfa.n,
      actualRemainder: sim.remainder,
      isDivisible: d % dfa.n === 0,
      accepted: sim.isAccepted,
      finalState: `q${sim.finalState}`,
    });
  }
  return results;
}

/**
 * Export formal DFA specifications in LaTeX
 */
export function getLaTeXExport(dfa: DFA): string {
  const statesList = dfa.states.map(s => s.name).join(', ');
  let rows = '';
  for (const s of dfa.states) {
    const isStart = s.isStart ? '\\to ' : '';
    const isAcc = s.isAccepting ? '*' : '';
    rows += `  ${isStart}${isAcc}${s.name} & q_{${dfa.transitions[s.id]['0']}} & q_{${dfa.transitions[s.id]['1']}} \\\\\n`;
  }

  return `% Formal 5-tuple: M = (Q, \\Sigma, \\delta, q_0, F)
% Binary Divisibility by n = ${dfa.n}
\\begin{aligned}
  Q &= \\{ ${statesList} \\} \\\\
  \\Sigma &= \\{ 0, 1 \\} \\\\
  q_0 &= q_0 \\\\
  F &= \\{ q_0 \\} \\\\
\\end{aligned}

\\begin{table}[h]
\\centering
\\begin{tabular}{|c|c|c|}
\\hline
\\textbf{State} & $\\mathbf{\\delta(q, 0)}$ & $\\mathbf{\\delta(q, 1)}$ \\\\
\\hline
${rows}\\hline
\\end{tabular}
\\caption{DFA Transition Table for Binary Divisibility by ${dfa.n}}
\\end{table}`;
}

/**
 * Export DFA in Markdown
 */
export function getMarkdownExport(dfa: DFA): string {
  let md = `# Binary Divisibility by ${dfa.n} (DFA)\n\n`;
  md += `- **States (Q):** {${dfa.states.map(s => s.name).join(', ')}}\n`;
  md += `- **Alphabet (Σ):** {0, 1}\n`;
  md += `- **Start State (q₀):** q0\n`;
  md += `- **Accepting States (F):** {q0}\n\n`;
  md += `### Transition Table\n\n`;
  md += `| State | Input 0 | Input 1 | State Type |\n`;
  md += `| :---: | :---: | :---: | :---: |\n`;
  for (const s of dfa.states) {
    const type = s.isAccepting ? 'Start & Accepting (r = 0)' : `Non-accepting (r = ${s.remainder})`;
    md += `| ${s.name} | q${dfa.transitions[s.id]['0']} | q${dfa.transitions[s.id]['1']} | ${type} |\n`;
  }
  return md;
}
