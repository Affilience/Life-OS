# LifeOS Onboarding Design Document

## Nova-Guided Personalized Setup Experience

**Version:** 1.0
**Last Updated:** December 2024

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Research Insights](#research-insights)
3. [Design Principles](#design-principles)
4. [Nova's Role as Guide](#novas-role-as-guide)
5. [Onboarding Flow Architecture](#onboarding-flow-architecture)
6. [Module-Specific Setup](#module-specific-setup)
7. [Technical Implementation](#technical-implementation)
8. [Metrics & Success Criteria](#metrics--success-criteria)

---

## Executive Summary

This document outlines a comprehensive onboarding system for LifeOS where **Nova**, our AI companion, guides users through personalized setup across all modules. Drawing from research on game tutorials (Pokemon, Zelda, Animal Crossing), successful app onboarding (Duolingo, Headspace, Finch, Noom), and UX best practices, we've designed an experience that:

- Uses Nova as a friendly mentor character (like Tom Nook or Duo)
- Progressively discloses complexity through "learning by doing"
- Automatically navigates users to relevant pages for seamless data entry
- Creates emotional connection through microinteractions and personality
- Achieves personalization with minimal friction

**Target:** 85%+ onboarding completion rate, <5 minutes for core setup

---

## Research Insights

### From Games: The Mentor Character Pattern

| Game | Guide Character | What Works |
|------|----------------|------------|
| **Pokemon** | Professor Oak | Introduces one concept at a time, lets player make meaningful choices (starter Pokemon = first personalization) |
| **Zelda** | Navi | Always available but not intrusive, contextual help when needed |
| **Animal Crossing** | Tom Nook | Tasks disguised as onboarding (delivery = learn navigation), earns rewards while learning |
| **Banjo-Kazooie** | Bottles | Skippable tutorials, only appears for new mechanics |

**Key Insight:** The best game tutorials teach through *doing*, not *telling*. Players complete real tasks that happen to teach mechanics.

> "The key to eliminating boring tutorials is through educational level design... Classic Mario teaches players absolutely everything they need to know without a word of explanation."
> — [GDC Talk on Tutorials](https://www.gdcvault.com/play/1023845/This-is-a-Talk-About)

### From Apps: Personalization-First Onboarding

| App | Approach | Key Metric |
|-----|----------|------------|
| **Duolingo** | "Take the quiz" before signup, mascot personality, gradual engagement | 34% increase in DAU after refining Duo's interactions |
| **Noom** | 85+ question quiz that feels like conversation, social proof at friction points | 5 minutes to personalized plan |
| **Headspace** | 3 simple questions, anchor to existing routines | Reduced 38% drop-off with simplified flow |
| **Finch** | Pet hatching = first action, nurturing framing | Gamification drives 7-day retention |
| **MyFitnessPal** | Goal → immediate calorie target → *then* features | 18 steps across phases |

**Key Insight:** Ask personalization questions first, show value immediately, delay account creation.

> "Users offered a streak wager see a 14% boost in day 14 user retention."
> — [Duolingo Gamification Research](https://strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo/)

### From UX Research: Progressive Disclosure

| Pattern | When to Use | LifeOS Application |
|---------|-------------|-------------------|
| **Tooltips** | Quick explanations | Nova speech bubbles |
| **Coachmarks** | Highlight UI elements | Spotlight key buttons |
| **Checklists** | Multi-step processes | Setup progress tracker |
| **Empty States** | First-time screens | Demo data + guided actions |
| **Wizards** | Complex configuration | Module setup flows |

**Key Insight:** 70% of app features go undiscovered. Coachmarks improve feature adoption by 40-60%.

> "Platforms using mascots in onboarding see 25% reduction in user drop-off rates."
> — [Adobe UX Research 2023](https://raw.studio/blog/how-mascots-improve-user-experience/)

---

## Design Principles

### 1. Nova as Trusted Mentor, Not Annoying Helper

**Do:**
- Speak in warm, encouraging tone
- Provide skippable guidance
- Celebrate small wins
- Offer help when user seems stuck

**Don't:**
- Interrupt flow unnecessarily (avoid "Navi syndrome")
- Repeat information
- Block progress with mandatory reading
- Be condescending

**Nova's Personality During Onboarding:**
```
Trait: Encouraging but not pushy
Tone: "Let's explore together" not "You must do this"
Reactions: Excited for wins, supportive during setup
```

### 2. Learn by Doing, Not Reading

Every onboarding step should involve **real actions** that create **real value**:

| Bad | Good |
|-----|------|
| "This is where you track tasks" | "What's one thing you want to accomplish today?" (creates first task) |
| "Set your calorie goal here" | "What's your fitness goal?" → auto-calculates calories |
| "This is the journal" | "How are you feeling right now?" (creates first entry) |

### 3. Progressive Complexity

**Phase 1 (Minutes 0-2):** Core identity
- Name, basic goals, one quick win

**Phase 2 (Minutes 2-5):** Primary modules
- Top 2-3 modules based on stated goals

**Phase 3 (Days 1-7):** Secondary discovery
- Contextual introduction to remaining features

### 4. Seamless Navigation

Nova should **automatically take users to the right page** rather than explaining where things are:

```
Nova: "Let's set up your health goals!"
[Animation: Nova flies to Health module]
[Page transition: User lands on Health setup]
Nova: "What's your main fitness focus?"
```

### 5. Instant Value Demonstration

Show personalized insights **before** asking for more data:

```
Nova: "Based on your goal to lose weight, I'd recommend
       tracking around 1,800 calories daily. Want me to
       set that up?"
[Yes] → Done, immediate value
[Customize] → Advanced options
```

---

## Nova's Role as Guide

### Evolution Through Onboarding

Nova starts as **Spark** form (baby stage) during onboarding, symbolizing that both Nova and the user are beginning their journey together:

```
Stage: Spark (Onboarding)
Message: "I'm Nova! I'm new here too. Let's figure this out together!"

[After completing onboarding]
Stage: Still Spark, but with visible growth
Message: "Look at us! We're already making progress!"
```

This creates **mutual investment** — the user helps Nova grow while Nova helps them.

### Conversation-Based Setup

Instead of forms, Nova asks questions conversationally:

```
Nova: "What brings you to LifeOS? What are you hoping to improve?"

[Multiple choice with icons]
□ Productivity & Focus
□ Health & Fitness
□ Learning & Growth
□ Financial Goals
□ Life Balance
□ All of the above!

Nova: "Awesome choices! Let's start with [top selection]..."
```

### Emotional States During Onboarding

| State | Trigger | Nova's Response |
|-------|---------|-----------------|
| Excited | User selects goals | "Yes! I love that goal!" |
| Encouraging | User hesitates | "No pressure, we can adjust this anytime" |
| Celebratory | User completes step | "You did it! 🎉 One step closer!" |
| Supportive | User skips | "That's okay! We can set this up later" |
| Proud | Onboarding complete | "Look at you! Ready to take on the world!" |

### Dialogue Trees

Nova's dialogue adapts based on user choices:

```
IF user.goal == "lose_weight":
  Nova: "I'll help you track nutrition and workouts.
         What's your target weight?"

ELIF user.goal == "productivity":
  Nova: "Let's get you organized! What's your biggest
         challenge right now - tasks, time, or focus?"

ELIF user.goal == "financial":
  Nova: "Smart! Let's take control of your finances.
         Do you have a monthly budget in mind?"
```

---

## Onboarding Flow Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ONBOARDING FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ WELCOME  │───▶│  GOALS   │───▶│  QUICK   │              │
│  │  (Nova)  │    │ SELECTION│    │   WIN    │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       │                               │                     │
│       │         ┌─────────────────────┘                     │
│       │         ▼                                           │
│       │    ┌──────────┐    ┌──────────┐    ┌──────────┐    │
│       │    │ MODULE 1 │───▶│ MODULE 2 │───▶│ MODULE 3 │    │
│       │    │  SETUP   │    │  SETUP   │    │  SETUP   │    │
│       │    └──────────┘    └──────────┘    └──────────┘    │
│       │                                          │          │
│       │         ┌────────────────────────────────┘          │
│       │         ▼                                           │
│       │    ┌──────────┐    ┌──────────┐                    │
│       └───▶│ DASHBOARD│───▶│ COMPLETE │                    │
│            │  REVEAL  │    │  🎉      │                    │
│            └──────────┘    └──────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Detailed Step Breakdown

#### Step 1: Welcome & Nova Introduction (30 seconds)

**Screen:** Full-screen Nova animation
**Content:**
```
[Nova hatches/appears animation]

Nova: "Hi there! I'm Nova, your personal AI companion.
       I'm here to help you build the life you want.

       Ready to get started?"

[Let's go!] → Continue
[Tell me more] → Brief app overview
```

**Design Notes:**
- Soft, calming animation (like Headspace breathing intro)
- Nova in Spark form, cute and approachable
- Single CTA, no overwhelming options

#### Step 2: Goal Selection (45 seconds)

**Screen:** Goal cards with icons
**Content:**
```
Nova: "What matters most to you right now?
       Pick your top priorities."

[Visual grid of goal cards - max 3 selections]

🎯 Get More Done          💪 Get Healthier
📚 Learn New Things       💰 Manage Money Better
📝 Reflect & Journal      ⚖️ Find Balance
🎮 Build Better Habits    🎯 Track My Goals

[Continue] → Enabled after 1+ selection
```

**Design Notes:**
- Cards highlight on selection with satisfying animation
- Nova reacts to each selection ("Great choice!")
- Progress indicator: Step 1 of 5

#### Step 3: Quick Win - First Action (60 seconds)

**Screen:** Contextual based on top goal
**Content (Productivity example):**
```
Nova: "Let's start with something simple.
       What's ONE thing you want to accomplish today?"

[Text input with suggestions]
"Write your first task..."

Suggestions: [Morning routine] [Exercise] [Read] [Work project]

Nova: "Perfect! I've added that to your tasks.
       You just took your first step! ✨"

[Celebration animation]
```

**Design Notes:**
- This creates immediate data and immediate value
- Suggestion chips reduce cognitive load
- Celebration reinforces positive behavior (like Duolingo)

#### Step 4: Primary Module Setup (2-3 minutes)

Based on goal selection, Nova navigates to 2-3 modules:

**Navigation Pattern:**
```
Nova: "Now let's set up [Module Name]!"

[Screen transition animation - Nova "flies" to new page]

[User lands on module with setup overlay]
```

**Module Setup Overlays:**

See [Module-Specific Setup](#module-specific-setup) for detailed flows.

#### Step 5: Dashboard Reveal (30 seconds)

**Screen:** Dashboard with populated data
**Content:**
```
[Dramatic reveal animation]

Nova: "Welcome to YOUR LifeOS!

       This is your dashboard - everything in one place.
       I've personalized it based on what matters to you."

[Dashboard shows widgets relevant to selected goals]

Nova: "I'll be right here whenever you need me.
       Just tap my icon anytime!"

[Nova minimizes to floating widget]

[Explore Dashboard] → End onboarding
```

### Progress Tracking

Throughout onboarding, show subtle progress:

```
┌────────────────────────────────────────┐
│ ●───●───●───○───○                      │
│ Welcome  Goals  Setup  Dashboard  Done │
└────────────────────────────────────────┘
```

**Progress bar fills with satisfying animation as user advances.**

---

## Module-Specific Setup

### Health Module Setup

**Trigger:** User selected "Get Healthier" or related goal

**Flow:**
```
┌─────────────────────────────────────────┐
│         HEALTH SETUP                    │
├─────────────────────────────────────────┤
│                                         │
│  Nova: "Let's get your health          │
│         tracking set up!"              │
│                                         │
│  ┌─────────────────────────────┐       │
│  │ What's your primary goal?   │       │
│  │                             │       │
│  │ ○ Lose weight              │       │
│  │ ○ Build muscle             │       │
│  │ ○ Maintain weight          │       │
│  │ ○ Just eat healthier       │       │
│  └─────────────────────────────┘       │
│                                         │
│  [Continue]                             │
└─────────────────────────────────────────┘
```

**Data Collection (Smart Defaults):**

| Question | Input Type | Smart Default |
|----------|-----------|---------------|
| Current weight | Number + unit toggle | Skip option |
| Target weight | Number (if applicable) | Calculated from BMI |
| Activity level | Slider (Sedentary → Very Active) | "Lightly Active" |
| Calorie goal | Auto-calculated, editable | Based on TDEE formula |

**Nova's Calculations:**
```
Nova: "Based on your goals, I recommend about
       1,850 calories per day.

       That breaks down to roughly:
       • Protein: 140g
       • Carbs: 185g
       • Fat: 62g

       Sound good?"

[Perfect!] → Save and continue
[Adjust] → Show sliders
[Skip for now] → Use defaults, flag for later
```

### Financial Module Setup

**Trigger:** User selected "Manage Money Better"

**Flow:**
```
Nova: "Let's take control of your finances!
       Don't worry, I won't judge. 💚"

Question 1: "What's your main financial goal?"
- Save more money
- Pay off debt
- Track spending
- Build an emergency fund
- Invest for the future

Question 2: "What's your approximate monthly income?"
[Income range selector - not exact, reduces anxiety]
- Under $2,000
- $2,000 - $4,000
- $4,000 - $6,000
- $6,000 - $10,000
- Over $10,000
- Prefer not to say

Question 3: "How much would you like to save monthly?"
[Smart suggestions based on income range]
Nova: "A good rule of thumb is 20% of income.
       For you, that's around $[calculated]"
```

**Quick Budget Setup:**
```
Nova: "I've created a starter budget for you!
       You can adjust these anytime."

[Visual budget breakdown - donut chart]
- Needs (50%): $X
- Wants (30%): $X
- Savings (20%): $X

[Looks good!] → Continue
[Customize] → Detailed budget editor
```

### Productivity Module Setup

**Trigger:** User selected "Get More Done"

**Flow:**
```
Nova: "Let's boost your productivity!
       What's your biggest challenge?"

○ Too many tasks, don't know where to start
○ Getting distracted easily
○ Not enough time in the day
○ Hard to stay motivated
○ Managing projects & deadlines

[Based on selection, Nova adjusts setup]

Nova: "Got it! Let me help you get organized.
       What are your top 3 priorities this week?"

[3 text inputs with suggestions]
1. [____________]
2. [____________]
3. [____________]

Nova: "Perfect! I've created your first weekly goals.
       Let's crush them together! 💪"
```

### Journal Module Setup

**Trigger:** User selected "Reflect & Journal" or indirectly through wellness goals

**Flow:**
```
Nova: "Journaling is powerful! Let me set this up
       to match your style."

"How often would you like to journal?"
○ Daily (most impactful)
○ A few times a week
○ Weekly reflection
○ When I feel like it

"What would you like to reflect on?"
☑ Daily gratitude
☑ Mood tracking
☐ Goal progress
☐ Free writing
☑ Evening reflection

Nova: "I'll send you gentle reminders.
       Want to write your first entry now?"

[Yes, let's go!] → Opens journal with prompt
[Maybe later] → Continue onboarding
```

### Calendar Module Setup

**Trigger:** Part of productivity flow or explicit selection

**Flow:**
```
Nova: "Let's get your schedule organized!
       Do you want to connect your existing calendar?"

[Connect Google Calendar]
[Connect Apple Calendar]
[Start fresh]

Nova: "Great! Now, when are you most productive?"
[Time preference selector]
- Morning person (5am - 12pm peak)
- Afternoon warrior (12pm - 6pm peak)
- Night owl (6pm - 12am peak)

Nova: "I'll use this to suggest optimal times
       for deep work and important tasks!"
```

### Skills Module Setup

**Trigger:** User selected "Learn New Things"

**Flow:**
```
Nova: "Exciting! What skills do you want to develop?"

[Skill category cards - select up to 3]
💻 Technical/Coding
🎨 Creative/Design
📊 Business/Finance
🗣 Communication
🏃 Physical/Sports
🧠 Mental/Academic
🎵 Music/Arts

Nova: "For [selected skill], what's your current level?"
○ Complete beginner
○ Know the basics
○ Intermediate
○ Advanced, want to master

Nova: "How much time can you dedicate weekly?"
[Slider: 1 hour to 10+ hours]

Nova: "Perfect! I'll help you track progress
       and suggest practice goals."
```

---

## Technical Implementation

### Onboarding State Machine

```javascript
// onboardingStore.js
const ONBOARDING_STATES = {
  NOT_STARTED: 'not_started',
  WELCOME: 'welcome',
  GOALS: 'goals',
  QUICK_WIN: 'quick_win',
  MODULE_SETUP: 'module_setup',
  DASHBOARD_REVEAL: 'dashboard_reveal',
  COMPLETED: 'completed'
};

const onboardingStore = create((set, get) => ({
  state: ONBOARDING_STATES.NOT_STARTED,
  selectedGoals: [],
  completedModules: [],
  setupData: {},
  currentModule: null,

  // Progress tracking
  progress: {
    current: 0,
    total: 5,
    percentage: 0
  },

  // Actions
  startOnboarding: () => set({ state: ONBOARDING_STATES.WELCOME }),

  setGoals: (goals) => set({
    selectedGoals: goals,
    state: ONBOARDING_STATES.QUICK_WIN
  }),

  completeQuickWin: (data) => set((state) => ({
    setupData: { ...state.setupData, quickWin: data },
    state: ONBOARDING_STATES.MODULE_SETUP
  })),

  setCurrentModule: (module) => set({ currentModule: module }),

  completeModuleSetup: (module, data) => set((state) => ({
    completedModules: [...state.completedModules, module],
    setupData: { ...state.setupData, [module]: data }
  })),

  completeOnboarding: () => set({
    state: ONBOARDING_STATES.COMPLETED
  }),

  // Computed
  getNextModule: () => {
    const { selectedGoals, completedModules } = get();
    const moduleOrder = getModulesForGoals(selectedGoals);
    return moduleOrder.find(m => !completedModules.includes(m));
  }
}));
```

### Nova Onboarding Component

```jsx
// components/onboarding/NovaOnboarding.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useOnboardingStore from '../../stores/onboardingStore';

export default function NovaOnboarding() {
  const navigate = useNavigate();
  const {
    state,
    progress,
    setGoals,
    completeQuickWin,
    getNextModule
  } = useOnboardingStore();

  const [novaMessage, setNovaMessage] = useState('');
  const [novaEmotion, setNovaEmotion] = useState('excited');

  // Navigate to module for setup
  const navigateToModule = (module) => {
    setNovaMessage(`Let's set up ${module}!`);
    setNovaEmotion('excited');

    // Animation: Nova "flies" to destination
    setTimeout(() => {
      navigate(`/${module}?setup=true`);
    }, 800);
  };

  // Render current onboarding step
  const renderStep = () => {
    switch (state) {
      case 'welcome':
        return <WelcomeStep />;
      case 'goals':
        return <GoalsStep onComplete={setGoals} />;
      case 'quick_win':
        return <QuickWinStep onComplete={completeQuickWin} />;
      case 'module_setup':
        return <ModuleSetupRouter />;
      case 'dashboard_reveal':
        return <DashboardReveal />;
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      {/* Progress Bar */}
      <OnboardingProgress
        current={progress.current}
        total={progress.total}
      />

      {/* Nova Character */}
      <NovaCharacter
        emotion={novaEmotion}
        message={novaMessage}
        isOnboarding={true}
      />

      {/* Current Step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

### Module Setup Overlay Pattern

```jsx
// components/onboarding/ModuleSetupOverlay.jsx
export default function ModuleSetupOverlay({
  module,
  onComplete,
  onSkip
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});

  const moduleConfig = MODULE_SETUP_CONFIGS[module];
  const currentQuestion = moduleConfig.questions[step];

  const handleAnswer = (answer) => {
    setData({ ...data, [currentQuestion.key]: answer });

    if (step < moduleConfig.questions.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  return (
    <motion.div className="module-setup-overlay">
      {/* Dimmed background showing actual module page */}
      <div className="overlay-backdrop" />

      {/* Setup Card */}
      <div className="setup-card">
        <NovaAvatar emotion="helpful" size="small" />

        <h3>{currentQuestion.title}</h3>
        <p className="nova-says">{currentQuestion.novaSays}</p>

        <QuestionInput
          type={currentQuestion.type}
          options={currentQuestion.options}
          onAnswer={handleAnswer}
        />

        <div className="setup-actions">
          <button onClick={onSkip} className="skip-btn">
            Skip for now
          </button>
          <span className="step-indicator">
            {step + 1} of {moduleConfig.questions.length}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
```

### Database Schema for Onboarding State

```sql
-- Track onboarding progress and data
CREATE TABLE user_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  state VARCHAR(50) DEFAULT 'not_started',
  selected_goals TEXT[], -- Array of goal IDs
  completed_modules TEXT[],
  setup_data JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX idx_user_onboarding_user_id ON user_onboarding(user_id);

-- Trigger to update timestamp
CREATE TRIGGER update_user_onboarding_updated_at
  BEFORE UPDATE ON user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Nova Dialogue System

```javascript
// services/onboarding/novaDialogue.js

const DIALOGUE_TREES = {
  welcome: {
    initial: "Hi there! I'm Nova, your personal AI companion. Ready to build the life you want?",
    responses: {
      excited: "Let's do this! I'm so excited to get started with you!",
      curious: "Tell me more about what you're hoping to achieve...",
      supportive: "No pressure! We can go at whatever pace feels right."
    }
  },

  goals: {
    productivity: {
      selected: "Great choice! Getting things done is powerful.",
      followUp: "What's your biggest productivity challenge right now?"
    },
    health: {
      selected: "Love it! Your health is your greatest asset.",
      followUp: "Are you focusing more on fitness, nutrition, or overall wellness?"
    },
    financial: {
      selected: "Smart thinking! Let's get your finances in order.",
      followUp: "What's your main money goal - saving, spending less, or investing?"
    }
  },

  celebrations: {
    firstTask: "You did it! Your first task is logged. This is just the beginning! ✨",
    moduleComplete: "Another module down! You're making amazing progress!",
    onboardingComplete: "Look at you! You're all set up and ready to crush it! 🎉"
  },

  encouragement: {
    skip: "No worries! We can always set this up later. Let's keep moving!",
    hesitation: "Take your time. There's no rush here.",
    return: "Welcome back! Ready to pick up where we left off?"
  }
};

export function getNovaDialogue(context, userState) {
  const tree = DIALOGUE_TREES[context];

  // Personalize based on user state
  if (userState.isReturning) {
    return DIALOGUE_TREES.encouragement.return;
  }

  return tree.initial || tree;
}
```

---

## Metrics & Success Criteria

### Primary Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Completion Rate** | 85%+ | Users who finish onboarding / Users who start |
| **Time to Complete** | <5 min | Average duration of onboarding flow |
| **Module Activation** | 70%+ | Users who use a module within 24h of setup |
| **Day 1 Retention** | 60%+ | Users who return the day after onboarding |
| **Day 7 Retention** | 40%+ | Users who return within first week |

### Secondary Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Skip Rate per Step** | <20% | Steps skipped / Total step impressions |
| **Nova Interaction Rate** | 50%+ | Users who engage with Nova dialogue |
| **Setup Data Completeness** | 70%+ | Fields filled / Total optional fields |
| **First Action Time** | <60 sec | Time from start to first meaningful action |

### Tracking Implementation

```javascript
// analytics/onboardingTracking.js

export function trackOnboardingEvent(event, properties = {}) {
  const baseProperties = {
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    onboardingState: useOnboardingStore.getState().state,
    progress: useOnboardingStore.getState().progress.percentage
  };

  analytics.track(`onboarding_${event}`, {
    ...baseProperties,
    ...properties
  });
}

// Events to track:
// - onboarding_started
// - onboarding_goal_selected (with goals array)
// - onboarding_quick_win_completed
// - onboarding_module_setup_started (with module name)
// - onboarding_module_setup_completed (with module name, data completeness)
// - onboarding_module_setup_skipped (with module name)
// - onboarding_completed (with total time, modules completed)
// - onboarding_abandoned (with last state, time spent)
// - nova_dialogue_engaged
// - nova_help_requested
```

### A/B Testing Opportunities

1. **Welcome Animation:** Long intro vs. Quick start
2. **Goal Selection:** Cards vs. List vs. Conversation
3. **Progress Indicator:** Bar vs. Steps vs. Hidden
4. **Nova Frequency:** More dialogue vs. Less interruption
5. **Quick Win Type:** Task creation vs. Goal setting vs. Reflection

---

## Appendix A: Reference Screenshots

### Duolingo Onboarding
- Quiz before signup
- Mascot personality throughout
- Immediate "lesson" as quick win

### Headspace Onboarding
- Breathing animation welcome
- 3 simple questions
- Routine anchoring

### Finch Onboarding
- Pet hatching as first action
- Personality customization
- Soft paywall after value demonstration

### Noom Onboarding
- 85+ questions, feels conversational
- Social proof at friction points
- Time investment upfront for better personalization

---

## Appendix B: Nova Emotion Assets Needed

| Emotion | Usage | Animation |
|---------|-------|-----------|
| Excited | Goal selection, celebrations | Bouncing, sparkles |
| Helpful | Setup questions | Gentle floating |
| Proud | Completion moments | Wings spread, glow |
| Encouraging | Skip/hesitation | Soft nod, supportive gesture |
| Curious | Asking questions | Head tilt, thinking |
| Celebratory | Onboarding complete | Confetti, dance |

---

## Appendix C: Sources & References

### Game Design
- [GDC: This is a Talk About Tutorials](https://www.gdcvault.com/play/1023845/This-is-a-Talk-About)
- [Game Developer: Video Game Tutorials](https://www.gamedeveloper.com/design/video-game-tutorials-how-do-they-teach-)
- [TV Tropes: Annoying Video Game Helper](https://tvtropes.org/pmwiki/pmwiki.php/Main/AnnoyingVideoGameHelper)

### App Onboarding
- [Userflow: Ultimate Guide to In-App Onboarding](https://www.userflow.com/blog/the-ultimate-guide-to-in-app-onboarding-boost-user-retention-and-engagement)
- [Gravatar: App Onboarding Best Practices](https://blog.gravatar.com/2024/09/03/app-onboarding/)
- [UXCam: Top Onboarding Flow Examples](https://uxcam.com/blog/10-apps-with-great-user-onboarding/)

### Mascot & Character Design
- [UX Planet: About Duolingo's Owl](https://uxplanet.org/about-duolingos-grumpy-3-eyed-owl-1e36c455e7ab)
- [Raw Studio: How Mascots Improve UX](https://raw.studio/blog/how-mascots-improve-user-experience/)
- [Adweek: Duolingo Community Personality](https://www.adweek.com/social-marketing/social-confidential-duolingo-community-personality-mascot/)

### Progressive Disclosure
- [NN/G: Onboarding Tutorials vs Contextual Help](https://www.nngroup.com/articles/onboarding-tutorials/)
- [Userpilot: Contextual Help UX Patterns](https://userpilot.com/blog/contextual-help/)
- [Chameleon: Top 8 UX Patterns for Contextual Help](https://www.chameleon.io/blog/contextual-help-ux)

### Emotional Design
- [HCI: Impact of Microinteractions](https://www.hci.org.uk/article/the-impact-of-microinteractions-on-user-experience-designing-for-delight/)
- [UXPin: Designing Onboarding Microinteractions](https://www.uxpin.com/studio/blog/designing-onboarding-microinteractions-guide/)

### Case Studies
- [AppCues: Duolingo Onboarding](https://goodux.appcues.com/blog/duolingo-user-onboarding)
- [AppCues: Headspace Onboarding](https://goodux.appcues.com/blog/headspaces-mindful-onboarding-sequence)
- [Justinmind: Noom UX Case Study](https://www.justinmind.com/blog/ux-case-study-of-noom-app-gamification-progressive-disclosure-nudges/)
- [Medium: Finch UX Teardown](https://medium.com/@deepthi.aipm/ux-teardown-finch-self-care-app-18122357fae7)

---

*Document prepared for LifeOS development. Nova will guide users to build the life they want, one step at a time.*
