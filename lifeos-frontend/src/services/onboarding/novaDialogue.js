/**
 * Nova Dialogue System
 *
 * Manages Nova's conversational messages during onboarding.
 * Provides contextual, personality-driven dialogue.
 */

// Dialogue trees for different onboarding contexts
export const DIALOGUE = {
  welcome: {
    initial: "Hi there! I'm Nova, your personal AI companion.",
    followUp: "I'm here to help you build the life you want. Ready to get started?",
    returning: "Welcome back! Let's pick up where we left off.",
    reactions: {
      excited: "Let's do this! I'm so excited to start this journey with you!",
      curious: "Tell me more about what you're hoping to achieve...",
      supportive: "No pressure! We can go at whatever pace feels right for you."
    }
  },

  goals: {
    prompt: "What matters most to you right now? Pick your top priorities.",
    selected: {
      single: "Perfect choice! Let's make it happen.",
      multiple: "Great picks! I love your ambition.",
      all: "Wow, you're going all in! I admire that."
    },
    specific: {
      productivity: "Getting things done is so satisfying. I'll help you stay focused!",
      health: "Your health is your greatest asset. Let's build healthy habits together!",
      learning: "A curious mind is a powerful thing. Let's grow together!",
      financial: "Smart thinking! Financial peace of mind is life-changing.",
      journal: "Reflection is powerful. I'll be here to listen.",
      habits: "Consistency is the secret to success. Let's build your streaks!",
      balance: "Finding balance is an art. Let's design your ideal life."
    }
  },

  quickWin: {
    productivity: {
      prompt: "What's ONE thing you want to accomplish today?",
      success: "Your first task is logged! You're officially on your way. ✨",
      suggestions: ["Morning routine", "Exercise", "Read for 30 min", "Work on project"]
    },
    health: {
      prompt: "What's one healthy choice you'll make today?",
      success: "Love it! Small choices add up to big changes.",
      suggestions: ["Drink 8 glasses of water", "Take a walk", "Eat vegetables", "Stretch"]
    },
    financial: {
      prompt: "What's one financial goal you're working toward?",
      success: "Now that's a goal worth tracking!",
      suggestions: ["Save $100", "Track spending", "Pay off a bill", "Start a budget"]
    },
    learning: {
      prompt: "What's one skill you'd love to improve?",
      success: "Exciting! Every expert was once a beginner.",
      suggestions: ["Coding", "Language", "Music", "Writing", "Public speaking"]
    },
    journal: {
      prompt: "How are you feeling right now, in one word?",
      success: "Thank you for sharing that with me.",
      suggestions: ["Hopeful", "Tired", "Excited", "Stressed", "Grateful", "Curious"]
    },
    default: {
      prompt: "What's one thing you'd like to accomplish this week?",
      success: "Perfect! Your first goal is set. Let's make it happen!",
      suggestions: ["Be more organized", "Feel healthier", "Learn something new", "Save money"]
    }
  },

  moduleSetup: {
    transition: (module) => `Let's set up ${formatModuleName(module)}!`,
    health: {
      intro: "Let's get your health tracking set up!",
      questions: {
        goal: "What's your primary health goal?",
        weight: "What's your current weight? (This helps calculate calories)",
        activity: "How active are you on a typical day?",
        calories: "Based on your goals, I recommend this daily target:"
      },
      encouragement: "You're taking control of your health. That's huge!",
      complete: "Your health tracking is ready! Let's crush those goals."
    },
    financial: {
      intro: "Let's take control of your finances! Don't worry, I won't judge. 💚",
      questions: {
        goal: "What's your main financial goal?",
        income: "What's your approximate monthly income?",
        savings: "How much would you like to save each month?"
      },
      encouragement: "Financial awareness is the first step to financial freedom.",
      complete: "Your budget is set! Time to watch that money grow."
    },
    productivity: {
      intro: "Let's boost your productivity!",
      questions: {
        challenge: "What's your biggest productivity challenge?",
        priorities: "What are your top 3 priorities this week?"
      },
      encouragement: "Getting organized is a superpower. You've got this!",
      complete: "Your productivity system is ready to go!"
    },
    journal: {
      intro: "Journaling is powerful! Let me set this up for you.",
      questions: {
        frequency: "How often would you like to journal?",
        topics: "What would you like to reflect on?"
      },
      encouragement: "Taking time for reflection is self-care.",
      complete: "Your journal is ready. I'm here whenever you want to write."
    },
    skills: {
      intro: "Exciting! Let's track your skill development.",
      questions: {
        category: "What type of skills interest you most?",
        level: "What's your current level?",
        time: "How much time can you dedicate weekly?"
      },
      encouragement: "Every master was once a beginner!",
      complete: "Your skills tracker is set! Time to level up."
    },
    calendar: {
      intro: "Let's get your schedule organized!",
      questions: {
        connect: "Want to connect your existing calendar?",
        productivity: "When are you most productive?"
      },
      encouragement: "A well-planned day is a well-lived day.",
      complete: "Your calendar is ready to help you manage time!"
    },
    knowledge: {
      intro: "Let's organise your learning journey!",
      questions: {
        interests: "What topics interest you most?",
        format: "How do you prefer to learn?"
      },
      encouragement: "Knowledge is the one thing no one can take from you.",
      complete: "Your knowledge base is ready to grow!"
    },
    missions: {
      intro: "Let's set up your habits and goals!",
      questions: {
        focus: "What habit would you most like to build?",
        frequency: "How often do you want to track it?"
      },
      encouragement: "Small daily improvements lead to stunning results.",
      complete: "Your missions are locked and loaded!"
    },
    purpose: {
      intro: "Let's explore what matters most to you.",
      questions: {
        values: "What values guide your decisions?",
        vision: "Where do you see yourself in 5 years?"
      },
      encouragement: "Knowing your 'why' makes everything easier.",
      complete: "Your purpose compass is set!"
    }
  },

  dashboardReveal: {
    intro: "Welcome to YOUR LifeOS!",
    explanation: "This is your dashboard - everything in one place. I've personalized it based on what matters to you.",
    closing: "I'll be right here whenever you need me. Just tap my icon anytime!",
    celebration: "Look at you! You're all set up and ready to take on the world! 🎉"
  },

  encouragement: {
    skip: "No worries! We can always set this up later.",
    hesitation: "Take your time. There's no rush here.",
    return: "Welcome back! Ready to continue?",
    stuck: "Need help? I'm here for you!",
    progress: "You're doing amazing! Keep it up!"
  },

  celebrations: {
    firstTask: "You did it! Your first task is logged. This is just the beginning! ✨",
    firstGoal: "Your first goal is set! I believe in you.",
    moduleComplete: "Another module ready! You're making amazing progress!",
    halfwayThere: "Halfway there! You're crushing this!",
    almostDone: "So close! Just one more step!",
    onboardingComplete: "🎉 You're officially ready! Let's build the life you want together!"
  }
};

