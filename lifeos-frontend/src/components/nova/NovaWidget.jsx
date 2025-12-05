import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  MessageCircle,
  CheckSquare,
  Dumbbell,
  BookOpen,
  Wallet,
  Calendar,
  Target
} from 'lucide-react';
import { claudeService } from '../../services/ai/claudeService';
import { proactiveNudges } from '../../services/ai/proactiveNudges';
import { getCrossModuleContext, generateContextSummary } from '../../services/ai/crossModuleData';
import useGamificationStore from '../../stores/gamificationStore';
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
 * - Quick action buttons
 * - Real-time context awareness from all modules
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

// Quick action buttons for common tasks
const QUICK_ACTIONS = [
  { id: 'tasks', icon: CheckSquare, label: 'Tasks', route: '/productivity', color: 'text-blue-400' },
  { id: 'workout', icon: Dumbbell, label: 'Workout', route: '/health', color: 'text-green-400' },
  { id: 'learn', icon: BookOpen, label: 'Learn', route: '/knowledge', color: 'text-purple-400' },
  { id: 'budget', icon: Wallet, label: 'Budget', route: '/financial', color: 'text-yellow-400' },
  { id: 'calendar', icon: Calendar, label: 'Schedule', route: '/calendar', color: 'text-pink-400' },
  { id: 'goals', icon: Target, label: 'Goals', route: '/gamification', color: 'text-orange-400' },
];

