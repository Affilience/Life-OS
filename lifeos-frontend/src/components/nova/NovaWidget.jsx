import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Maximize2,
  Sparkles,
  MessageCircle,
  CheckSquare,
  Dumbbell,
  BookOpen,
  Wallet,
  Calendar,
  Target,
  RotateCcw
} from 'lucide-react';
// NEW: Unified Nova Service with all AI capabilities
import novaService from '../../services/ai/nova/novaService';
import { novaConversationService } from '../../services/ai/novaConversationService';
import { getCrossModuleContext } from '../../services/ai/crossModuleData';
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
  // Use a function to calculate initial position only once
  const [position, setPosition] = useState(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const bottomOffset = isMobile ? 100 : 20;
    return {
      x: typeof window !== 'undefined' ? window.innerWidth - 100 : 100,
      y: typeof window !== 'undefined' ? window.innerHeight - bottomOffset - 80 : 100
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [wasDragged, setWasDragged] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [expandedPosition, setExpandedPosition] = useState(null); // Position when dragged while expanded
  const [emotionalState, setEmotionalState] = useState('happy');
  const [hasNotification, setHasNotification] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentNudge, setCurrentNudge] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const widgetRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Track if we've started a new conversation (to prevent re-loading old messages)
  const [isNewConversation, setIsNewConversation] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Detect mobile keyboard open/close using visualViewport API
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleResize = () => {
      // If viewport height shrinks significantly, keyboard is likely open
      const keyboardOpen = window.visualViewport.height < window.innerHeight * 0.75;
      setIsKeyboardOpen(keyboardOpen);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport.removeEventListener('resize', handleResize);
  }, []);

  // Handle input focus - scroll into view on mobile
  const handleInputFocus = () => {
    if (window.innerWidth <= 768) {
      // Small delay to let keyboard open
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  // Load conversation history on mount
  useEffect(() => {
    const loadHistory = async () => {
      // Don't load history if user explicitly started a new conversation
      if (isNewConversation) {
        setIsLoadingHistory(false);
        return;
      }
      try {
        const previousMessages = await novaConversationService.loadRecentMessages(10);
        if (previousMessages.length > 0) {
          setMessages(previousMessages);
        }
      } catch (error) {
        console.warn('Failed to load conversation history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, [isNewConversation]);

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

  // Calculate expanded view position based on avatar position or dragged position
  const getExpandedPosition = () => {
    // If user has dragged the expanded chat, use that position
    if (expandedPosition) {
      return {
        left: `${expandedPosition.x}px`,
        top: `${expandedPosition.y}px`,
        bottom: 'auto',
        right: 'auto',
      };
    }

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

  // Handle dragging for minimized avatar (mouse)
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

  // Track touch start position to distinguish tap from drag
  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchStartTime = useRef(0);

  // Handle dragging for minimized avatar (touch)
  const handleTouchStart = (e) => {
    if (isExpanded || isFullscreen) return;
    const touch = e.touches[0];

    // Store touch start position and time
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    touchStartTime.current = Date.now();

    setIsDragging(true);
    setWasDragged(false);
    setDragOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  // Handle touch end - detect tap vs drag
  const handleTouchEnd = (e) => {
    if (!isDragging) return;

    const touchDuration = Date.now() - touchStartTime.current;
    const wasTap = !wasDragged && touchDuration < 300;

    setIsDragging(false);

    // If it was a quick tap (not a drag), expand the widget
    if (wasTap && !isExpanded && !isFullscreen) {
      e.preventDefault(); // Prevent click event from also firing
      setIsExpanded(true);
      setHasNotification(false);
    }

    // Reset wasDragged after a delay
    setTimeout(() => setWasDragged(false), 100);
  };

  useEffect(() => {
    // Shared logic for handling move (both mouse and touch)
    const handleMove = (clientX, clientY) => {
      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;

      // Different constraints for expanded vs minimized
      if (isExpanded) {
        // Dragging the expanded chatbox
        const isMobile = window.innerWidth <= 768;
        const chatWidth = isMobile ? Math.min(window.innerWidth - 32, 400) : 400;
        const chatHeight = isMobile ? 380 : 480;
        const padding = 16;
        const bottomNavHeight = isMobile ? 80 : 0;

        const constrainedX = Math.max(padding, Math.min(newX, window.innerWidth - chatWidth - padding));
        const constrainedY = Math.max(padding, Math.min(newY, window.innerHeight - chatHeight - padding - bottomNavHeight));

        setExpandedPosition({
          x: constrainedX,
          y: constrainedY
        });
      } else {
        // Dragging the minimized avatar
        const maxX = window.innerWidth - 100;
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
      }
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        // Reset wasDragged after a short delay to allow click event to check it
        setTimeout(() => setWasDragged(false), 100);
      }
    };

    // Always add listeners when component mounts, check isDragging inside handlers
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset, position, isExpanded, handleTouchEnd]);

  // Initialize Nova and get current stage/emotional state
  useEffect(() => {
    // Get Nova's current stage based on user level
    const stage = novaService.getStage();
    console.log(`Nova initialized: ${stage.name} (Level ${userLevel || 1})`);

    // Detect initial emotional state based on user context
    const emotionalData = novaService.getEmotionalState();
    if (emotionalData.primary === 'thriving' || emotionalData.primary === 'positive') {
      setEmotionalState('excited');
    } else if (emotionalData.primary === 'struggling' || emotionalData.primary === 'stressed') {
      setEmotionalState('concerned');
    }

    // Check for proactive message on mount
    const proactive = novaService.getProactiveMessage();
    if (proactive.type === 'urgent') {
      setCurrentNudge({
        type: proactive.type,
        message: proactive.message,
        title: proactive.title,
        emotionalState: 'concerned',
        actions: proactive.action ? [
          { label: proactive.action.label, route: proactive.action.route },
          { label: 'Later', action: 'dismiss' }
        ] : null
      });
      setHasNotification(true);
      setEmotionalState('concerned');
    } else if (proactive.type === 'celebration') {
      setCurrentNudge({
        type: proactive.type,
        message: proactive.message,
        title: proactive.title,
        emotionalState: 'excited'
      });
      setHasNotification(true);
      setEmotionalState('excited');
    }
  }, [userLevel]);

  // Ref for streaming message
  const streamingMessageRef = useRef('');

  // Handle send message with streaming for faster perceived response
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setEmotionalState('thoughtful');

    // Save user message to database (async)
    novaConversationService.saveMessage('user', userMessage.content).catch(err =>
      console.warn('Failed to save user message:', err)
    );

    try {
      // Build comprehensive system prompt using novaService
      // This includes: user profile, patterns, correlations, insights, personality
      const systemPrompt = novaService.buildSystemPrompt({
        mode: isFullscreen ? 'comprehensive' : 'standard',
        includeInsights: true,
        includeCorrelations: isFullscreen, // Only full correlations in fullscreen
        includePersonality: true,
        userQuery: userMessage.content,
      });

      // Record the interaction for learning (background)
      novaService.recordInteraction('message_sent', { content: userMessage.content });

      // Add placeholder for streaming message
      streamingMessageRef.current = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

      // Clean messages for API
      const cleanMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Use novaService.chat with streaming callback
      const result = await novaService.chat(userMessage.content, {
        mode: isFullscreen ? 'comprehensive' : 'standard',
        stream: true,
        conversationHistory: cleanMessages.slice(0, -1), // Exclude the message we just added
        onStream: (chunk) => {
          streamingMessageRef.current += chunk;
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.isStreaming) {
              updated[lastIdx] = { role: 'assistant', content: streamingMessageRef.current, isStreaming: true };
            }
            return updated;
          });
        }
      });

      // Finalize the message
      const finalContent = result.content || streamingMessageRef.current;
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.isStreaming) {
          updated[lastIdx] = { role: 'assistant', content: finalContent };
        }
        return updated;
      });

      // Update emotional state based on response success
      const emotionalData = novaService.getEmotionalState();
      if (emotionalData.primary === 'thriving') {
        setEmotionalState('proud');
      } else if (emotionalData.primary === 'positive') {
        setEmotionalState('happy');
      } else {
        setEmotionalState('encouraging');
      }

      // Save assistant message to database (async)
      novaConversationService.saveMessage('assistant', finalContent).catch(err =>
        console.warn('Failed to save assistant message:', err)
      );

      // Record successful interaction
      novaService.recordInteraction('significant_event', {
        eventType: 'conversation_turn',
        description: `User asked: ${userMessage.content.substring(0, 100)}`,
        importance: 1
      });

    } catch (error) {
      console.error('Nova chat error:', error);

      // Remove streaming message if there was an error
      setMessages(prev => prev.filter(m => !m.isStreaming));

      // Provide helpful error message
      let errorMessage = "Sorry, I encountered an error. ";
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        errorMessage += "The Nova chat service isn't deployed yet. Deploy nova-chat-v2 to Supabase.";
      } else if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        errorMessage += "There's an authentication issue. Check your Supabase keys.";
      } else if (error.message?.includes('500')) {
        errorMessage += "Server error. Check if ANTHROPIC_API_KEY is set in Supabase secrets.";
      } else {
        errorMessage += "Please try again in a moment.";
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
      setEmotionalState('concerned');
    } finally {
      setIsLoading(false);
      streamingMessageRef.current = '';
    }
  };

  // Start a new conversation
  const handleNewConversation = () => {
    novaConversationService.startNewConversation();
    setMessages([]);
    setEmotionalState('happy');
    setIsNewConversation(true);
  };

  // Close the expanded chat and reset position
  const closeExpandedChat = () => {
    setIsExpanded(false);
    setExpandedPosition(null); // Reset so it opens near avatar next time
  };

  // Check for proactive insights periodically
  useEffect(() => {
    const checkInsights = () => {
      if (!isExpanded && !isFullscreen) {
        // Get urgent insights first
        const urgentInsights = novaService.getUrgent();

        if (urgentInsights.length > 0) {
          const insight = urgentInsights[0];
          setCurrentNudge({
            type: insight.type,
            message: insight.message,
            title: insight.title,
            emotionalState: insight.priority <= 2 ? 'concerned' : 'encouraging',
            actions: insight.action ? [
              { label: insight.action.label, route: insight.action.route },
              { label: 'Later', action: 'dismiss' }
            ] : [{ label: 'Got it', action: 'dismiss' }]
          });
          setEmotionalState(insight.priority <= 2 ? 'concerned' : 'encouraging');
          setHasNotification(true);
        } else {
          // Check for celebrations or suggestions
          const proactive = novaService.getProactiveMessage();
          if (proactive.type === 'celebration') {
            setCurrentNudge({
              type: 'celebration',
              message: proactive.message,
              title: proactive.title,
              emotionalState: 'excited'
            });
            setHasNotification(true);
            setEmotionalState('excited');
          }
        }
      }
    };

    // Check on mount (with delay to let data load)
    const initialCheck = setTimeout(checkInsights, 2000);

    // Check every 5 minutes
    const interval = setInterval(checkInsights, 5 * 60 * 1000);

    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, [isExpanded, isFullscreen]);

  // Handle nudge action
  const handleNudgeAction = (action) => {
    if (action.route) {
      navigate(action.route);
      // Record the interaction for learning
      novaService.recordInteraction('nudge_acted', {
        nudgeType: currentNudge?.type,
        action: action.label
      });
    } else if (action.action === 'dismiss') {
      // Record dismissed nudge
      novaService.recordInteraction('nudge_dismissed', {
        nudgeType: currentNudge?.type
      });
    }
    setCurrentNudge(null);
    setHasNotification(false);
    closeExpandedChat();
  };

  // Handle quick action click
  const handleQuickAction = (action) => {
    navigate(action.route);
    closeExpandedChat();
  };

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-bg-0 z-[9999] flex flex-col">
        {/* Header */}
        <div className="bg-bg-elevated border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={spritePath} alt="Nova" className="w-12 h-12 pixelated" />
            <div>
              <h2 className="text-lg font-bold">Nova - {EVOLUTION_STAGES[evolutionStage]?.name || 'Spark'}</h2>
              <p className="text-sm text-text-muted">Your AI Life Coach • Level {userLevel || 1}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleNewConversation}
              className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-secondary hover:text-white"
              title="New conversation"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-bg-hover rounded-lg transition-colors text-text-secondary hover:text-white"
              title="Close fullscreen"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-text-muted mt-20">
              <Sparkles size={48} className="mx-auto mb-4 text-blue-400" />
              <p className="text-lg mb-2">Hi! I'm Nova, your AI companion.</p>
              <p className="text-sm mb-6">I can see your progress across all modules. Ask me anything!</p>

              {/* Quick Context Display */}
              <div className="max-w-md mx-auto text-left bg-bg-1 rounded-xl p-4 border border-border">
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
                        ? 'bg-primary-500 text-white'
                        : 'bg-bg-1 text-gray-100 border border-border'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
          {isLoading && !messages.some(m => m.isStreaming) && (
            <div className="flex gap-3 justify-start">
              <img src={spritePath} alt="Nova" className="w-8 h-8 pixelated" />
              <div className="bg-bg-1 text-gray-100 border border-border rounded-lg px-4 py-2">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-bg-elevated border-t border-border px-6 py-3">
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="flex items-center gap-2 px-3 py-1.5 bg-bg-1 hover:bg-bg-hover border border-border rounded-lg transition-colors whitespace-nowrap"
              >
                <action.icon size={14} className={action.color} />
                <span className="text-xs text-text-secondary">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-bg-elevated border-t border-border px-6 py-4 pb-safe">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              onFocus={handleInputFocus}
              placeholder="Ask Nova anything..."
              disabled={isLoading}
              className="flex-1 bg-bg-1 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-bg-2 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors"
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
            onTouchStart={handleTouchStart}
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

      {/* Backdrop overlay - click to close */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={closeExpandedChat}
        />
      )}

      {/* Expanded Chat - Rendered separately with fixed positioning */}
      {isExpanded && (
        <div
          className={`nova-expanded ${isKeyboardOpen ? 'keyboard-open' : ''}`}
          style={getExpandedPosition()}
        >
          {/* Header - Draggable */}
          <div
            className="nova-header cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              // Don't drag if clicking on buttons
              if (e.target.closest('button')) return;
              e.preventDefault();
              setIsDragging(true);
              const rect = e.currentTarget.closest('.nova-expanded').getBoundingClientRect();
              setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              });
            }}
            onTouchStart={(e) => {
              // Don't drag if touching on buttons
              if (e.target.closest('button')) return;
              const touch = e.touches[0];
              setIsDragging(true);
              const rect = e.currentTarget.closest('.nova-expanded').getBoundingClientRect();
              setDragOffset({
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
              });
            }}
          >
            <div className="flex items-center gap-2">
              <img src={spritePath} alt="Nova" className="w-8 h-8 pixelated" />
              <div>
                <div className="font-bold text-sm">Nova</div>
                <div className="text-xs text-text-muted">Lv. {userLevel || 1} • {EVOLUTION_STAGES[evolutionStage]?.name || 'Spark'}</div>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleNewConversation}
                className="p-1 hover:bg-bg-hover rounded transition-colors text-text-secondary hover:text-white"
                title="New conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-1 hover:bg-bg-hover rounded transition-colors text-text-secondary hover:text-white"
                title="Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={closeExpandedChat}
                className="p-1 hover:bg-bg-hover rounded transition-colors text-text-secondary hover:text-white"
                title="Minimise"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Nudge Actions */}
          {currentNudge && currentNudge.actions && (
            <div className="px-3 py-2 bg-bg-1 border-b border-border">
              <p className="text-xs text-text-secondary mb-2">{currentNudge.message}</p>
              <div className="flex flex-wrap gap-1">
                {currentNudge.actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNudgeAction(action)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      action.action === 'dismiss'
                        ? 'bg-white/5 text-text-muted hover:bg-white/10'
                        : 'bg-primary-500/20 text-blue-400 hover:bg-primary-500/30'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="px-3 py-2 border-b border-border bg-bg-elevated">
            <div className="flex gap-1 overflow-x-auto">
              {QUICK_ACTIONS.slice(0, 4).map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="flex flex-col items-center gap-0.5 p-1.5 hover:bg-bg-hover rounded transition-colors min-w-[48px]"
                  title={action.label}
                >
                  <action.icon size={14} className={action.color} />
                  <span className="text-[9px] text-text-muted">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Chat */}
          <div className="nova-chat">
            {messages.length === 0 ? (
              <div className="text-center text-text-muted text-sm py-4">
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
                      className={`inline-block px-3 py-1.5 rounded-lg max-w-[80%] break-words ${
                        msg.role === 'user'
                          ? 'bg-primary-500 text-white'
                          : 'bg-bg-1 text-gray-100'
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
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              onFocus={handleInputFocus}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 bg-bg-1 border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-bg-2 disabled:cursor-not-allowed px-3 py-1.5 rounded text-sm font-medium transition-colors"
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
 * Uses novaService for rich explanations
 */
function ContextPreview() {
  const context = getCrossModuleContext();
  const stage = novaService.getStage();
  const insights = novaService.getInsights();

  // Get top 2 insights for preview
  const topInsights = insights.slice(0, 2);

  return (
    <div className="space-y-2 text-xs text-text-secondary">
      {/* Level with explanation */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{stage.avatar}</span>
        <div>
          <p className="text-white font-medium">Level {context.progress?.level || 1} {stage.name}</p>
          <p className="text-text-muted">{novaService.explain('level', context.progress?.level || 1)}</p>
        </div>
      </div>

      {/* Tasks */}
      <p>• Tasks: {context.today?.tasks?.completed || 0}/{context.today?.tasks?.total || 0} completed</p>

      {/* Streaks */}
      {context.streaks?.active?.length > 0 && (
        <p>• Active Streaks: {context.streaks.active.length} ({context.streaks.active.slice(0, 2).map(s => s.name).join(', ')})</p>
      )}

      {/* Nutrition */}
      {context.today?.nutrition?.mealsLogged > 0 && (
        <p>• Nutrition: {context.today.nutrition.calorieProgress}% of goal</p>
      )}

      {/* Workouts */}
      {context.fitness?.workoutsThisWeek > 0 && (
        <p>• Workouts this week: {context.fitness.workoutsThisWeek}</p>
      )}

      {/* Proactive Insights */}
      {topInsights.length > 0 && (
        <div className="mt-3 pt-2 border-t border-border">
          <p className="text-white/40 mb-1">Nova's observations:</p>
          {topInsights.map((insight, idx) => (
            <p key={idx} className={`text-xs ${insight.celebratory ? 'text-green-400' : 'text-yellow-400'}`}>
              {insight.celebratory ? '✨' : '💡'} {insight.title}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
