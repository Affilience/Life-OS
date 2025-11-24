import React, { useState } from 'react';
import { BookOpen, Lightbulb, Link as LinkIcon, Quote } from 'lucide-react';
import './OverviewDashboard.css';

// Hero Stat Component
function HeroStat({ icon: Icon, label, value, color }) {
  return (
    <div className="hero-stat" style={{ '--stat-color': color }}>
      <div className="hero-stat-icon">
        <Icon size={32} />
      </div>
      <div className="hero-stat-content">
        <div className="hero-stat-value">{value}</div>
        <div className="hero-stat-label">{label}</div>
      </div>
      <div className="hero-stat-glow"></div>
    </div>
  );
}

// Skill Node Component
function SkillNode({ skill, x, y }) {
  const [hovered, setHovered] = useState(false);
  const radius = 40 + (skill.level * 10);

  return (
    <g
      className="skill-node"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow effect */}
      <circle
        cx={x}
        cy={y}
        r={radius + 10}
        fill="rgba(139, 92, 246, 0.2)"
        className="skill-glow"
        style={{ opacity: hovered ? 1 : 0.5 }}
      />

      {/* Main node circle */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill="url(#skillGradient)"
        className="skill-circle"
      />

      {/* Level rings */}
      {[...Array(skill.level)].map((_, i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={radius - (i * 8)}
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
        />
      ))}

      {/* Label */}
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="600"
        className="skill-label"
      >
        {skill.label}
      </text>

      {/* Hover detail */}
      {hovered && (
        <g>
          <rect
            x={x - 60}
            y={y - radius - 40}
            width="120"
            height="30"
            rx="8"
            fill="rgba(0, 0, 0, 0.9)"
            stroke="rgba(139, 92, 246, 0.5)"
          />
          <text
            x={x}
            y={y - radius - 20}
            textAnchor="middle"
            fill="#8b5cf6"
            fontSize="12"
          >
            Level {skill.level}
          </text>
        </g>
      )}
    </g>
  );
}

// Interactive Skill Tree Component
function InteractiveSkillTree() {
  const skills = [
    { id: 1, label: 'React', level: 5, x: 300, y: 150 },
    { id: 2, label: 'Node.js', level: 4, x: 500, y: 150 },
    { id: 3, label: 'PostgreSQL', level: 3, x: 400, y: 300 },
    { id: 4, label: 'Design', level: 4, x: 200, y: 300 },
    { id: 5, label: 'Business', level: 3, x: 600, y: 300 },
  ];

  const connections = [
    { from: 1, to: 3 },
    { from: 2, to: 3 },
    { from: 1, to: 4 },
    { from: 2, to: 5 },
  ];

  return (
    <div className="skill-tree-container">
      <svg className="skill-tree-canvas" viewBox="0 0 800 450">
        <defs>
          <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.1)" />
          </linearGradient>
        </defs>

        {/* Draw connections */}
        {connections.map((conn, idx) => {
          const fromSkill = skills.find(s => s.id === conn.from);
          const toSkill = skills.find(s => s.id === conn.to);
          return (
            <line
              key={idx}
              x1={fromSkill.x}
              y1={fromSkill.y}
              x2={toSkill.x}
              y2={toSkill.y}
              stroke="url(#connectionGradient)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          );
        })}

        {/* Draw skill nodes */}
        {skills.map(skill => (
          <SkillNode
            key={skill.id}
            skill={skill}
            x={skill.x}
            y={skill.y}
          />
        ))}
      </svg>
    </div>
  );
}

