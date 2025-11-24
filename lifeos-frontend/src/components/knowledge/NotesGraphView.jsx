import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Search, Filter, Plus, X } from 'lucide-react';
import './NotesGraphView.css';

// Mock data for nodes
const initialNodes = [
  {
    id: 1,
    type: 'note',
    title: 'React Performance',
    content: 'Key techniques for optimizing React applications including memoization, lazy loading, and code splitting.',
    tags: ['react', 'performance', 'web'],
    connections: [2, 3],
    position: { x: 300, y: 200 }
  },
  {
    id: 2,
    type: 'idea',
    title: 'Personal Dashboard',
    content: 'Create a unified dashboard showing all life metrics in one place.',
    tags: ['product', 'idea', 'dashboard'],
    connections: [1, 4],
    position: { x: 500, y: 250 }
  },
  {
    id: 3,
    type: 'note',
    title: 'PostgreSQL Indexing',
    content: 'Understanding B-tree indexes and when to use GIN vs GiST indexes.',
    tags: ['database', 'postgresql', 'performance'],
    connections: [1],
    position: { x: 250, y: 400 }
  },
  {
    id: 4,
    type: 'idea',
    title: 'Learning Tracker',
    content: 'Track skills and learning progress with visual skill trees.',
    tags: ['product', 'learning', 'visualization'],
    connections: [2, 5],
    position: { x: 700, y: 300 }
  },
  {
    id: 5,
    type: 'note',
    title: 'SVG Animations',
    content: 'Using CSS and JS to create smooth, performant SVG animations.',
    tags: ['svg', 'animation', 'web'],
    connections: [4],
    position: { x: 800, y: 450 }
  },
];

// Node Component
function GraphNode({ node, isSelected, onClick }) {
  const nodeRadius = 50;
  const nodeColor = node.type === 'note' ? '#8b5cf6' : '#a855f7';

  return (
    <g
      className={`graph-node ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(node)}
      style={{ cursor: 'pointer' }}
    >
      {/* Node glow */}
      <circle
        cx={node.position.x}
        cy={node.position.y}
        r={nodeRadius + 8}
        fill={nodeColor}
        opacity="0.2"
        className="node-glow"
      />

      {/* Main node circle */}
      <circle
        cx={node.position.x}
        cy={node.position.y}
        r={nodeRadius}
        fill={nodeColor}
        className="node-circle"
        stroke={isSelected ? '#fff' : 'rgba(255, 255, 255, 0.3)'}
        strokeWidth={isSelected ? 3 : 1}
      />

      {/* Node type indicator */}
      <circle
        cx={node.position.x}
        cy={node.position.y}
        r={nodeRadius - 10}
        fill="none"
        stroke="rgba(255, 255, 255, 0.4)"
        strokeWidth="1"
        strokeDasharray={node.type === 'idea' ? '4,4' : '0'}
      />

      {/* Node label */}
      <text
        x={node.position.x}
        y={node.position.y - nodeRadius - 10}
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="600"
        className="node-label"
      >
        {node.title.length > 15 ? node.title.substring(0, 15) + '...' : node.title}
      </text>

      {/* Type badge */}
      <text
        x={node.position.x}
        y={node.position.y + 5}
        textAnchor="middle"
        fill="white"
        fontSize="12"
        opacity="0.8"
      >
        {node.type}
      </text>
    </g>
  );
}

// Connection Lines Component
function ConnectionLines({ nodes }) {
  return (
    <g className="connection-lines">
      {nodes.map(node =>
        node.connections.map(connId => {
          const targetNode = nodes.find(n => n.id === connId);
          if (!targetNode) return null;

          return (
            <line
              key={`${node.id}-${connId}`}
              x1={node.position.x}
              y1={node.position.y}
              x2={targetNode.position.x}
              y2={targetNode.position.y}
              stroke="url(#connectionGradient)"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.4"
            />
          );
        })
      )}
    </g>
  );
}

// Node Detail Panel Component
function NodeDetailPanel({ node, onClose }) {
  if (!node) return null;

  return (
    <div className="node-detail-panel">
      <div className="panel-header">
        <div className="panel-title-section">
          <span className={`node-type-badge ${node.type}`}>{node.type}</span>
          <h3 className="panel-title">{node.title}</h3>
        </div>
        <button className="panel-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="panel-content">
        <p className="node-content">{node.content}</p>

        <div className="node-tags">
          {node.tags.map(tag => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>

        <div className="node-connections-info">
          <h4>Connections</h4>
          <p>{node.connections.length} linked nodes</p>
        </div>
      </div>

      <div className="panel-actions">
        <button className="panel-button">Edit</button>
        <button className="panel-button">Add Connection</button>
      </div>
    </div>
  );
}

// Main NotesGraphView Component
const NotesGraphView = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'note', 'idea'

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         node.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || node.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="notes-graph-view">
      {/* Controls Bar */}
      <div className="graph-controls">
        <div className="search-controls">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search notes and ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filterType === 'note' ? 'active' : ''}`}
              onClick={() => setFilterType('note')}
            >
              Notes
            </button>
            <button
              className={`filter-btn ${filterType === 'idea' ? 'active' : ''}`}
              onClick={() => setFilterType('idea')}
            >
              Ideas
            </button>
          </div>
        </div>

        <div className="zoom-controls">
          <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={16} />
          </button>
        </div>

        <button className="add-node-btn">
          <Plus size={16} />
          Add Node
        </button>
      </div>

      {/* Graph Canvas */}
      <div className="graph-canvas-container">
        <svg
          className="graph-canvas"
          viewBox="0 0 1200 800"
          style={{ transform: `scale(${zoom})` }}
        >
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.6)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Connection lines */}
          <ConnectionLines nodes={filteredNodes} />

          {/* Nodes */}
          {filteredNodes.map(node => (
            <GraphNode
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              onClick={handleNodeClick}
            />
          ))}
        </svg>
      </div>

      {/* Detail Panel */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Stats Bar */}
      <div className="graph-stats">
        <div className="stat-item">
          <span className="stat-label">Total Nodes</span>
          <span className="stat-value">{nodes.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Notes</span>
          <span className="stat-value">{nodes.filter(n => n.type === 'note').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Ideas</span>
          <span className="stat-value">{nodes.filter(n => n.type === 'idea').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Connections</span>
          <span className="stat-value">
            {nodes.reduce((acc, node) => acc + node.connections.length, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotesGraphView;
