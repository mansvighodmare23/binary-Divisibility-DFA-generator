export interface DFAState {
  id: number;
  name: string; // "q0", "q1", etc.
  remainder: number;
  isStart: boolean;
  isAccepting: boolean;
}

export interface DFATransition {
  from: number;
  symbol: '0' | '1';
  to: number;
  formula: string;
}

export interface DFA {
  n: number;
  states: DFAState[];
  transitions: Record<number, { '0': number; '1': number }>;
  alphabet: ('0' | '1')[];
  startState: number;
  acceptingStates: number[];
}

export interface SimulationStep {
  stepIndex: number;
  symbol: '0' | '1' | null;
  fromState: number;
  toState: number;
  remainder: number;
  accumulatedBinary: string;
  accumulatedDecimal: number;
  formulaText: string;
}

export interface SimulationResult {
  inputString: string;
  sanitizedString: string;
  isValid: boolean;
  errorMessage?: string;
  decimalValue: number;
  steps: SimulationStep[];
  finalState: number;
  isAccepted: boolean;
  isDivisible: boolean;
  remainder: number;
}

export interface DiagramNode {
  id: number;
  name: string;
  x: number;
  y: number;
  isStart: boolean;
  isAccepting: boolean;
}

export interface DiagramEdge {
  from: number;
  to: number;
  symbols: ('0' | '1')[];
  isSelfLoop: boolean;
}