// Genre Bubble Chart Component
function GenreBubbleChart() {
  const genres = [
    { id: 1, name: 'Tech', count: 45, x: 150, y: 100, r: 60, color: '#8b5cf6' },
    { id: 2, name: 'Business', count: 32, x: 320, y: 120, r: 50, color: '#6366f1' },
    { id: 3, name: 'Philosophy', count: 28, x: 220, y: 220, r: 45, color: '#a855f7' },
    { id: 4, name: 'Science', count: 38, x: 420, y: 180, r: 55, color: '#7c3aed' },
    { id: 5, name: 'Fiction', count: 22, x: 520, y: 100, r: 40, color: '#9333ea' },
  ];

  return (
    <div className="bubble-chart-container">
      <svg className="bubble-chart-svg" viewBox="0 0 650 300">
        <defs>
          {genres.map(genre => (
            <radialGradient key={genre.id} id={`bubbleGradient-${genre.id}`}>
              <stop offset="0%" stopColor={genre.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={genre.color} stopOpacity="0.3" />
            </radialGradient>
          ))}
        </defs>

        {genres.map(genre => (
          <g key={genre.id} className="genre-bubble">
            <circle
              cx={genre.x}
              cy={genre.y}
              r={genre.r}
              fill={`url(#bubbleGradient-${genre.id})`}
              className="bubble-circle"
            />
            <text
              x={genre.x}
              y={genre.y - 5}
              textAnchor="middle"
              fill="white"
              fontSize="16"
              fontWeight="600"
            >
              {genre.name}
            </text>
            <text
              x={genre.x}
              y={genre.y + 15}
              textAnchor="middle"
              fill="rgba(255, 255, 255, 0.7)"
              fontSize="12"
            >
              {genre.count} items
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Current Learning Cards Component
function CurrentLearningCards() {
  const currentItems = [
    {
      id: 1,
      type: 'Book',
      title: 'Atomic Habits',
      author: 'James Clear',
      progress: 65,
      category: 'Self-Improvement'
    },
    {
      id: 2,
      type: 'Course',
      title: 'Advanced React Patterns',
      author: 'Kent C. Dodds',
      progress: 40,
      category: 'Tech'
    },
    {
      id: 3,
      type: 'Podcast',
      title: 'The Tim Ferriss Show',
      author: 'Tim Ferriss',
      progress: 100,
      category: 'Business'
    },
  ];

  return (
    <div className="current-learning-section">
      <h3 className="section-subtitle">Currently Learning</h3>
      <div className="current-learning-grid">
        {currentItems.map(item => (
          <div key={item.id} className="learning-card">
            <div className="learning-card-header">
              <span className="learning-type">{item.type}</span>
              <span className="learning-category">{item.category}</span>
            </div>
            <h4 className="learning-title">{item.title}</h4>
            <p className="learning-author">{item.author}</p>
            <div className="learning-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
              <span className="progress-text">{item.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Overview Dashboard Component
const OverviewDashboard = () => {
  return (
    <div className="overview-dashboard">
      {/* Hero Stats */}
      <div className="hero-stats-grid">
        <HeroStat
          icon={BookOpen}
          label="Items Consumed"
          value="247"
          color="#8b5cf6"
        />
        <HeroStat
          icon={Lightbulb}
          label="Ideas Captured"
          value="156"
          color="#6366f1"
        />
        <HeroStat
          icon={LinkIcon}
          label="Connections Made"
          color="#a855f7"
          value="423"
        />
        <HeroStat
          icon={Quote}
          label="Favorite Quotes"
          value="89"
          color="#7c3aed"
        />
      </div>

      {/* Skill Tree Section */}
      <div className="dashboard-section">
        <h2 className="section-title">Skill Constellation</h2>
        <p className="section-description">
          Your knowledge skills visualized as an interconnected universe
        </p>
        <InteractiveSkillTree />
      </div>

      {/* Genre Distribution */}
      <div className="dashboard-section">
        <h2 className="section-title">Knowledge Universe</h2>
        <p className="section-description">
          Distribution of your learning across different domains
        </p>
        <GenreBubbleChart />
      </div>

      {/* Currently Learning */}
      <CurrentLearningCards />
    </div>
  );
};

export default OverviewDashboard;