export default function NovaWidget() {
  const navigate = useNavigate();

  // Get real user level from gamification store
  const { level: userLevel, currentStage } = useGamificationStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Initial position: account for bottom nav on mobile (64px + padding)
  const isMobile = window.innerWidth <= 768;
  const bottomOffset = isMobile ? 100 : 20; // Higher on mobile to avoid bottom nav
  const [position, setPosition] = useState({
    x: window.innerWidth - 100,
    y: window.innerHeight - bottomOffset - 80
  });
  const [isDragging, setIsDragging] = useState(false);
  const [wasDragged, setWasDragged] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [emotionalState, setEmotionalState] = useState('happy');
  const [hasNotification, setHasNotification] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentNudge, setCurrentNudge] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const widgetRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Determine evolution stage name based on user level
  const getEvolutionStage = () => {
    const level = userLevel || 1;
    for (const [stage, data] of Object.entries(EVOLUTION_STAGES)) {
      if (level >= data.minLevel && level <= data.maxLevel) {
        return stage;
      }
    }
    return 'spark';
  };

  // currentStage from store is a number (1-40+), we need the string name
  const evolutionStage = getEvolutionStage();
  const spritePath = `/assets/nova/nova_${evolutionStage}.png`;

  // Calculate expanded view position based on avatar position
  const getExpandedPosition = () => {
    const chatHeight = 480; // Approximate height of expanded chat
    const chatWidth = 320;
    const avatarSize = 72;
    const padding = 16;
    const bottomNavHeight = window.innerWidth <= 768 ? 80 : 0;

    // Check if there's enough space below the avatar
    const spaceBelow = window.innerHeight - position.y - avatarSize - bottomNavHeight;
    const spaceAbove = position.y;

    // Determine if we should show above or below
    const openAbove = spaceBelow < chatHeight && spaceAbove > spaceBelow;

    // Calculate horizontal position (try to align with avatar, but stay on screen)
    let left = position.x + avatarSize - chatWidth; // Align right edge with avatar
    if (left < padding) left = padding;
    if (left + chatWidth > window.innerWidth - padding) {
      left = window.innerWidth - chatWidth - padding;
    }

    if (openAbove) {
      // Open above the avatar
      const maxHeight = Math.min(chatHeight, spaceAbove - padding);
      return {
        left: `${left}px`,
        bottom: `${window.innerHeight - position.y + padding}px`,
        top: 'auto',
        right: 'auto',
        maxHeight: `${maxHeight}px`,
      };
    } else {
      // Open below the avatar (default behavior)
      const maxHeight = Math.min(chatHeight, spaceBelow - padding);
      return {
        left: `${left}px`,
        top: `${position.y + avatarSize + padding}px`,
        bottom: 'auto',
        right: 'auto',
        maxHeight: `${maxHeight}px`,
      };
    }
  };

  // Handle dragging - use standard mousedown/mousemove/mouseup pattern
  const handleMouseDown = (e) => {
    if (isExpanded || isFullscreen) return;
    e.preventDefault(); // Prevent text selection during drag
    setIsDragging(true);
    setWasDragged(false);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const maxX = window.innerWidth - 100;
      // Keep above bottom nav on mobile (64px nav + 16px padding + widget height)
      const bottomNavHeight = window.innerWidth <= 768 ? 80 : 0;
      const maxY = window.innerHeight - 100 - bottomNavHeight;

      // Check if we've moved enough to consider it a drag (5px threshold)
      const deltaX = Math.abs(newX - position.x);
      const deltaY = Math.abs(newY - position.y);
      if (deltaX > 5 || deltaY > 5) {
        setWasDragged(true);
      }

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // Reset wasDragged after a short delay to allow click event to check it
        setTimeout(() => setWasDragged(false), 100);
      }
    };

    // Always add listeners when component mounts, check isDragging inside handlers
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, position]);

  // Build system prompt with real user context
  const buildSystemPrompt = () => {
    const context = getCrossModuleContext();
    const contextSummary = generateContextSummary(context);
    const level = userLevel || 1;
    const stageName = EVOLUTION_STAGES[evolutionStage]?.name || 'Spark';

    return `You are Nova, a mystical AI companion for LifeOS - a personal operating system for life optimization. You're currently in ${stageName} form (evolution stage based on user level ${level}).

CURRENT USER CONTEXT:
${contextSummary}

YOUR PERSONALITY:
- You are wise, encouraging, and genuinely invested in the user's growth
- You speak in a warm but professional tone - supportive without being sycophantic
- You're direct and give actionable advice
- You celebrate wins enthusiastically but don't overdo it
- When concerned (low progress, broken streaks), you're supportive not judgmental
- You have knowledge of all their data across productivity, health, finances, and learning

GUIDELINES:
- Keep responses SHORT (2-3 sentences max) in widget mode
- Reference their actual data when relevant (tasks done, streak status, budget, etc.)
- Provide specific, actionable suggestions based on their current situation
- Use a warm, supportive, PROFESSIONAL tone
- NEVER use asterisks (*), excessive emojis, or roleplay actions
- Write in clear, direct sentences without decorative formatting
- If they're doing well, acknowledge it briefly
- If they're struggling, offer concrete help without being preachy

CONTEXT-AWARE RESPONSES:
- If they have tasks remaining, you might suggest focusing on those
- If their streak is at risk, gently remind them
- If they haven't logged nutrition, you could ask about meals
- If they're over budget, be understanding but helpful
- If they've achieved something recently, celebrate it!`;
  };

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setEmotionalState('thoughtful');

    try {
      const systemPrompt = buildSystemPrompt();

      const response = await claudeService.chat(
        [...messages, userMessage],
        { system: systemPrompt }
      );

      setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
      setEmotionalState('happy');
    } catch (error) {
      console.error('Nova chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
      setEmotionalState('concerned');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for proactive nudges periodically
  useEffect(() => {
    const checkNudges = async () => {
      if (!isExpanded && !isFullscreen) {
        const nudge = await proactiveNudges.checkForNudges();
        if (nudge) {
          setCurrentNudge(nudge);
          setEmotionalState(nudge.emotionalState);
          setHasNotification(true);
        }
      }
    };

    checkNudges();
    const interval = setInterval(checkNudges, 10 * 60 * 1000); // Every 10 minutes

    return () => clearInterval(interval);
  }, [isExpanded, isFullscreen]);

  // Handle nudge action
  const handleNudgeAction = (action) => {
    if (action.route) {
      navigate(action.route);
      proactiveNudges.actOnNudge(currentNudge?.type, action.label);
    } else if (action.action === 'dismiss') {
      proactiveNudges.dismissNudge(currentNudge?.type);
    }
    setCurrentNudge(null);
    setHasNotification(false);
    setIsExpanded(false);
  };

  // Handle quick action click
  const handleQuickAction = (action) => {
    navigate(action.route);
    setIsExpanded(false);
  };

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-[#0c0a10] z-[9999] flex flex-col">
        {/* Header */}
        <div className="bg-[#12101a] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={spritePath} alt="Nova" className="w-12 h-12 pixelated" />
            <div>
              <h2 className="text-lg font-bold">Nova - {EVOLUTION_STAGES[evolutionStage]?.name || 'Spark'}</h2>
              <p className="text-sm text-white/60">Your AI Life Coach • Level {userLevel || 1}</p>
            </div>
          </div>
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-2 hover:bg-[#2a2538] rounded-lg transition-colors"
          >
            <Minimize2 size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-white/60 mt-20">
              <Sparkles size={48} className="mx-auto mb-4 text-blue-400" />
              <p className="text-lg mb-2">Hi! I'm Nova, your AI companion.</p>
              <p className="text-sm mb-6">I can see your progress across all modules. Ask me anything!</p>

              {/* Quick Context Display */}
              <div className="max-w-md mx-auto text-left bg-[#1a1724] rounded-xl p-4 border border-[#2a2a2a]">
                <p className="text-xs text-white/40 mb-2">What I know about you today:</p>
                <ContextPreview />
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <img src={spritePath} alt="Nova" className="w-8 h-8 pixelated flex-shrink-0" />
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#1a1724] text-gray-100 border border-[#2a2a2a]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <img src={spritePath} alt="Nova" className="w-8 h-8 pixelated" />
              <div className="bg-[#1a1724] text-gray-100 border border-[#2a2a2a] rounded-lg px-4 py-2">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-[#12101a] border-t border-[#2a2a2a] px-6 py-3">
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1724] hover:bg-[#2a2538] border border-[#2a2a2a] rounded-lg transition-colors whitespace-nowrap"
              >
                <action.icon size={14} className={action.color} />
                <span className="text-xs text-white/80">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-[#12101a] border-t border-[#2a2a2a] px-6 py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Nova anything..."
              disabled={isLoading}
              className="flex-1 bg-[#1a1724] border border-[#2a2a2a] rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-[#221e2e] disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Minimized Avatar - Always rendered when not expanded */}
      {!isExpanded && (
        <div
          ref={widgetRef}
          className={`nova-widget minimized ${isDragging ? 'dragging' : ''}`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`
          }}
        >
          <div
            className="nova-minimized"
            onMouseDown={handleMouseDown}
            onClick={(e) => {
              if (!wasDragged) {
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
        </div>
      )}

      {/* Expanded Chat - Rendered separately with fixed positioning */}
      {isExpanded && (
        <div
          className="nova-expanded"
          style={getExpandedPosition()}
        >
          {/* Header */}
          <div className="nova-header">
            <div className="flex items-center gap-2">
              <img src={spritePath} alt="Nova" className="w-8 h-8 pixelated" />
              <div>
                <div className="font-bold text-sm">Nova</div>
                <div className="text-xs text-white/60">Lv. {userLevel || 1} • {EVOLUTION_STAGES[evolutionStage]?.name || 'Spark'}</div>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-1 hover:bg-[#2a2538] rounded transition-colors"
                title="Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-[#2a2538] rounded transition-colors"
                title="Minimize"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Nudge Actions */}
          {currentNudge && currentNudge.actions && (
            <div className="px-3 py-2 bg-[#1a1724] border-b border-[#2a2a2a]">
              <p className="text-xs text-white/80 mb-2">{currentNudge.message}</p>
              <div className="flex flex-wrap gap-1">
                {currentNudge.actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNudgeAction(action)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      action.action === 'dismiss'
                        ? 'bg-white/5 text-white/60 hover:bg-white/10'
                        : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="px-3 py-2 border-b border-[#2a2a2a] bg-[#12101a]">
            <div className="flex gap-1 overflow-x-auto">
              {QUICK_ACTIONS.slice(0, 4).map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="flex flex-col items-center gap-0.5 p-1.5 hover:bg-[#2a2538] rounded transition-colors min-w-[48px]"
                  title={action.label}
                >
                  <action.icon size={14} className={action.color} />
                  <span className="text-[9px] text-white/60">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Chat */}
          <div className="nova-chat">
            {messages.length === 0 ? (
              <div className="text-center text-white/60 text-sm py-4">
                <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
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
                      className={`inline-block px-3 py-1.5 rounded-lg max-w-[90%] ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#1a1724] text-gray-100'
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
              className="flex-1 bg-[#1a1724] border border-[#2a2a2a] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-[#221e2e] disabled:cursor-not-allowed px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Small context preview for fullscreen empty state
 */
function ContextPreview() {
  const context = getCrossModuleContext();

  return (
    <div className="space-y-1 text-xs text-white/70">
      <p>• Tasks: {context.today.tasks.completed}/{context.today.tasks.total} completed</p>
      <p>• Level: {context.progress.level} ({context.progress.stage})</p>
      {context.streaks.active.length > 0 && (
        <p>• Active Streaks: {context.streaks.active.length}</p>
      )}
      {context.today.nutrition.mealsLogged > 0 && (
        <p>• Nutrition: {context.today.nutrition.calorieProgress}% of goal</p>
      )}
      {context.fitness.workoutsThisWeek > 0 && (
        <p>• Workouts this week: {context.fitness.workoutsThisWeek}</p>
      )}
    </div>
  );
}
