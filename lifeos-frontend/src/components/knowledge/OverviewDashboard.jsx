import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, Lightbulb, Link as LinkIcon, Quote } from 'lucide-react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
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
function InteractiveSkillTree({ tags }) {
  // Build skills from tags data
  const { skills, connections } = useMemo(() => {
    const tagList = tags || [];

    // Get top 5 tags as "skills"
    const topTags = [...tagList]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 5);

    if (topTags.length === 0) {
      return {
        skills: [
          { id: 1, label: 'No skills yet', level: 1, x: 400, y: 225 }
        ],
        connections: []
      };
    }

    // Position skills in a pattern
    const positions = [
      { x: 300, y: 150 },
      { x: 500, y: 150 },
      { x: 400, y: 300 },
      { x: 200, y: 300 },
      { x: 600, y: 300 },
    ];

    const skillsData = topTags.map((tag, index) => ({
      id: index + 1,
      label: tag.name || 'Unknown',
      level: Math.min(5, Math.ceil((tag.count || 1) / 2)), // Convert count to level (1-5)
      x: positions[index]?.x || 400,
      y: positions[index]?.y || 225
    }));

    // Create connections between related skills (simple pattern)
    const conns = [];
    if (skillsData.length >= 2) conns.push({ from: 1, to: skillsData.length > 2 ? 3 : 2 });
    if (skillsData.length >= 3) conns.push({ from: 2, to: 3 });
    if (skillsData.length >= 4) conns.push({ from: 1, to: 4 });
    if (skillsData.length >= 5) conns.push({ from: 2, to: 5 });

    return { skills: skillsData, connections: conns };
  }, [tags]);

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
function GenreBubbleChart({ books, media }) {
  const genres = useMemo(() => {
    const genreCounts = {};

    // Count genres from books
    (books || []).forEach(book => {
      const genre = book.tags?.[0] || book.metadata?.genre || 'General';
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    // Count genres from media
    (media || []).forEach(item => {
      const genre = item.tags?.[0] || 'General';
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    // Convert to array and sort by count
    const sortedGenres = Object.entries(genreCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    if (sortedGenres.length === 0) {
      return [{ id: 1, name: 'No data', count: 0, x: 325, y: 150, r: 40, color: '#8b5cf6' }];
    }

    // Position and size bubbles
    const positions = [
      { x: 150, y: 100 },
      { x: 320, y: 120 },
      { x: 220, y: 220 },
      { x: 420, y: 180 },
      { x: 520, y: 100 },
    ];

    const colors = ['#8b5cf6', '#6366f1', '#a855f7', '#7c3aed', '#9333ea'];
    const maxCount = Math.max(...sortedGenres.map(g => g.count));

    return sortedGenres.map((genre, index) => ({
      id: index + 1,
      name: genre.name.charAt(0).toUpperCase() + genre.name.slice(1),
      count: genre.count,
      x: positions[index]?.x || 325,
      y: positions[index]?.y || 150,
      r: 30 + (genre.count / maxCount) * 40, // Scale radius by count
      color: colors[index] || '#8b5cf6'
    }));
  }, [books, media]);

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
function CurrentLearningCards({ books, media }) {
  const currentItems = useMemo(() => {
    const items = [];

    // Get books currently being read
    (books || []).filter(b => b.status === 'reading').forEach(book => {
      const progress = book.progress?.total > 0
        ? Math.round((book.progress.current / book.progress.total) * 100)
        : 0;
      items.push({
        id: book.id,
        type: 'Book',
        title: book.title,
        author: book.author || 'Unknown',
        progress,
        category: book.tags?.[0] || 'General'
      });
    });

    // Get media currently being consumed
    (media || []).filter(m => m.status === 'watching' || m.status === 'listening').forEach(m => {
      const type = m.type === 'course' ? 'Course' : m.type === 'podcast' ? 'Podcast' : 'Video';
      items.push({
        id: m.id,
        type,
        title: m.title,
        author: m.creator || 'Unknown',
        progress: m.progress || 50,
        category: m.tags?.[0] || 'General'
      });
    });

    return items.slice(0, 3);
  }, [books, media]);

  if (currentItems.length === 0) {
    return (
      <div className="current-learning-section">
        <h3 className="section-subtitle">Currently Learning</h3>
        <div className="text-white/50 text-center py-8">
          No items in progress. Start a book, course, or podcast!
        </div>
      </div>
    );
  }

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
  // Get data from store
  const { books, media, notes, tags, initializeFromSupabase } = useKnowledgeStore();

  // Initialize data on mount
  useEffect(() => {
    initializeFromSupabase?.();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalBooks = (books || []).length;
    const totalMedia = (media || []).length;
    const totalNotes = (notes || []).length;

    // Count ideas (notes with 'idea' tag)
    const ideasCount = (notes || []).filter(n => n.tags?.includes('idea')).length;

    // Count connections (links between notes)
    const connectionCount = (notes || []).reduce((sum, n) => sum + (n.linkedTo?.length || 0), 0);

    // Count favorites
    const favoritesCount = [
      ...(books || []).filter(b => b.isFavorite),
      ...(media || []).filter(m => m.isFavorite),
      ...(notes || []).filter(n => n.isFavorite)
    ].length;

    return {
      itemsConsumed: totalBooks + totalMedia,
      ideasCaptured: ideasCount > 0 ? ideasCount : totalNotes,
      connectionsMade: connectionCount,
      favorites: favoritesCount
    };
  }, [books, media, notes]);

  return (
    <div className="overview-dashboard">
      {/* Hero Stats */}
      <div className="hero-stats-grid">
        <HeroStat
          icon={BookOpen}
          label="Items Consumed"
          value={stats.itemsConsumed.toString()}
          color="#8b5cf6"
        />
        <HeroStat
          icon={Lightbulb}
          label="Ideas Captured"
          value={stats.ideasCaptured.toString()}
          color="#6366f1"
        />
        <HeroStat
          icon={LinkIcon}
          label="Connections Made"
          color="#a855f7"
          value={stats.connectionsMade.toString()}
        />
        <HeroStat
          icon={Quote}
          label="Favorites"
          value={stats.favorites.toString()}
          color="#7c3aed"
        />
      </div>

      {/* Skill Tree Section */}
      <div className="dashboard-section">
        <h2 className="section-title">Skill Constellation</h2>
        <p className="section-description">
          Your knowledge skills visualized as an interconnected universe
        </p>
        <InteractiveSkillTree tags={tags} />
      </div>

      {/* Genre Distribution */}
      <div className="dashboard-section">
        <h2 className="section-title">Knowledge Universe</h2>
        <p className="section-description">
          Distribution of your learning across different domains
        </p>
        <GenreBubbleChart books={books} media={media} />
      </div>

      {/* Currently Learning */}
      <CurrentLearningCards books={books} media={media} />
    </div>
  );
};

export default OverviewDashboard;
