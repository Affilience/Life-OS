import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Sparkles, MessageCircle } from 'lucide-react';
import { claudeService } from '../../services/ai/claudeService';
import { userDataService } from '../../services/ai/userDataService';
import { proactiveNudges } from '../../services/ai/proactiveNudges';
import './NovaWidget.css';

/**
 * Nova AI Companion - Floating Widget
 *
 * A persistent, draggable AI companion that follows you across all pages.
 * Features:
 * - 4 evolution stages (spark, teen, stellar, cosmos)
 * - 6 emotional states (happy, concerned, excited, proud, thoughtful, encouraging)
 * - Draggable positioning
 * - Collapsible interface
 * - Idle animations
 * - Click to expand for chat
 */

const EVOLUTION_STAGES = {
  spark: { minLevel: 0, maxLevel: 9, name: 'Spark' },
  teen: { minLevel: 10, maxLevel: 24, name: 'Nova' },
  stellar: { minLevel: 25, maxLevel: 49, name: 'Stellar' },
  cosmos: { minLevel: 50, maxLevel: 999, name: 'Cosmos' }
};

const EMOTIONAL_STATES = {
  happy: { emoji: '😊', message: 'How can I help you today?' },
  concerned: { emoji: '😟', message: 'I noticed something...' },
  excited: { emoji: '🤩', message: 'Awesome progress!' },
  proud: { emoji: '🥲', message: 'I\'m proud of you!' },
  thoughtful: { emoji: '🤔', message: 'Hmm, let me think...' },
  encouraging: { emoji: '💪', message: 'You got this!' }
};

export default function NovaWidget({ userLevel = 15 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 120, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [emotionalState, setEmotionalState] = useState('happy');
  const [hasNotification, setHasNotification] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentNudge, setCurrentNudge] = useState(null);
  const [userContext, setUserContext] = useState(null);

  const widgetRef = useRef(null);

  // Determine evolution stage based on user level
  const getEvolutionStage = () => {
    for (const [stage, data] of Object.entries(EVOLUTION_STAGES)) {
      if (userLevel >= data.minLevel && userLevel <= data.maxLevel) {
        return stage;
      }
    }
    return 'spark'; // Default
  };

  const currentStage = getEvolutionStage();
  const spritePath = `/assets/nova/nova_${currentStage}.png`;

  // Handle dragging
  const handleMouseDown = (e) => {
    if (isExpanded || isFullscreen) return; // Don't drag when expanded
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Keep within bounds
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 100;

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setEmotionalState('thoughtful');

    // Track this interaction
    await userDataService.trackEvent('nova', 'chat_message', {
      messageLength: input.length,
      timestamp: Date.now()
    });

    try {
      // Build context-aware system prompt
      const context = await userDataService.getUserContext();
      const systemPrompt = `You are Nova, a mystical advisor AI companion for LifeOS. You're currently in ${EVOLUTION_STAGES[currentStage].name} form (evolution stage based on user level ${userLevel}).

Current User Context:
- Time: ${context.timeOfDay}
- Recent Activity: ${context.recentActivity.today} events today, ${context.recentActivity.thisWeek} this week
- Most Active Module: ${context.recentActivity.mostActive || 'none'}
${context.patterns.mostProductiveTime ? `- Most Productive Time: ${context.patterns.mostProductiveTime}` : ''}

Instructions:
- Keep responses SHORT (2-3 sentences max) in widget mode
- Be a wise, encouraging AI advisor
- Reference their recent activity when relevant
- Provide actionable insights
- Use a warm, supportive, PROFESSIONAL tone
- NEVER use asterisks (*), emojis, or roleplay actions
- Write in clear, direct sentences without decorative formatting`;

      const response = await claudeService.chat(
        [...messages, userMessage],
        { system: systemPrompt }
      );

      setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
      setEmotionalState('happy');
    } catch (error) {
      console.error('Nova chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Sorry, I encountered an error. Please try again.' }]);
      setEmotionalState('concerned');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user context on mount
  useEffect(() => {
    const loadContext = async () => {
      const context = await userDataService.getUserContext();
      setUserContext(context);
    };
    loadContext();
  }, []);

  // Check for proactive nudges periodically
  useEffect(() => {
    const checkNudges = async () => {
      if (!isExpanded) {
        const nudge = await proactiveNudges.checkForNudges();
        if (nudge) {
          setCurrentNudge(nudge);
          setEmotionalState(nudge.emotionalState);
          setHasNotification(true);
        }
      }
    };

    // Check immediately
    checkNudges();

    // Check every 10 minutes
    const interval = setInterval(checkNudges, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isExpanded]);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] z-[9999] flex flex-col">
        {/* Header */}
        <div className="bg-[#111111] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={spritePath} alt="Nova" className="w-12 h-12 pixelated" />
            <div>
              <h2 className="text-lg font-bold">Nova - {EVOLUTION_STAGES[currentStage].name}</h2>
              <p className="text-sm text-gray-400">Your AI Life Coach</p>
            </div>
          </div>
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <Minimize2 size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <Sparkles size={48} className="mx-auto mb-4 text-blue-400" />
              <p>Hi! I'm Nova, your AI companion.</p>
              <p className="text-sm">Ask me anything about LifeOS!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <img src={spritePath} alt="Nova" className="w-8 h-8 pixelated" />
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#1a1a1a] text-gray-100 border border-[#2a2a2a]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="bg-[#111111] border-t border-[#2a2a2a] px-6 py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Nova anything..."
              disabled={isLoading}
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={widgetRef}
      className={`nova-widget ${isExpanded ? 'expanded' : 'minimized'} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      {!isExpanded ? (
        /* Minimized State */
        <div
          className="nova-minimized"
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            if (!isDragging) {
              setIsExpanded(true);
              setHasNotification(false);
            }
          }}
          onDoubleClick={() => {
            setIsFullscreen(true);
            setIsExpanded(false);
          }}
        >
          <div className="nova-avatar-container">
            <img
              src={spritePath}
              alt="Nova"
              className="nova-avatar pixelated"
            />
            {hasNotification && <div className="nova-notification-badge" />}
          </div>
          <div className="nova-speech-bubble">
            {EMOTIONAL_STATES[emotionalState].emoji} {currentNudge ? currentNudge.message : EMOTIONAL_STATES[emotionalState].message}
          </div>
        </div>
      ) : (
        /* Expanded State */
        <div className="nova-expanded">
          {/* Header */}
          <div className="nova-header">
            <div className="flex items-center gap-2">
              <img src={spritePath} alt="Nova" className="w-8 h-8 pixelated" />
              <div>
                <div className="font-bold text-sm">Nova</div>
                <div className="text-xs text-gray-400">{EVOLUTION_STAGES[currentStage].name}</div>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-1 hover:bg-[#2a2a2a] rounded transition-colors"
                title="Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-[#2a2a2a] rounded transition-colors"
                title="Minimize"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Chat */}
          <div className="nova-chat">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>Ask me anything!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.slice(-3).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`text-xs ${
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block px-3 py-1.5 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#1a1a1a] text-gray-100'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="nova-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
