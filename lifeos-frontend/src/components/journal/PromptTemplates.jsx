import React, { useState } from 'react';
import { Lightbulb, Star, Heart, Target, Brain, Sunrise, Moon, Coffee } from 'lucide-react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import './PromptTemplates.css';

const PromptTemplates = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const categories = [
    { id: 'all', name: 'All Prompts', icon: Lightbulb },
    { id: 'daily', name: 'Daily Reflection', icon: Sunrise },
    { id: 'gratitude', name: 'Gratitude', icon: Heart },
    { id: 'goals', name: 'Goals & Growth', icon: Target },
    { id: 'self-discovery', name: 'Self-Discovery', icon: Brain },
    { id: 'creativity', name: 'Creativity', icon: Star },
    { id: 'mindfulness', name: 'Mindfulness', icon: Moon }
  ];

  const prompts = [
    // Daily Reflection
    {
      id: 1,
      category: 'daily',
      title: 'Daily Check-in',
      icon: '🌅',
      prompt: 'How are you feeling right now? What energy are you bringing to this day?',
      description: 'Start your day with awareness and intention'
    },
    {
      id: 2,
      category: 'daily',
      title: 'Evening Reflection',
      icon: '🌙',
      prompt: 'What went well today? What challenged you? What did you learn about yourself?',
      description: 'End your day with thoughtful reflection'
    },
    {
      id: 3,
      category: 'daily',
      title: 'Three Good Things',
      icon: '✨',
      prompt: 'Write about three good things that happened today, no matter how small. Why were they meaningful to you?',
      description: 'Focus on positive moments and their significance'
    },

    // Gratitude
    {
      id: 4,
      category: 'gratitude',
      title: 'Gratitude Practice',
      icon: '🙏',
      prompt: 'What are five things you\'re grateful for today? Include why each one matters to you.',
      description: 'Cultivate appreciation for life\'s blessings'
    },
    {
      id: 5,
      category: 'gratitude',
      title: 'People Appreciation',
      icon: '👥',
      prompt: 'Think of someone who made a positive impact on you recently. What did they do and how did it affect you?',
      description: 'Acknowledge the positive influence of others'
    },
    {
      id: 6,
      category: 'gratitude',
      title: 'Simple Pleasures',
      icon: '☕',
      prompt: 'What simple pleasure brought you joy today? Describe the experience using all your senses.',
      description: 'Appreciate life\'s small delights'
    },

    // Goals & Growth
    {
      id: 7,
      category: 'goals',
      title: 'Progress Check',
      icon: '📈',
      prompt: 'What progress have you made toward your goals this week? What obstacles did you overcome?',
      description: 'Track your journey and celebrate growth'
    },
    {
      id: 8,
      category: 'goals',
      title: 'Learning Reflection',
      icon: '📚',
      prompt: 'What new skill or knowledge did you gain recently? How will you apply it in your life?',
      description: 'Reflect on continuous learning and development'
    },
    {
      id: 9,
      category: 'goals',
      title: 'Future Self',
      icon: '🔮',
      prompt: 'Imagine yourself one year from now. What does your life look like? What steps can you take today to get there?',
      description: 'Visualize your future and plan your path'
    },

    // Self-Discovery
    {
      id: 10,
      category: 'self-discovery',
      title: 'Values Exploration',
      icon: '🧭',
      prompt: 'What values are most important to you right now? How are you living these values in your daily life?',
      description: 'Explore your core beliefs and principles'
    },
    {
      id: 11,
      category: 'self-discovery',
      title: 'Strengths & Talents',
      icon: '💪',
      prompt: 'What are your unique strengths and talents? How did you discover them, and how do you use them?',
      description: 'Recognize and celebrate your capabilities'
    },
    {
      id: 12,
      category: 'self-discovery',
      title: 'Comfort Zone',
      icon: '🚀',
      prompt: 'When did you last step outside your comfort zone? What did you learn from that experience?',
      description: 'Reflect on growth through challenge'
    },

    // Creativity
    {
      id: 13,
      category: 'creativity',
      title: 'Creative Expression',
      icon: '🎨',
      prompt: 'How did you express creativity today? What inspires your creative side?',
      description: 'Explore your artistic and innovative nature'
    },
    {
      id: 14,
      category: 'creativity',
      title: 'Problem Solving',
      icon: '🧩',
      prompt: 'Describe a problem you solved recently. What creative approach did you take?',
      description: 'Appreciate your innovative thinking'
    },
    {
      id: 15,
      category: 'creativity',
      title: 'Dream Journal',
      icon: '💭',
      prompt: 'Describe a recent dream. What symbols or themes appeared? What might they represent?',
      description: 'Explore your subconscious creativity'
    },

    // Mindfulness
    {
      id: 16,
      category: 'mindfulness',
      title: 'Present Moment',
      icon: '🧘',
      prompt: 'Right now, what do you notice about your surroundings? How does your body feel? What thoughts are passing through your mind?',
      description: 'Practice awareness of the present moment'
    },
    {
      id: 17,
      category: 'mindfulness',
      title: 'Emotional Check-in',
      icon: '💭',
      prompt: 'What emotions are you experiencing right now? Where do you feel them in your body? What might they be telling you?',
      description: 'Develop emotional awareness and intelligence'
    },
    {
      id: 18,
      category: 'mindfulness',
      title: 'Breathing Space',
      icon: '🌬️',
      prompt: 'Take five deep breaths. With each exhale, what are you releasing? With each inhale, what are you welcoming?',
      description: 'Use breath as a gateway to mindfulness'
    }
  ];

  const filteredPrompts = selectedCategory === 'all'
    ? prompts
    : prompts.filter(prompt => prompt.category === selectedCategory);

  const usePrompt = (prompt) => {
    setSelectedPrompt(prompt);
  };

  const startWriting = () => {
    // In a real app, this would navigate to the editor with the prompt pre-filled
    console.log('Starting to write with prompt:', selectedPrompt);
    alert(`Starting new journal entry with prompt: "${selectedPrompt.title}"`);
  };

  return (
    <div className="prompt-templates">
      {/* Category Navigation */}
      <Card title="Writing Prompts" className="prompts-nav-card">
        <div className="category-nav">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <Icon size={16} />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Prompts Grid */}
      <div className="prompts-grid">
        {filteredPrompts.map(prompt => (
          <Card key={prompt.id} className="prompt-card">
            <div className="prompt-header">
              <div className="prompt-icon">{prompt.icon}</div>
              <h3 className="prompt-title">{prompt.title}</h3>
            </div>
            
            <div className="prompt-content">
              <p className="prompt-description">{prompt.description}</p>
              <blockquote className="prompt-text">
                "{prompt.prompt}"
              </blockquote>
            </div>
            
            <div className="prompt-actions">
              <Button
                variant="ghost"
                size="small"
                onClick={() => usePrompt(prompt)}
              >
                Preview
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={() => {
                  setSelectedPrompt(prompt);
                  startWriting();
                }}
              >
                Use This Prompt
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Prompt Preview Modal */}
      {selectedPrompt && (
        <div className="prompt-modal-overlay" onClick={() => setSelectedPrompt(null)}>
          <div className="prompt-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">{selectedPrompt.icon}</span>
                <h3>{selectedPrompt.title}</h3>
              </div>
              <button
                className="close-button"
                onClick={() => setSelectedPrompt(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <p className="modal-description">{selectedPrompt.description}</p>
              <blockquote className="modal-prompt">
                "{selectedPrompt.prompt}"
              </blockquote>
              
              <div className="modal-tips">
                <h4>Writing Tips:</h4>
                <ul>
                  <li>Write freely without worrying about grammar or structure</li>
                  <li>Be honest and authentic in your responses</li>
                  <li>Take your time to really think about the question</li>
                  <li>There are no right or wrong answers</li>
                </ul>
              </div>
            </div>
            
            <div className="modal-actions">
              <Button
                variant="ghost"
                onClick={() => setSelectedPrompt(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={startWriting}
              >
                Start Writing
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Inspiration */}
      <Card title="Daily Inspiration" className="inspiration-card">
        <div className="inspiration-content">
          <div className="inspiration-quote">
            <blockquote>
              "The diary taught me that it is in the fleeting moment we must capture the fleeting moment and live and love fully."
            </blockquote>
            <cite>— Anaïs Nin</cite>
          </div>
          
          <div className="inspiration-tip">
            <h4>💡 Today's Tip</h4>
            <p>Try writing for just 5 minutes without stopping. Let your thoughts flow freely onto the page.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PromptTemplates;