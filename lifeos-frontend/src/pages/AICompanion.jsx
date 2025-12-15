import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, User, Bot, MessageCircle } from 'lucide-react';
import { claudeService } from '../services/ai/claudeService';
import PageHeader from '../components/shared/PageHeader';

/**
 * AI Companion Chat Interface
 *
 * Features:
 * - Real-time chat with Claude AI
 * - Streaming responses for better UX
 * - System knowledge about LifeOS
 * - Message history
 */

export default function AICompanion() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hey! I\'m your LifeOS AI companion. I understand the entire system—all modules, features, and where everything is. I can help you navigate, answer questions about your data, and provide personalized life coaching. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    try {
      // Build system prompt with LifeOS knowledge
      const systemPrompt = `You are an AI life coach integrated into LifeOS, a comprehensive personal operating system.

SYSTEM KNOWLEDGE:
LifeOS has 11 core modules:
1. Dashboard (/) - Central hub with momentum indicators, module health, active quests
2. Modules (/modules) - Overview of all modules
3. Character (/character) - Avatar customization, equipment, skill trees
4. Social (/social) - Guilds, leaderboards, friends, challenges
5. Quests (/quests) - Active missions and rewards
6. Productivity (/productivity) - Tasks, deep work, time tracking
7. Health (/health) - Workouts, nutrition, sleep, recovery
8. Knowledge (/knowledge) - Books, podcasts, learning progress
9. Journal (/journal, /journal/write) - Reflections and mood tracking
10. Calendar (/calendar) - Time blocking and scheduling
11. Skills (/skills) - Skill progression tracking
12. Financial (/financial) - Income, expenses, net worth

QUICK ACTIONS:
- Log workout → /health
- Add task → /productivity
- Write journal → /journal/write
- Track time → /calendar
- Join guild → /social (Guilds tab)
- Check leaderboard → /social (Leaderboards tab)

GAMIFICATION:
- XP and leveling system
- Streaks (workout, journal, productivity)
- Equipment and avatar customization
- Credits as currency
- Skill trees for progression

Your role:
- Help users navigate LifeOS ("Where do I log workouts?" → "Go to /health or use the 'Log Workout' quick action on the Dashboard")
- Explain features and modules
- Provide life coaching and motivation
- Answer questions about the system

Be concise, friendly, and helpful. Use emojis sparingly. Always provide specific routes when directing users to features.`;

      // Prepare messages for Claude (only user/assistant, no system in messages array)
      const chatMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      chatMessages.push({
        role: 'user',
        content: userMessage.content
      });

      // Stream response from Claude
      let fullResponse = '';
      await claudeService.streamChat(
        chatMessages,
        (chunk) => {
          fullResponse += chunk;
          setStreamingText(fullResponse);
        },
        {
          system: systemPrompt,
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048
        }
      );

      // Add complete assistant message
      const assistantMessage = {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingText('');
    } catch (error) {
      console.error('Chat error:', error);

      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: `❌ Sorry, I encountered an error: ${error.message}. Please make sure your API key is configured correctly in the .env file.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setStreamingText('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0a10] text-white">
      {/* Header */}
      <div className="border-b border-[#2a2a2a] bg-[#12101a] px-6 py-4">
        <PageHeader
          title="AI Companion"
          subtitle="Your personal LifeOS assistant"
          icon={MessageCircle}
          module="knowledge"
          variant="elevated"
          className="mb-0"
        />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
            )}

            <div
              className={`max-w-[80%] md:max-w-[60%] rounded-lg px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1a1724] text-gray-100 border border-[#2a2a2a]'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              <p className="text-xs mt-2 opacity-50">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[#221e2e] flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Streaming message */}
        {streamingText && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="max-w-[80%] md:max-w-[60%] rounded-lg px-4 py-3 bg-[#1a1724] text-gray-100 border border-[#2a2a2a]">
              <p className="whitespace-pre-wrap break-words">{streamingText}</p>
              <div className="flex items-center gap-1 mt-2">
                <Loader2 size={12} className="animate-spin text-blue-400" />
                <span className="text-xs text-blue-400">Typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[#2a2a2a] bg-[#12101a] px-4 py-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about LifeOS..."
            disabled={isLoading}
            className="flex-1 bg-[#1a1724] text-white border border-[#2a2a2a] rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-[#221e2e] disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 font-medium transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <p className="text-xs text-white/50 text-center mt-2">
          Powered by Claude 3.5 Sonnet
        </p>
      </div>
    </div>
  );
}
