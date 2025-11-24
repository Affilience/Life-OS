/**
 * Ikigai Framework - Interactive Purpose Discovery
 * Helps users find purpose at the intersection of:
 * - What you love
 * - What you're good at
 * - What the world needs
 * - What you can be paid for
 */

import React, { useState } from 'react';
import { Heart, Award, Globe, DollarSign, Sparkles } from 'lucide-react';
import Card from '../ui/Card';

const IkigaiDiagram = () => {
  const [activeCircle, setActiveCircle] = useState(null);
  const [formData, setFormData] = useState({
    love: [],
    goodAt: [],
    worldNeeds: [],
    paidFor: [],
  });
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const circles = [
    {
      id: 'love',
      label: 'What You Love',
      icon: Heart,
      color: '#ef4444',
      description: 'Your passions, interests, and things that energize you',
      prompts: [
        'What activities make you lose track of time?',
        'What topics do you read about for fun?',
        'What would you do even if you were not paid?',
      ],
    },
    {
      id: 'goodAt',
      label: 'What You\'re Good At',
      icon: Award,
      color: '#3b82f6',
      description: 'Your skills, talents, and natural strengths',
      prompts: [
        'What do people ask you for help with?',
        'What skills have you developed over time?',
        'What comes naturally to you?',
      ],
    },
    {
      id: 'worldNeeds',
      label: 'What the World Needs',
      icon: Globe,
      color: '#10b981',
      description: 'Problems you see, causes you care about',
      prompts: [
        'What problems frustrate you most?',
        'What positive change do you want to see?',
        'Who do you want to help?',
      ],
    },
    {
      id: 'paidFor',
      label: 'What You Can Be Paid For',
      icon: DollarSign,
      color: '#f59e0b',
      description: 'Market demand, monetizable skills',
      prompts: [
        'What skills have market value?',
        'What would people pay you to do?',
        'What industries need your expertise?',
      ],
    },
  ];

  const intersections = [
    { circles: ['love', 'goodAt'], label: 'Passion', color: '#a855f7' },
    { circles: ['love', 'worldNeeds'], label: 'Mission', color: '#ec4899' },
    { circles: ['worldNeeds', 'paidFor'], label: 'Vocation', color: '#06b6d4' },
    { circles: ['goodAt', 'paidFor'], label: 'Profession', color: '#84cc16' },
  ];

  const handleAddItem = (circleId) => {
    if (inputValue.trim()) {
      setFormData({
        ...formData,
        [circleId]: [...formData[circleId], inputValue.trim()],
      });
      setInputValue('');
      setShowInput(false);
    }
  };

  const handleRemoveItem = (circleId, index) => {
    setFormData({
      ...formData,
      [circleId]: formData[circleId].filter((_, i) => i !== index),
    });
  };

  // Calculate ikigai score (items in all 4 circles)
  const ikigaiScore = Math.min(
    formData.love.length,
    formData.goodAt.length,
    formData.worldNeeds.length,
    formData.paidFor.length
  );

  return (
    <div className="space-y-6">
      {/* Ikigai Score */}
      {ikigaiScore > 0 && (
        <Card padding="md">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                Ikigai Alignment: {ikigaiScore} {ikigaiScore === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
              {ikigaiScore >= 3
                ? 'Strong alignment! You have clear purpose areas to explore.'
                : ikigaiScore >= 1
                ? 'Good start! Keep exploring to find more intersections.'
                : 'Fill in at least one item in each circle to discover your ikigai.'}
            </p>
          </div>
        </Card>
      )}

      {/* Grid of Circles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {circles.map((circle) => {
          const Icon = circle.icon;
          const items = formData[circle.id];
          const isActive = activeCircle === circle.id;

          return (
            <Card
              key={circle.id}
              padding="md"
              hover
              className="cursor-pointer transition-all"
              style={{
                borderColor: isActive ? circle.color : 'rgba(255, 255, 255, 0.04)',
                background: isActive ? `${circle.color}10` : 'rgba(24, 24, 27, 0.4)',
              }}
              onClick={() => setActiveCircle(circle.id)}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${circle.color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: circle.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                      {circle.label}
                    </h3>
                    <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                  {circle.description}
                </p>

                {/* Items */}
                {items.length > 0 && (
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
                        style={{
                          background: 'rgba(39, 39, 42, 0.6)',
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                          {item}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(circle.id, idx);
                          }}
                          className="text-xs px-2 py-1 rounded hover:bg-red-500/20 text-red-400"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Button */}
                {isActive && showInput ? (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddItem(circle.id);
                        }
                      }}
                      placeholder="Type and press Enter..."
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                      style={{
                        background: 'rgba(39, 39, 42, 0.6)',
                        border: `1px solid ${circle.color}`,
                        color: 'rgba(255, 255, 255, 0.87)',
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowInput(false);
                          setInputValue('');
                        }}
                        className="flex-1 px-3 py-2 rounded text-sm"
                        style={{
                          background: 'rgba(39, 39, 42, 0.6)',
                          color: 'rgba(255, 255, 255, 0.60)',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddItem(circle.id)}
                        className="flex-1 px-3 py-2 rounded text-sm"
                        style={{
                          background: circle.color,
                          color: 'rgba(255, 255, 255, 0.87)',
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowInput(true);
                      }}
                      className="w-full px-3 py-2 rounded-lg text-sm font-medium"
                      style={{
                        background: `${circle.color}20`,
                        color: circle.color,
                        border: `1px solid ${circle.color}40`,
                      }}
                    >
                      + Add Item
                    </button>
                  )
                )}

                {/* Prompts */}
                {isActive && !showInput && (
                  <div className="space-y-1 pt-2 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.04)' }}>
                    <p className="text-xs font-medium" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                      Reflection Prompts:
                    </p>
                    {circle.prompts.map((prompt, idx) => (
                      <p key={idx} className="text-xs pl-3" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>
                        • {prompt}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Intersections Explanation */}
      <Card padding="md">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
          Finding Your Ikigai
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {intersections.map((intersection) => (
            <div
              key={intersection.label}
              className="rounded-lg p-3 text-center"
              style={{
                background: `${intersection.color}10`,
                border: `1px solid ${intersection.color}30`,
              }}
            >
              <div className="font-semibold mb-1" style={{ color: intersection.color }}>
                {intersection.label}
              </div>
              <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                {intersection.circles
                  .map((id) => circles.find((c) => c.id === id).label)
                  .join(' + ')}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
            <strong>Your Ikigai</strong> exists at the center where all four circles overlap —
            something you love, you're good at, the world needs, and you can be paid for.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default IkigaiDiagram;
