import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './GraphView.css';

export default function GraphView({ notes, onNodeClick }) {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!notes || notes.length === 0) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Extract links from notes
    const extractLinks = (content) => {
      const linkRegex = /\[\[(.*?)\]\]/g;
      const matches = content.matchAll(linkRegex);
      return Array.from(matches, m => m[1]);
    };

    // Build graph data
    const nodes = notes.map(note => ({
      id: note.id,
      title: note.title,
      tags: note.tags || [],
      content: note.content
    }));

    const links = [];
    notes.forEach(note => {
      const linkedTitles = extractLinks(note.content);
      linkedTitles.forEach(title => {
        const targetNote = notes.find(n => n.title === title);
        if (targetNote) {
          links.push({
            source: note.id,
            target: targetNote.id
          });
        }
      });
    });

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Add zoom behavior
    const g = svg.append('g');
    svg.call(d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      })
    );

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'graph-link')
      .attr('stroke', 'rgba(139, 92, 246, 0.3)')
      .attr('stroke-width', 2);

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'graph-node')
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));

    // Add circles
    node.append('circle')
      .attr('r', 20)
      .attr('fill', d => {
        const tags = extractLinks(d.content);
        return tags.length > 0 ? '#8b5cf6' : '#6366f1';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add labels
    node.append('text')
      .text(d => d.title.length > 15 ? d.title.substring(0, 15) + '...' : d.title)
      .attr('x', 0)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', '500');

    // Node click handler
    node.on('click', (event, d) => {
      const note = notes.find(n => n.id === d.id);
      onNodeClick(note);
      setSelectedNode(d.id);
    });

    // Highlight selected node
    node.select('circle')
      .attr('stroke-width', d => d.id === selectedNode ? 4 : 2)
      .attr('stroke', d => d.id === selectedNode ? '#f59e0b' : '#fff');

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragStarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragEnded(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [notes, selectedNode, onNodeClick]);

  // Calculate connection count
  const connectionCount = notes.reduce((acc, note) => {
    const links = (note.content.match(/\[\[.*?\]\]/g) || []).length;
    return acc + links;
  }, 0);

  return (
    <div className="graph-view-container">
      <div className="graph-info">
        <div className="graph-stat">
          <span className="stat-label">Notes:</span>
          <span className="stat-value">{notes.length}</span>
        </div>
        <div className="graph-stat">
          <span className="stat-label">Connections:</span>
          <span className="stat-value">{connectionCount}</span>
        </div>
      </div>
      <svg ref={svgRef} className="knowledge-graph"></svg>
      <div className="graph-controls-hint">
        <p>💡 Drag nodes to reposition • Scroll to zoom • Click nodes to open</p>
      </div>
    </div>
  );
}