// Helper function to format module names
function formatModuleName(module) {
  const names = {
    health: 'Health & Fitness',
    financial: 'Financial Tracking',
    productivity: 'Productivity',
    journal: 'Journal',
    skills: 'Skills',
    calendar: 'Calendar',
    knowledge: 'Knowledge',
    missions: 'Missions & Habits',
    purpose: 'Purpose & Values'
  };
  return names[module] || module.charAt(0).toUpperCase() + module.slice(1);
}

/**
 * Get Nova dialogue for a specific context
 */
export function getNovaDialogue(context, subContext = null, data = {}) {
  const contextDialogue = DIALOGUE[context];
  if (!contextDialogue) return '';

  if (subContext && contextDialogue[subContext]) {
    const sub = contextDialogue[subContext];
    if (typeof sub === 'string') return sub;
    if (typeof sub === 'function') return sub(data);
    return sub;
  }

  return contextDialogue.initial || contextDialogue.intro || '';
}

/**
 * Get quick win config based on primary goal
 */
export function getQuickWinConfig(primaryGoal) {
  const config = DIALOGUE.quickWin[primaryGoal] || DIALOGUE.quickWin.default;
  return {
    prompt: config.prompt,
    successMessage: config.success,
    suggestions: config.suggestions || []
  };
}

/**
 * Get module setup dialogue
 */
export function getModuleSetupDialogue(module) {
  return DIALOGUE.moduleSetup[module] || {
    intro: `Let's set up ${formatModuleName(module)}!`,
    encouragement: "You're making great progress!",
    complete: `${formatModuleName(module)} is ready!`
  };
}

/**
 * Get celebration message
 */
export function getCelebration(type) {
  return DIALOGUE.celebrations[type] || DIALOGUE.celebrations.progress;
}

/**
 * Get encouragement message
 */
export function getEncouragement(situation) {
  return DIALOGUE.encouragement[situation] || DIALOGUE.encouragement.progress;
}

export default {
  DIALOGUE,
  getNovaDialogue,
  getQuickWinConfig,
  getModuleSetupDialogue,
  getCelebration,
  getEncouragement
};
