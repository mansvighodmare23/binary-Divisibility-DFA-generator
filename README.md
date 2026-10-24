# Binary Divisibility DFA Generator

An interactive, educational web application that algorithmically generates a **Deterministic Finite Automaton (DFA)** to test whether any streaming binary string is divisible by any positive integer $n$.

Designed for students and instructors in **Theory of Computation**, **Formal Languages & Automata**, and **Design and Analysis of Algorithms (DAA)**.

---

## 🚀 Live Demo & Features

- **Algorithmic DFA Generation:** Dynamically generates exactly $n$ states ($q_0, q_1, \dots, q_{n-1}$) representing remainders modulo $n$.
- **Interactive SVG Transition Diagram:** Vector canvas with double-circle accepting states, outward self-loops, curved bidirectional edges, zoom, pan, and draggable state nodes.
- **Dynamic Transition Table:** Tabular display of transition function $\delta(q_i, b)$ with mathematical remainder formulas, row highlighting during simulation, and 1-click Markdown/LaTeX copy.
- **Binary String Testing & Stepper:** Real-time simulation of input binary numbers with auto-play stepper, pause, step forward/backward, reset, and live formula callouts.
- **Automated Batch Verification:** Compares the DFA's output against mathematical division for numbers 0 through 31 with 100% verification accuracy.
- **Formal Academic Exports:** One-click export for LaTeX tables and 5-tuple definitions, Markdown, JSON, CSV, and standalone offline HTML bundles.

---

## 📐 Mathematical Foundations

For any positive integer $n \ge 1$, the DFA is formally defined as the 5-tuple:

$$M = (Q, \Sigma, \delta, q_0, F)$$

Where:
- **Set of States:** $Q = \{q_0, q_1, q_2, \dots, q_{n-1}\}$ (each state $q_i$ corresponds to remainder $i$).
- **Alphabet:** $\Sigma = \{0, 1\}$.
- **Initial State:** $q_0$ (empty string or initial value represents remainder $0$).
- **Accepting / Final State:** $F = \{q_0\}$ (a number is divisible by $n$ if and only if its remainder is $0$).
- **Transition Function ($\delta$):**
  $$\delta(q_i, 0) = q_{(2i) \bmod n}$$
  $$\delta(q_i, 1) = q_{(2i + 1) \bmod n}$$

### Why Does It Work?
When reading a binary string from left to right (MSB to LSB), appending a bit $b \in \{0, 1\}$ shifts the accumulated decimal value:
$$V_{\text{new}} = 2 \times V_{\text{prev}} + b$$

By the properties of modular arithmetic:
$$(2 \times V_{\text{prev}} + b) \bmod n = \left(2 \times (V_{\text{prev}} \bmod n) + b\right) \bmod n$$

Therefore, keeping track of only the current remainder $i = V_{\text{prev}} \bmod n$ is sufficient to compute the new remainder state without storing arbitrarily large numbers.

---

## 🛠️ Project Structure

```
├── public/
│   ├── prompts_history.csv               # Complete prompt development log
│   └── binary-divisibility-dfa-project.zip # Downloadable GitHub-ready archive
├── src/
│   ├── components/
│   │   ├── BatchTester.tsx               # Automated 0..31 batch verification table
│   │   ├── DFAControls.tsx               # Divisor input, presets (n=3,5,7), & summary
│   │   ├── DFADiagram.tsx                # Interactive SVG state diagram (pan/zoom/drag)
│   │   ├── ExportModal.tsx               # LaTeX, Markdown, JSON, CSV, and Prompts exporter
│   │   ├── Header.tsx                    # Top navigation bar
│   │   ├── StringSimulator.tsx           # Step-by-step binary string simulator
│   │   ├── TheorySection.tsx             # Educational proof & 5-tuple breakdown
│   │   └── TransitionTable.tsx           # DFA delta transition matrix
│   ├── data/
│   │   └── promptsLog.ts                 # Structured prompt history data
│   ├── utils/
│   │   ├── dfa.ts                        # Pure algorithmic DFA generator & simulator
│   │   └── download.ts                   # Standalone offline app and file downloader
│   ├── App.tsx                           # Main application layout
│   ├── index.css                         # Tailwind CSS styling & custom scrollbars
│   ├── main.tsx                          # React DOM entry point
│   └── types.ts                          # TypeScript interface definitions
├── index.html                            # HTML entry point with web fonts
├── package.json                          # Dependencies & build scripts
├── tsconfig.json                         # TypeScript compiler configuration
├── vite.config.ts                        # Vite configuration
└── README.md                             # Project documentation
```

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm or bun

### 1. Clone the repository
```bash
git clone https://github.com/your-username/binary-divisibility-dfa.git
cd binary-divisibility-dfa
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Build for production
```bash
npm run build
```
Production assets will be generated in the `dist/` directory.

---

## 📦 Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Graphics:** Scalable Vector Graphics (SVG) with mathematical Bezier curve routing

---

## 📄 License
This project is licensed under the Apache-2.0 License.
