import { DFA } from '../types';
import { getLaTeXExport, getMarkdownExport } from './dfa';
import { generatePromptsCSV } from '../data/promptsLog';

/**
 * Triggers a browser download of a text/blob file.
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads an SVG element as a standalone .svg file.
 */
export function downloadSvg(svgElement: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);

  // Add namespaces if not present
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Prepend XML declaration
  const svgBlob = new Blob([`<?xml version="1.0" standalone="no"?>\r\n`, source], {
    type: 'image/svg+xml;charset=utf-8',
  });
  const url = URL.createObjectURL(svgBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a complete, zero-dependency, self-contained
 * offline HTML file for the Binary Divisibility DFA Generator.
 * Anyone can double-click this file to run the entire app offline in any web browser!
 */
export function downloadOfflineApp(dfa: DFA) {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Binary Divisibility DFA Generator (Offline Standalone)</title>
  <style>
    :root {
      --bg: #030712;
      --card: #111827;
      --border: #1f2937;
      --primary: #4f46e5;
      --primary-hover: #6366f1;
      --text: #f9fafb;
      --muted: #9ca3af;
      --accent: #0284c7;
      --success: #10b981;
      --danger: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 20px; min-height: 100vh; }
    .container { max-width: 1100px; margin: 0 auto; }
    header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
    h1 { font-size: 24px; font-weight: 800; color: #fff; }
    p.subtitle { color: var(--muted); font-size: 14px; margin-top: 4px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; margin-bottom: 20px; }
    .controls { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    input[type="number"], input[type="text"] {
      background: #000; border: 1px solid var(--border); color: #fff; padding: 8px 12px; border-radius: 8px; font-family: monospace; font-size: 14px;
    }
    button {
      background: var(--primary); color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.15s;
    }
    button:hover { background: var(--primary-hover); }
    button.btn-sec { background: #1f2937; color: #d1d5db; border: 1px solid #374151; }
    button.btn-sec:hover { background: #374151; color: #fff; }
    .preset-btn { background: #1f2937; color: #d1d5db; border: 1px solid #374151; padding: 6px 12px; font-family: monospace; font-size: 12px; border-radius: 6px; cursor: pointer; }
    .preset-btn:hover { background: #374151; }
    .diagram-box { background: #000; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; height: 420px; position: relative; }
    svg { width: 100%; height: 100%; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
    th { background: #1f2937; color: #d1d5db; padding: 10px 12px; font-weight: 600; border-bottom: 1px solid #374151; }
    td { padding: 9px 12px; border-bottom: 1px solid #1f2937; font-family: monospace; }
    .badge-acc { color: var(--success); font-weight: bold; }
    .badge-rej { color: var(--danger); font-weight: bold; }
    .result-box { margin-top: 14px; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 8px; }
    .result-acc { background: rgba(16, 185, 129, 0.15); border: 1px solid var(--success); color: #34d399; }
    .result-rej { background: rgba(239, 68, 68, 0.15); border: 1px solid var(--danger); color: #f87171; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media(max-width: 860px) { .grid-2 { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Binary Divisibility DFA Generator (Offline App)</h1>
      <p class="subtitle">Complete, self-contained interactive Deterministic Finite Automaton tool. Works with zero internet connection.</p>
    </header>

    <div class="card">
      <div class="controls">
        <label style="font-weight: 600; font-size: 14px;">Divisor (n):</label>
        <input type="number" id="num-n" value="${dfa.n}" min="1" max="25" style="width: 80px; text-align: center;">
        <button onclick="updateDFA()">Generate DFA</button>
        <span style="color: var(--muted); font-size: 13px; margin: 0 4px;">Presets:</span>
        <button class="preset-btn" onclick="setN(3)">n = 3</button>
        <button class="preset-btn" onclick="setN(5)">n = 5</button>
        <button class="preset-btn" onclick="setN(7)">n = 7</button>
        <button class="preset-btn" onclick="setN(2)">n = 2</button>
        <button class="preset-btn" onclick="setN(10)">n = 10</button>
      </div>
    </div>

    <div class="grid-2">
      <!-- Diagram -->
      <div class="card">
        <h3 style="font-size: 16px; margin-bottom: 12px;">DFA State Diagram</h3>
        <div class="diagram-box">
          <svg id="dfa-svg" viewBox="0 0 500 400"></svg>
        </div>
      </div>

      <!-- Simulator -->
      <div class="card">
        <h3 style="font-size: 16px; margin-bottom: 12px;">Binary String Simulator</h3>
        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
          <input type="text" id="bin-input" value="110" placeholder="e.g. 110, 1001" style="flex: 1;">
          <button onclick="runSim()">Test String</button>
        </div>
        <div style="display: flex; gap: 6px; margin-bottom: 14px;">
          <button class="preset-btn" onclick="setBin('0')">0</button>
          <button class="preset-btn" onclick="setBin('11')">11 (3)</button>
          <button class="preset-btn" onclick="setBin('110')">110 (6)</button>
          <button class="preset-btn" onclick="setBin('1001')">1001 (9)</button>
          <button class="preset-btn" onclick="setBin('1010')">1010 (10)</button>
        </div>
        <div id="sim-result"></div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <h3 style="font-size: 16px; margin-bottom: 12px;">DFA Transition Table</h3>
      <div style="overflow-x: auto;">
        <table id="trans-table">
          <thead>
            <tr><th>State</th><th>Input 0 (2i mod n)</th><th>Input 1 (2i+1 mod n)</th><th>State Type</th></tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>

    <!-- Trace Table -->
    <div class="card">
      <h3 style="font-size: 16px; margin-bottom: 12px;">Step-by-Step Execution Sequence</h3>
      <div style="overflow-x: auto;">
        <table id="trace-table">
          <thead>
            <tr><th>Step</th><th>Symbol</th><th>From State</th><th>To State</th><th>Remainder</th><th>Calculation</th></tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    let currentN = ${dfa.n};

    function setN(val) {
      document.getElementById('num-n').value = val;
      updateDFA();
    }

    function setBin(val) {
      document.getElementById('bin-input').value = val;
      runSim();
    }

    function updateDFA() {
      const val = parseInt(document.getElementById('num-n').value, 10);
      if (isNaN(val) || val < 1) return;
      currentN = val;
      renderTable();
      renderDiagram();
      runSim();
    }

    function renderTable() {
      const tbody = document.querySelector('#trans-table tbody');
      tbody.innerHTML = '';
      for (let i = 0; i < currentN; i++) {
        const to0 = (2 * i) % currentN;
        const to1 = (2 * i + 1) % currentN;
        const isAcc = i === 0;
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td><strong>q\${i}</strong></td>
          <td>q\${to0}</td>
          <td>q\${to1}</td>
          <td>\${isAcc ? '<span class="badge-acc">Start & Accepting</span>' : '<span style="color:var(--muted)">Remainder ' + i + '</span>'}</td>
        \`;
        tbody.appendChild(tr);
      }
    }

    function renderDiagram(activeState = 0) {
      const svg = document.getElementById('dfa-svg');
      svg.innerHTML = '';
      const cx = 250, cy = 200;
      const R = Math.max(80, Math.min(150, 45 + currentN * 12));
      const nodeR = currentN <= 5 ? 24 : 18;

      const nodes = [];
      for (let i = 0; i < currentN; i++) {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / currentN;
        nodes.push({ id: i, x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) });
      }

      // Draw Edges
      for (let i = 0; i < currentN; i++) {
        const to0 = (2 * i) % currentN;
        const to1 = (2 * i + 1) % currentN;
        const u = nodes[i];

        [ { to: to0, sym: '0' }, { to: to1, sym: '1' } ].forEach(e => {
          if (e.to === i) {
            // self loop
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const dx = u.x - cx, dy = u.y - cy;
            const dist = Math.hypot(dx, dy) || 1;
            const lx = u.x + (dx/dist) * 22, ly = u.y + (dy/dist) * 22;
            circle.setAttribute('cx', lx);
            circle.setAttribute('cy', ly);
            circle.setAttribute('r', '14');
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', '#4b5563');
            circle.setAttribute('stroke-width', '1.5');
            svg.appendChild(circle);
          } else {
            const v = nodes[e.to];
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const mx = (u.x + v.x) / 2 + (u.y - v.y) * 0.15;
            const my = (u.y + v.y) / 2 + (v.x - u.x) * 0.15;
            line.setAttribute('d', \`M \${u.x} \${u.y} Q \${mx} \${my} \${v.x} \${v.y}\`);
            line.setAttribute('fill', 'none');
            line.setAttribute('stroke', '#4b5563');
            line.setAttribute('stroke-width', '1.5');
            svg.appendChild(line);
          }
        });
      }

      // Draw Nodes
      nodes.forEach(n => {
        const isAcc = n.id === 0;
        const isAct = n.id === activeState;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', n.x);
        c.setAttribute('cy', n.y);
        c.setAttribute('r', nodeR);
        c.setAttribute('fill', isAct ? '#0284c7' : isAcc ? '#064e3b' : '#111827');
        c.setAttribute('stroke', isAct ? '#38bdf8' : isAcc ? '#10b981' : '#6b7280');
        c.setAttribute('stroke-width', isAcc ? '2.5' : '2');
        g.appendChild(c);

        if (isAcc) {
          const inner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          inner.setAttribute('cx', n.x);
          inner.setAttribute('cy', n.y);
          inner.setAttribute('r', nodeR - 4);
          inner.setAttribute('fill', 'none');
          inner.setAttribute('stroke', '#34d399');
          inner.setAttribute('stroke-width', '1.5');
          g.appendChild(inner);
        }

        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', n.x);
        t.setAttribute('y', n.y + 4);
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('fill', '#fff');
        t.setAttribute('font-size', '11');
        t.setAttribute('font-weight', 'bold');
        t.textContent = 'q' + n.id;
        g.appendChild(t);

        svg.appendChild(g);
      });
    }

    function runSim() {
      const raw = document.getElementById('bin-input').value.trim();
      const resBox = document.getElementById('sim-result');
      const traceBody = document.querySelector('#trace-table tbody');
      traceBody.innerHTML = '';

      if (raw.length > 0 && !/^[01]+$/.test(raw)) {
        resBox.className = 'result-box result-rej';
        resBox.textContent = 'Invalid binary input! Only 0 and 1 allowed.';
        return;
      }

      let state = 0;
      let dec = 0;
      const steps = [{ step: 0, sym: '-', from: 0, to: 0, rem: 0, calc: 'Start at q0' }];

      for (let i = 0; i < raw.length; i++) {
        const bit = parseInt(raw[i], 10);
        const next = (2 * state + bit) % currentN;
        dec = dec * 2 + bit;
        steps.push({
          step: i + 1,
          sym: raw[i],
          from: state,
          to: next,
          rem: next,
          calc: \`(2 × \${state} + \${bit}) mod \${currentN} = \${next}\`
        });
        state = next;
      }

      const isAccepted = state === 0;
      resBox.className = isAccepted ? 'result-box result-acc' : 'result-box result-rej';
      resBox.innerHTML = \`
        <span>\${isAccepted ? 'ACCEPTED' : 'REJECTED'}: Decimal \${dec} mod \${currentN} = \${state}. \${isAccepted ? 'Divisible!' : 'Not divisible.'} (Final: q\${state})</span>
      \`;

      steps.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td>\${s.step}</td>
          <td>\${s.sym}</td>
          <td>q\${s.from}</td>
          <td><strong>q\${s.to}</strong></td>
          <td>\${s.rem}</td>
          <td>\${s.calc}</td>
        \`;
        traceBody.appendChild(tr);
      });

      renderDiagram(state);
    }

    // Initialize
    updateDFA();
  </script>
</body>
</html>`;

  downloadFile(`binary-divisibility-dfa-n${dfa.n}-offline.html`, htmlContent, 'text/html');
}

/**
 * Downloads the transition table as a .csv file.
 */
export function downloadCsv(dfa: DFA) {
  let csv = 'State,Input 0,Input 1,State Type,Remainder\n';
  for (const s of dfa.states) {
    const to0 = `q${dfa.transitions[s.id]['0']}`;
    const to1 = `q${dfa.transitions[s.id]['1']}`;
    const type = s.isAccepting ? 'Initial & Accepting' : 'Non-accepting';
    csv += `${s.name},${to0},${to1},"${type}",${s.remainder}\n`;
  }
  downloadFile(`dfa-transition-table-n${dfa.n}.csv`, csv, 'text/csv');
}

/**
 * Downloads the full prompt log as an Excel-compatible CSV file with UTF-8 BOM.
 */
export function downloadPromptsExcel() {
  const csv = generatePromptsCSV();
  downloadFile('binary_dfa_generator_prompts.csv', csv, 'text/csv');
}

