import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DFA } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Move, Info, Download } from 'lucide-react';
import { downloadSvg } from '../utils/download';

interface DFADiagramProps {
  dfa: DFA;
  activeStateId?: number | null;
  activeTransition?: { from: number; to: number; symbol: '0' | '1' } | null;
}

interface NodePosition {
  id: number;
  name: string;
  x: number;
  y: number;
}

export const DFADiagram: React.FC<DFADiagramProps> = ({
  dfa,
  activeStateId,
  activeTransition,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Canvas Viewport transform: Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Draggable node state
  const [nodes, setNodes] = useState<NodePosition[]>([]);
  const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hovered node to highlight connected transitions
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

  // Dimensions of SVG canvas viewport
  const canvasWidth = 840;
  const canvasHeight = 620;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Node radius adapts to n
  const nodeRadius = dfa.n <= 5 ? 28 : dfa.n <= 10 ? 25 : 22;

  // Compute initial layout when DFA n changes
  useEffect(() => {
    const n = dfa.n;
    const ringRadius = Math.max(140, Math.min(270, 70 + n * 16));
    const initialNodes: NodePosition[] = [];

    for (let i = 0; i < n; i++) {
      // Place q0 at top-center or slightly offset
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
      initialNodes.push({
        id: i,
        name: `q${i}`,
        x: centerX + ringRadius * Math.cos(angle),
        y: centerY + ringRadius * Math.sin(angle),
      });
    }

    setNodes(initialNodes);
    setPan({ x: 0, y: 0 });
    setZoom(n > 12 ? 0.85 : 1);
  }, [dfa.n]);

  // Map for fast node lookup
  const nodeMap = useMemo(() => {
    const map = new Map<number, NodePosition>();
    nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [nodes]);

  // Aggregate transitions between state pairs
  interface EdgeData {
    from: number;
    to: number;
    symbols: ('0' | '1')[];
    isSelfLoop: boolean;
    hasReverse: boolean;
  }

  const edges = useMemo(() => {
    const map = new Map<string, EdgeData>();

    for (let i = 0; i < dfa.n; i++) {
      const trans = dfa.transitions[i];
      if (!trans) continue;

      (['0', '1'] as const).forEach((symbol) => {
        const dest = trans[symbol];
        const key = `${i}->${dest}`;
        if (map.has(key)) {
          const existing = map.get(key)!;
          if (!existing.symbols.includes(symbol)) {
            existing.symbols.push(symbol);
          }
        } else {
          map.set(key, {
            from: i,
            to: dest,
            symbols: [symbol],
            isSelfLoop: i === dest,
            hasReverse: false,
          });
        }
      });
    }

    // Check for reverse edges (u -> v and v -> u)
    map.forEach((edge) => {
      if (!edge.isSelfLoop) {
        const reverseKey = `${edge.to}->${edge.from}`;
        if (map.has(reverseKey)) {
          edge.hasReverse = true;
        }
      }
    });

    return Array.from(map.values());
  }, [dfa]);

  // Canvas Pan Handlers
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (draggingNodeId !== null) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    } else if (draggingNodeId !== null) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Convert screen coordinate to SVG coordinate taking zoom and pan into account
      const mouseSvgX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseSvgY = (e.clientY - rect.top - pan.y) / zoom;

      setNodes((prev) =>
        prev.map((node) =>
          node.id === draggingNodeId
            ? {
                ...node,
                x: Math.max(30, Math.min(canvasWidth - 30, mouseSvgX - dragOffsetRef.current.x)),
                y: Math.max(30, Math.min(canvasHeight - 30, mouseSvgY - dragOffsetRef.current.y)),
              }
            : node
        )
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Node Drag Start
  const handleNodeMouseDown = (e: React.MouseEvent, node: NodePosition) => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseSvgX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseSvgY = (e.clientY - rect.top - pan.y) / zoom;

    dragOffsetRef.current = {
      x: mouseSvgX - node.x,
      y: mouseSvgY - node.y,
    };
    setDraggingNodeId(node.id);
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(2.5, Math.max(0.4, prev * zoomFactor)));
  };

  const handleResetView = () => {
    const ringRadius = Math.max(140, Math.min(270, 70 + dfa.n * 16));
    const initialNodes: NodePosition[] = [];
    for (let i = 0; i < dfa.n; i++) {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / dfa.n;
      initialNodes.push({
        id: i,
        name: `q${i}`,
        x: centerX + ringRadius * Math.cos(angle),
        y: centerY + ringRadius * Math.sin(angle),
      });
    }
    setNodes(initialNodes);
    setPan({ x: 0, y: 0 });
    setZoom(dfa.n > 12 ? 0.85 : 1);
  };

  const handleDownloadSvgClick = () => {
    if (svgRef.current) {
      downloadSvg(svgRef.current, `binary-dfa-n${dfa.n}-diagram.svg`);
    }
  };

  return (
    <div className="relative bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Diagram Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            DFA Transition Diagram
          </span>
          <span className="hidden sm:inline text-slate-400">
            States: {dfa.n} · Alphabet: Σ = {'{0, 1}'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownloadSvgClick}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer text-xs"
            title="Download Vector SVG Diagram"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Download SVG</span>
          </button>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Reset View & Layout"
              aria-label="Reset View and Layout"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="font-mono text-slate-400 px-1 text-[11px] hidden sm:inline">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full h-[520px] select-none overflow-hidden relative ${
          isPanning ? 'cursor-grabbing' : draggingNodeId !== null ? 'cursor-move' : 'cursor-grab'
        } bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] bg-slate-950`}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="w-full h-full pointer-events-none"
        >
          <defs>
            {/* Standard Arrow Marker */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#64748b" />
            </marker>

            {/* Active Highlight Arrow Marker */}
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
            </marker>

            {/* Hover Highlight Arrow Marker */}
            <marker
              id="arrow-hover"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#818cf8" />
            </marker>

            {/* Start Arrow Marker for q0 */}
            <marker
              id="arrow-start"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
            </marker>

            {/* Glowing filter for active states */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Root Transform Group with Zoom and Pan */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Draw Edges */}
            <g className="transition-edges pointer-events-auto">
              {edges.map((edge) => {
                const u = nodeMap.get(edge.from);
                const v = nodeMap.get(edge.to);
                if (!u || !v) return null;

                const isEdgeActive =
                  activeTransition &&
                  activeTransition.from === edge.from &&
                  activeTransition.to === edge.to &&
                  edge.symbols.includes(activeTransition.symbol);

                const isConnectedToHover =
                  hoveredNodeId !== null &&
                  (hoveredNodeId === edge.from || hoveredNodeId === edge.to);

                const strokeColor = isEdgeActive
                  ? '#38bdf8'
                  : isConnectedToHover
                  ? '#818cf8'
                  : hoveredNodeId !== null
                  ? '#334155'
                  : '#475569';

                const strokeWidth = isEdgeActive ? 2.8 : isConnectedToHover ? 2.2 : 1.5;
                const markerEnd = isEdgeActive
                  ? 'url(#arrow-active)'
                  : isConnectedToHover
                  ? 'url(#arrow-hover)'
                  : 'url(#arrow-default)';

                const labelText = edge.symbols.sort().join(', ');

                // Case 1: Self-loop
                if (edge.isSelfLoop) {
                  // Direct loop outward away from canvas center
                  const dx = u.x - centerX;
                  const dy = u.y - centerY;
                  const dist = Math.hypot(dx, dy) || 1;
                  const normX = dx / dist;
                  const normY = dy / dist;

                  // Tangent vector
                  const tanX = -normY;
                  const tanY = normX;

                  const loopSize = nodeRadius * 1.8;
                  // Start and end points on node perimeter
                  const p1X = u.x + normX * nodeRadius * 0.7 + tanX * nodeRadius * 0.7;
                  const p1Y = u.y + normY * nodeRadius * 0.7 + tanY * nodeRadius * 0.7;

                  const p2X = u.x + normX * nodeRadius * 0.7 - tanX * nodeRadius * 0.7;
                  const p2Y = u.y + normY * nodeRadius * 0.7 - tanY * nodeRadius * 0.7;

                  const cp1X = p1X + normX * loopSize + tanX * loopSize * 0.7;
                  const cp1Y = p1Y + normY * loopSize + tanY * loopSize * 0.7;

                  const cp2X = p2X + normX * loopSize - tanX * loopSize * 0.7;
                  const cp2Y = p2Y + normY * loopSize - tanY * loopSize * 0.7;

                  const pathD = `M ${p1X} ${p1Y} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${p2X} ${p2Y}`;
                  const labelX = u.x + normX * (nodeRadius + loopSize * 0.9);
                  const labelY = u.y + normY * (nodeRadius + loopSize * 0.9);

                  return (
                    <g key={`edge-${edge.from}-${edge.to}`}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        markerEnd={markerEnd}
                        className={isEdgeActive ? 'animate-pulse' : ''}
                      />
                      <g transform={`translate(${labelX}, ${labelY})`}>
                        <rect
                          x="-11"
                          y="-9"
                          width="22"
                          height="18"
                          rx="4"
                          fill="#0f172a"
                          stroke={isEdgeActive ? '#38bdf8' : '#334155'}
                          strokeWidth="1"
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={isEdgeActive ? '#38bdf8' : '#94a3b8'}
                          fontSize="11"
                          fontWeight="700"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {labelText}
                        </text>
                      </g>
                    </g>
                  );
                }

                // Case 2: Directed edge between distinct nodes u and v
                const dx = v.x - u.x;
                const dy = v.y - u.y;
                const dist = Math.hypot(dx, dy) || 1;
                const unitX = dx / dist;
                const unitY = dy / dist;

                // Perpendicular vector for curvature
                const perpX = -unitY;
                const perpY = unitX;

                // Amount of curvature: curve outwards if bidirectional or standard curve
                const curvatureOffset = edge.hasReverse ? Math.min(45, Math.max(28, dist * 0.18)) : 16;
                const midX = (u.x + v.x) / 2 + perpX * curvatureOffset;
                const midY = (u.y + v.y) / 2 + perpY * curvatureOffset;

                // Calculate trimmed start and end points so arrow doesn't penetrate inside node circles
                const startX = u.x + unitX * nodeRadius + perpX * 4;
                const startY = u.y + unitY * nodeRadius + perpY * 4;

                // End angle towards v
                const endDx = v.x - midX;
                const endDy = v.y - midY;
                const endDist = Math.hypot(endDx, endDy) || 1;
                const endX = v.x - (endDx / endDist) * (nodeRadius + 4);
                const endY = v.y - (endDy / endDist) * (nodeRadius + 4);

                const pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

                // Label at midpoint
                const labelX = midX + perpX * 3;
                const labelY = midY + perpY * 3;

                return (
                  <g key={`edge-${edge.from}-${edge.to}`}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      markerEnd={markerEnd}
                      className={isEdgeActive ? 'animate-pulse' : ''}
                    />
                    <g transform={`translate(${labelX}, ${labelY})`}>
                      <rect
                        x="-12"
                        y="-9"
                        width="24"
                        height="18"
                        rx="4"
                        fill="#0f172a"
                        stroke={isEdgeActive ? '#38bdf8' : '#334155'}
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={isEdgeActive ? '#38bdf8' : isConnectedToHover ? '#c7d2fe' : '#cbd5e1'}
                        fontSize="11"
                        fontWeight="700"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {labelText}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* Start Arrow pointing to q0 */}
            {(() => {
              const startNode = nodeMap.get(0);
              if (!startNode) return null;
              // Point into q0 from left-top
              const startArrowLength = 48;
              const angle = Math.PI * 1.25; // coming from top-left
              const fromX = startNode.x + Math.cos(angle) * (nodeRadius + startArrowLength);
              const fromY = startNode.y + Math.sin(angle) * (nodeRadius + startArrowLength);
              const toX = startNode.x + Math.cos(angle) * (nodeRadius + 5);
              const toY = startNode.y + Math.sin(angle) * (nodeRadius + 5);

              return (
                <g className="start-arrow pointer-events-none">
                  <line
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="#10b981"
                    strokeWidth="2.5"
                    markerEnd="url(#arrow-start)"
                  />
                  <text
                    x={fromX - 8}
                    y={fromY - 8}
                    fill="#34d399"
                    fontSize="11"
                    fontWeight="800"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    start
                  </text>
                </g>
              );
            })()}

            {/* Draw Nodes */}
            <g className="nodes pointer-events-auto">
              {nodes.map((node) => {
                const isAccepting = node.id === 0;
                const isStart = node.id === 0;
                const isActive = activeStateId === node.id;
                const isHovered = hoveredNodeId === node.id;

                return (
                  <g
                    key={`node-${node.id}`}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseDown={(e) => handleNodeMouseDown(e, node)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className="cursor-grab active:cursor-grabbing transition-transform"
                  >
                    {/* Active State Halo Pulse */}
                    {isActive && (
                      <circle
                        r={nodeRadius + 8}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeDasharray="4 4"
                        className="animate-spin"
                        style={{ animationDuration: '6s' }}
                      />
                    )}

                    {/* Outer Circle */}
                    <circle
                      r={nodeRadius}
                      fill={
                        isActive
                          ? '#0284c7'
                          : isAccepting
                          ? '#064e3b'
                          : isHovered
                          ? '#1e293b'
                          : '#0f172a'
                      }
                      stroke={
                        isActive
                          ? '#38bdf8'
                          : isAccepting
                          ? '#10b981'
                          : isHovered
                          ? '#818cf8'
                          : '#475569'
                      }
                      strokeWidth={isActive ? '3' : isAccepting ? '2.5' : '2'}
                      filter={isActive ? 'url(#glow)' : undefined}
                    />

                    {/* Double circle for Accepting State (q0) */}
                    {isAccepting && (
                      <circle
                        r={nodeRadius - 5}
                        fill="none"
                        stroke={isActive ? '#e0f2fe' : '#34d399'}
                        strokeWidth="1.8"
                      />
                    )}

                    {/* Node Text Label (q0, q1, etc.) */}
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isActive ? '#ffffff' : isAccepting ? '#ecfdf5' : '#f1f5f9'}
                      fontSize={nodeRadius > 24 ? '13' : '11'}
                      fontWeight="700"
                      fontFamily="JetBrains Mono, monospace"
                      className="pointer-events-none select-none"
                    >
                      {node.name}
                    </text>

                    {/* Remainder Subtext Badge */}
                    <text
                      y={nodeRadius + 14}
                      textAnchor="middle"
                      fill={isAccepting ? '#34d399' : '#94a3b8'}
                      fontSize="10"
                      fontWeight="500"
                      className="pointer-events-none select-none"
                    >
                      {node.id === 0 ? 'r = 0 (acc)' : `r = ${node.id}`}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* Legend / Info Bar at bottom of diagram */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/85 backdrop-blur border border-slate-800/80 px-3 py-1.5 rounded-lg pointer-events-none">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full border border-emerald-400" />
              </span>
              <strong className="text-emerald-400">q0:</strong> Start & Accepting
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-slate-500 bg-slate-900" />
              <span>Normal State (qi)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
              <span>Current Simulation Step</span>
            </span>
          </div>
          <span className="hidden md:flex items-center gap-1 text-slate-400">
            <Move className="w-3 h-3" />
            Drag nodes or canvas · Scroll to zoom
          </span>
        </div>
      </div>
    </div>
  );
};
