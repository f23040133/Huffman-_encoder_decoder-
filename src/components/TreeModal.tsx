import { useState, useCallback, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, Download, Maximize2, Minimize2, RotateCcw, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HuffmanNode } from '../lib/huffman';
import { isLeaf, getCharDisplay } from '../lib/huffman';

interface TreeModalProps {
  tree: HuffmanNode;
  onClose: () => void;
  darkMode: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface NodeData {
  node: HuffmanNode;
  x: number;
  y: number;
  path: string;
  parentX?: number;
  parentY?: number;
  isLeft?: boolean;
  depth: number;
  index: number;
}

// Calculate tree layout
function calculateLayout(tree: HuffmanNode, width: number, height: number): NodeData[] {
  const nodes: NodeData[] = [];
  const levelNodes: Map<number, number> = new Map();
  let nodeIndex = 0;

  function countNodesAtLevel(node: HuffmanNode, level: number) {
    levelNodes.set(level, (levelNodes.get(level) || 0) + 1);
    if (node.left) countNodesAtLevel(node.left, level + 1);
    if (node.right) countNodesAtLevel(node.right, level + 1);
  }
  countNodesAtLevel(tree, 0);

  const maxLevel = Math.max(...levelNodes.keys());
  const verticalSpacing = Math.min(100, (height - 100) / (maxLevel + 1));

  function traverse(
    node: HuffmanNode,
    depth: number,
    minX: number,
    maxX: number,
    path: string,
    parentX?: number,
    parentY?: number,
    isLeft?: boolean
  ) {
    const x = (minX + maxX) / 2;
    const y = 60 + depth * verticalSpacing;

    nodes.push({
      node,
      x,
      y,
      path,
      parentX,
      parentY,
      isLeft,
      depth,
      index: nodeIndex++,
    });

    const midX = (minX + maxX) / 2;
    if (node.left) {
      traverse(node.left, depth + 1, minX, midX, path + '0', x, y, true);
    }
    if (node.right) {
      traverse(node.right, depth + 1, midX, maxX, path + '1', x, y, false);
    }
  }

  traverse(tree, 0, 50, width - 50, '');
  return nodes;
}

export function TreeModal({ tree, onClose, darkMode }: TreeModalProps) {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const canvasWidth = isFullscreen ? window.innerWidth : 900;
  const canvasHeight = isFullscreen ? window.innerHeight - 120 : 550;
  const nodes = calculateLayout(tree, canvasWidth / zoom, canvasHeight / zoom);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.3));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
    setAnimationStep(0);
    setIsAnimating(false);
  };

  // Animation logic
  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        setAnimationStep(prev => {
          if (prev >= nodes.length - 1) {
            setIsAnimating(false);
            return prev;
          }
          return prev + 1;
        });
      };
      animationRef.current = window.setTimeout(animate, 300);
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isAnimating, animationStep, nodes.length]);

  const toggleAnimation = () => {
    if (isAnimating) {
      setIsAnimating(false);
    } else {
      if (animationStep >= nodes.length - 1) setAnimationStep(0);
      setIsAnimating(true);
    }
  };

  const stepForward = () => {
    setAnimationStep(prev => Math.min(prev + 1, nodes.length - 1));
  };

  const stepBackward = () => {
    setAnimationStep(prev => Math.max(prev - 1, 0));
  };

  // Mouse handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleExport = () => {
    const content = generateTreeText(tree, '', true);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'huffman_tree.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateTreeText = (node: HuffmanNode, prefix: string, isRoot: boolean): string => {
    let result = '';
    if (isRoot) {
      result += `Root (freq: ${node.frequency})\n`;
    }
    if (node.left) {
      result += `${prefix}${node.right ? '├── ' : '└── '}0: `;
      if (isLeaf(node.left)) {
        result += `[${getCharDisplay(node.left.char!)}] (freq: ${node.left.frequency})\n`;
      } else {
        result += `(freq: ${node.left.frequency})\n`;
        result += generateTreeText(node.left, prefix + (node.right ? '│   ' : '    '), false);
      }
    }
    if (node.right) {
      result += `${prefix}└── 1: `;
      if (isLeaf(node.right)) {
        result += `[${getCharDisplay(node.right.char!)}] (freq: ${node.right.frequency})\n`;
      } else {
        result += `(freq: ${node.right.frequency})\n`;
        result += generateTreeText(node.right, prefix + '    ', false);
      }
    }
    return result;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div
        className={`
          rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all relative border border-purple-500/30
          ${isFullscreen ? 'w-full h-full rounded-none' : 'w-[950px] max-w-[95vw] h-[700px] max-h-[90vh]'}
        `}
        style={{ backgroundColor: '#0a0a1a', zIndex: 10000 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/30" style={{ backgroundColor: '#12122a' }}>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse" />
            <h2 className="font-bold text-lg text-white">Huffman Tree Visualization</h2>
            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {nodes.length} nodes
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Animation Controls */}
            <button
              onClick={stepBackward}
              className="p-2 rounded-lg transition-all hover:bg-purple-500/20 text-gray-400 hover:text-white"
              title="Step Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={toggleAnimation}
              className={`p-2 rounded-lg transition-all ${isAnimating ? 'bg-purple-500/30 text-purple-300' : 'hover:bg-purple-500/20 text-gray-400 hover:text-white'}`}
              title={isAnimating ? 'Pause' : 'Play Animation'}
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={stepForward}
              className="p-2 rounded-lg transition-all hover:bg-purple-500/20 text-gray-400 hover:text-white"
              title="Step Forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-lg transition-all hover:bg-white/10 text-gray-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono w-12 text-center text-purple-300">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-lg transition-all hover:bg-white/10 text-gray-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button
              onClick={handleReset}
              className="p-2 rounded-lg transition-all hover:bg-white/10 text-gray-400 hover:text-white"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 rounded-lg transition-all hover:bg-white/10 text-gray-400 hover:text-white"
              title="Export as Text"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg transition-all hover:bg-white/10 text-gray-400 hover:text-white"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all hover:bg-rose-500/20 text-gray-400 hover:text-rose-400"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tree Canvas */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ backgroundColor: '#050510' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            width="100%"
            height="100%"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin: 'center center',
            }}
          >
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.05)" strokeWidth="1" />
              </pattern>
              {/* Glow filters */}
              <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feFlood floodColor="#a855f7" floodOpacity="0.5" />
                <feComposite in2="blur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feFlood floodColor="#22d3ee" floodOpacity="0.5" />
                <feComposite in2="blur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-emerald" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feFlood floodColor="#10b981" floodOpacity="0.6" />
                <feComposite in2="blur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Gradient for edges */}
              <linearGradient id="edge-gradient-left" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="edge-gradient-right" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Draw edges with animation */}
            {nodes.map((nodeData, idx) => {
              if (nodeData.parentX === undefined || nodeData.parentY === undefined) return null;
              const isVisible = idx <= animationStep;
              const isHighlighted = hoveredNode?.index === idx || selectedNode?.index === idx;
              
              return (
                <g key={`edge-${idx}`} style={{ opacity: isVisible ? 1 : 0.1, transition: 'opacity 0.3s ease' }}>
                  {/* Edge line */}
                  <path
                    d={`M ${nodeData.parentX} ${nodeData.parentY + 20} 
                        C ${nodeData.parentX} ${(nodeData.parentY + nodeData.y) / 2},
                          ${nodeData.x} ${(nodeData.parentY + nodeData.y) / 2},
                          ${nodeData.x} ${nodeData.y - 20}`}
                    fill="none"
                    stroke={nodeData.isLeft ? 'url(#edge-gradient-left)' : 'url(#edge-gradient-right)'}
                    strokeWidth={isHighlighted ? 3 : 2}
                    style={{
                      filter: isHighlighted ? 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.5))' : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  />
                  {/* Edge label (0 or 1) */}
                  <g transform={`translate(${(nodeData.parentX + nodeData.x) / 2}, ${(nodeData.parentY + nodeData.y) / 2 - 5})`}>
                    <circle
                      r="12"
                      fill={nodeData.isLeft ? '#0ea5e9' : '#f97316'}
                      opacity={0.9}
                      style={{
                        filter: isHighlighted ? (nodeData.isLeft ? 'url(#glow-cyan)' : 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.5))') : 'none',
                      }}
                    />
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="white"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {nodeData.isLeft ? '0' : '1'}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Draw nodes */}
            {nodes.map((nodeData, idx) => {
              const isLeafNode = isLeaf(nodeData.node);
              const isVisible = idx <= animationStep;
              const isHovered = hoveredNode?.index === idx;
              const isSelected = selectedNode?.index === idx;
              const isHighlighted = isHovered || isSelected;

              return (
                <g
                  key={`node-${idx}`}
                  transform={`translate(${nodeData.x}, ${nodeData.y})`}
                  style={{
                    opacity: isVisible ? 1 : 0.1,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredNode(nodeData)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(isSelected ? null : nodeData)}
                >
                  {/* Node glow background */}
                  {isHighlighted && (
                    <circle
                      r={isLeafNode ? 32 : 26}
                      fill={isLeafNode ? '#10b981' : '#a855f7'}
                      opacity={0.2}
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Node circle */}
                  <circle
                    r={isLeafNode ? 24 : 18}
                    fill={isLeafNode ? '#065f46' : '#1e1b4b'}
                    stroke={isLeafNode ? '#10b981' : '#7c3aed'}
                    strokeWidth={isHighlighted ? 3 : 2}
                    style={{
                      filter: isHighlighted
                        ? (isLeafNode ? 'url(#glow-emerald)' : 'url(#glow-purple)')
                        : 'none',
                      transition: 'all 0.2s ease',
                      transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
                      transformOrigin: 'center',
                    }}
                  />

                  {/* Node content */}
                  {isLeafNode ? (
                    <>
                      <text
                        textAnchor="middle"
                        dy="5"
                        fill="#34d399"
                        fontSize="14"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {getCharDisplay(nodeData.node.char!)}
                      </text>
                    </>
                  ) : (
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="#c4b5fd"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {nodeData.node.frequency}
                    </text>
                  )}

                  {/* Frequency label below leaf nodes */}
                  {isLeafNode && (
                    <text
                      textAnchor="middle"
                      dy="42"
                      fill="#9ca3af"
                      fontSize="10"
                    >
                      freq: {nodeData.node.frequency}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info Panel */}
        <div className="px-4 py-3 border-t border-purple-500/30 flex items-center justify-between" style={{ backgroundColor: '#12122a' }}>
          <div className="flex items-center gap-6 text-xs">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-600" />
              <span className="text-gray-400">Internal Node</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-500" />
              <span className="text-gray-400">Leaf Node</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-gray-400">0 = Left</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-gray-400">1 = Right</span>
            </span>
          </div>

          {/* Selected/Hovered Node Info */}
          {(selectedNode || hoveredNode) && (
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <span className="text-purple-300 text-xs">
                {isLeaf((selectedNode || hoveredNode)!.node) ? (
                  <>
                    <strong className="text-emerald-400">
                      '{getCharDisplay((selectedNode || hoveredNode)!.node.char!)}'
                    </strong>
                    {' → Code: '}
                    <code className="text-cyan-400 font-mono">{(selectedNode || hoveredNode)!.path || 'root'}</code>
                    {' | Freq: '}
                    <span className="text-amber-400">{(selectedNode || hoveredNode)!.node.frequency}</span>
                  </>
                ) : (
                  <>
                    <strong className="text-purple-400">Internal</strong>
                    {' | Path: '}
                    <code className="text-cyan-400 font-mono">{(selectedNode || hoveredNode)!.path || 'root'}</code>
                    {' | Freq: '}
                    <span className="text-amber-400">{(selectedNode || hoveredNode)!.node.frequency}</span>
                  </>
                )}
              </span>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Step {animationStep + 1} / {nodes.length} | Drag to pan • Click nodes for info
          </div>
        </div>
      </div>
    </div>
  );
}
