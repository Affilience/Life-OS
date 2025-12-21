/**
 * Nova Personality Learning System
 *
 * Tracks user preferences for communication style and adapts Nova's responses.
 * Learns from interactions to provide a more personalized experience.
 */

import { supabase, getCurrentUserId } from '../../../lib/supabase';

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  PREFERENCES: 'nova_personality_preferences',
  RESPONSE_HISTORY: 'nova_response_history',
  INTERACTION_STATS: 'nova_interaction_stats',
};

// ============================================================================
// DEFAULT PREFERENCES
// ============================================================================

const DEFAULT_PREFERENCES = {
  // Response length preference (learned from user reactions)
  responseLength: {
    preference: 'medium', // 'brief', 'medium', 'detailed'
    confidence: 0.5,
    samples: [],
  },

  // Formality level
  formality: {
    preference: 'casual', // 'casual', 'balanced', 'professional'
    confidence: 0.5,
    samples: [],
  },

  // Emoji usage
  emojis: {
    preference: 'minimal', // 'none', 'minimal', 'moderate', 'frequent'
    confidence: 0.5,
    samples: [],
  },

  // Humor tolerance
  humor: {
    preference: 'moderate', // 'none', 'subtle', 'moderate', 'frequent'
    confidence: 0.5,
    samples: [],
  },

  // Proactive suggestions
  proactivity: {
    preference: 'moderate', // 'minimal', 'moderate', 'high'
    confidence: 0.5,
    samples: [],
  },

  // Data citation frequency
  dataCitation: {
    preference: 'when_relevant', // 'minimal', 'when_relevant', 'always'
    confidence: 0.5,
    samples: [],
  },

  // Encouragement level
  encouragement: {
    preference: 'moderate', // 'minimal', 'moderate', 'high'
    confidence: 0.5,
    samples: [],
  },
};

// ============================================================================
// PREFERENCE STORAGE
// ============================================================================

/**
 * Load preferences from localStorage
 */
export function loadPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new preference keys
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load Nova preferences:', e);
  }
  return { ...DEFAULT_PREFERENCES };
}

/**
 * Save preferences to localStorage
 */
export function savePreferences(preferences) {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (e) {
    console.warn('Failed to save Nova preferences:', e);
  }
}

/**
 * Reset preferences to defaults
 */
export function resetPreferences() {
  localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
  return { ...DEFAULT_PREFERENCES };
}

// ============================================================================
// INTERACTION TRACKING
// ============================================================================

/**
 * Track a response and user reaction
 */
export function trackResponse(response, metadata = {}) {
  const history = loadResponseHistory();

  history.push({
    timestamp: Date.now(),
    responseLength: response.length,
    responseWords: response.split(/\s+/).length,
    hadEmoji: /[\u{1F600}-\u{1F64F}]/u.test(response),
    hadHumor: metadata.hadHumor || false,
    hadData: metadata.hadData || false,
    topic: metadata.topic || 'general',
    userFollowUp: null, // Updated later if user responds
    userSentiment: null, // Updated based on next message
  });

  // Keep only last 100 interactions
  while (history.length > 100) {
    history.shift();
  }

  saveResponseHistory(history);
  return history.length - 1; // Return index for later update
}

/**
 * Update a tracked response with user reaction
 */
export function updateResponseReaction(index, reaction) {
  const history = loadResponseHistory();

  if (history[index]) {
    history[index].userFollowUp = reaction.followUp || null;
    history[index].userSentiment = reaction.sentiment || null;
    saveResponseHistory(history);

    // Analyze and update preferences based on reaction
    analyzeAndUpdatePreferences(history[index], reaction);
  }
}

function loadResponseHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RESPONSE_HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveResponseHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEYS.RESPONSE_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save response history:', e);
  }
}

// ============================================================================
// PREFERENCE LEARNING
// ============================================================================

/**
 * Analyze user reaction and update preferences
 */
function analyzeAndUpdatePreferences(response, reaction) {
  const preferences = loadPreferences();

  // If user asked for more detail, prefer longer responses
  if (reaction.askedForMore) {
    updatePreference(preferences, 'responseLength', 'detailed', 0.1);
  }

  // If user seemed satisfied with brief response, prefer brief
  if (reaction.seemedSatisfied && response.responseWords < 30) {
    updatePreference(preferences, 'responseLength', 'brief', 0.1);
  }

  // If user responded positively to humor
  if (response.hadHumor && reaction.sentiment === 'positive') {
    updatePreference(preferences, 'humor', 'moderate', 0.1);
  }

  // If user responded negatively to humor
  if (response.hadHumor && reaction.sentiment === 'negative') {
    updatePreference(preferences, 'humor', 'none', 0.15);
  }

  // If user asked for less enthusiasm
  if (reaction.tooMuchEnthusiasm) {
    updatePreference(preferences, 'encouragement', 'minimal', 0.2);
  }

  savePreferences(preferences);
}

/**
 * Update a single preference with new evidence
 */
function updatePreference(preferences, key, newValue, weight) {
  if (!preferences[key]) return;

  const pref = preferences[key];

  // Add to samples
  pref.samples.push({
    value: newValue,
    timestamp: Date.now(),
  });

  // Keep only recent samples (last 50)
  while (pref.samples.length > 50) {
    pref.samples.shift();
  }

  // Calculate new preference based on weighted samples
  const valueCounts = {};
  pref.samples.forEach((sample, idx) => {
    // More recent samples have higher weight
    const recencyWeight = 0.5 + (idx / pref.samples.length) * 0.5;
    valueCounts[sample.value] = (valueCounts[sample.value] || 0) + recencyWeight;
  });

  // Find the preference with highest count
  let maxCount = 0;
  let newPreference = pref.preference;

  Object.entries(valueCounts).forEach(([value, count]) => {
    if (count > maxCount) {
      maxCount = count;
      newPreference = value;
    }
  });

  pref.preference = newPreference;
  pref.confidence = Math.min(0.95, pref.confidence + weight * 0.1);
}

// ============================================================================
// RESPONSE ADAPTATION
// ============================================================================

/**
 * Get adapted system prompt additions based on learned preferences
 */
export function getPersonalityAdaptations() {
  const preferences = loadPreferences();
  const adaptations = [];

  // Response length
  if (preferences.responseLength.confidence > 0.6) {
    switch (preferences.responseLength.preference) {
      case 'brief':
        adaptations.push('Keep responses very short - 1-2 sentences max unless asked for more.');
        break;
      case 'detailed':
        adaptations.push('This user appreciates thorough responses - feel free to explain in detail.');
        break;
    }
  }

  // Formality
  if (preferences.formality.confidence > 0.6) {
    switch (preferences.formality.preference) {
      case 'casual':
        adaptations.push('Be very casual and relaxed in tone.');
        break;
      case 'professional':
        adaptations.push('Maintain a more professional, polished tone.');
        break;
    }
  }

  // Humor
  if (preferences.humor.confidence > 0.6) {
    switch (preferences.humor.preference) {
      case 'none':
        adaptations.push('Avoid humor - keep things straightforward.');
        break;
      case 'frequent':
        adaptations.push('Feel free to add light humor and playfulness.');
        break;
    }
  }

  // Encouragement
  if (preferences.encouragement.confidence > 0.6) {
    switch (preferences.encouragement.preference) {
      case 'minimal':
        adaptations.push('Skip the encouragement - be matter-of-fact.');
        break;
      case 'high':
        adaptations.push('Be encouraging and celebrate their progress.');
        break;
    }
  }

  return adaptations;
}

/**
 * Get recommended response parameters based on preferences
 */
export function getResponseParameters() {
  const preferences = loadPreferences();

  return {
    maxWords: preferences.responseLength.preference === 'brief' ? 40
      : preferences.responseLength.preference === 'detailed' ? 150
        : 80,

    includeEmojis: preferences.emojis.preference !== 'none',
    emojiFrequency: preferences.emojis.preference === 'frequent' ? 0.3
      : preferences.emojis.preference === 'moderate' ? 0.15
        : 0.05,

    humorLevel: preferences.humor.preference === 'none' ? 0
      : preferences.humor.preference === 'subtle' ? 0.1
        : preferences.humor.preference === 'frequent' ? 0.4
          : 0.2,

    encouragementLevel: preferences.encouragement.preference === 'minimal' ? 0.1
      : preferences.encouragement.preference === 'high' ? 0.6
        : 0.3,
  };
}

// ============================================================================
// GREETING VARIATIONS
// ============================================================================

const GREETING_TEMPLATES = {
  morning: [
    "Good morning! Ready for today?",
    "Morning! What's the plan for today?",
    "Hey, early bird! What are we tackling?",
    "Morning! How'd you sleep?",
    "Good morning! Let's make today count.",
  ],
  afternoon: [
    "Hey! How's your day going?",
    "Afternoon! Still going strong?",
    "Hey there! What's on your mind?",
    "How's the afternoon treating you?",
    "Hey! Need anything?",
  ],
  evening: [
    "Hey! Winding down or still at it?",
    "Good evening! How was today?",
    "Evening! Reflect on the day?",
    "Hey there! How did today go?",
    "Good evening! Ready to review the day?",
  ],
  night: [
    "Still up? What's keeping you going?",
    "Burning the midnight oil?",
    "Late night session? What's up?",
    "Night owl mode activated?",
    "Hey, don't forget to rest eventually!",
  ],
};

const USED_GREETINGS = new Set();

/**
 * Get a varied greeting that hasn't been used recently
 */
export function getVariedGreeting() {
  const hour = new Date().getHours();
  let timeOfDay;

  if (hour < 6) timeOfDay = 'night';
  else if (hour < 12) timeOfDay = 'morning';
  else if (hour < 18) timeOfDay = 'afternoon';
  else if (hour < 22) timeOfDay = 'evening';
  else timeOfDay = 'night';

  const templates = GREETING_TEMPLATES[timeOfDay];

  // Find one that hasn't been used recently
  let greeting = templates.find(g => !USED_GREETINGS.has(g));

  // If all used, clear and start over
  if (!greeting) {
    USED_GREETINGS.clear();
    greeting = templates[Math.floor(Math.random() * templates.length)];
  }

  USED_GREETINGS.add(greeting);

  // Keep set from growing too large
  if (USED_GREETINGS.size > 20) {
    const oldestEntries = [...USED_GREETINGS].slice(0, 10);
    oldestEntries.forEach(e => USED_GREETINGS.delete(e));
  }

  return greeting;
}

// ============================================================================
// SENTIMENT ANALYSIS
// ============================================================================

/**
 * Analyze user message sentiment
 */
export function analyzeUserSentiment(message) {
  const msgLower = message.toLowerCase();

  // Positive indicators
  const positivePatterns = [
    /thank|thanks|thx|ty/i,
    /great|awesome|amazing|perfect|excellent/i,
    /love it|love that|that's great/i,
    /helpful|helped/i,
    /yes|yeah|yep|yup/i,
    /good|nice|cool/i,
    /\b(lol|haha|😊|👍|❤️|🎉)\b/i,
  ];

  // Negative indicators
  const negativePatterns = [
    /no|nope|nah/i,
    /wrong|incorrect|not what i/i,
    /too (long|short|much|many)/i,
    /stop|don't|didn't ask/i,
    /annoying|annoyed/i,
    /confused|confusing/i,
    /\b(ugh|meh|😒|👎)\b/i,
  ];

  // Check patterns
  let positiveScore = 0;
  let negativeScore = 0;

  positivePatterns.forEach(pattern => {
    if (pattern.test(msgLower)) positiveScore++;
  });

  negativePatterns.forEach(pattern => {
    if (pattern.test(msgLower)) negativeScore++;
  });

  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

/**
 * Detect if user is asking for more detail
 */
export function detectAskingForMore(message) {
  const patterns = [
    /tell me more/i,
    /explain/i,
    /what do you mean/i,
    /can you elaborate/i,
    /more detail/i,
    /go on/i,
    /continue/i,
    /expand on that/i,
  ];

  return patterns.some(p => p.test(message));
}

/**
 * Detect if user is asking to be more concise
 */
export function detectAskingForLess(message) {
  const patterns = [
    /too long/i,
    /too much/i,
    /shorter/i,
    /brief/i,
    /tldr/i,
    /summarize/i,
    /get to the point/i,
  ];

  return patterns.some(p => p.test(message));
}

// ============================================================================
// SYNC TO DATABASE (for cross-device)
// ============================================================================

/**
 * Sync preferences to database for cross-device consistency
 */
export async function syncPreferencesToDatabase() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const preferences = loadPreferences();

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        nova_personality: preferences,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.warn('Failed to sync preferences:', error);
    }
  } catch (e) {
    console.warn('Error syncing preferences:', e);
  }
}

/**
 * Load preferences from database
 */
export async function loadPreferencesFromDatabase() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('nova_personality')
      .eq('user_id', userId)
      .single();

    if (error || !data?.nova_personality) return null;

    // Merge with defaults and save locally
    const merged = { ...DEFAULT_PREFERENCES, ...data.nova_personality };
    savePreferences(merged);

    return merged;
  } catch {
    return null;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const personalityLearning = {
  // Preference management
  loadPreferences,
  savePreferences,
  resetPreferences,

  // Tracking
  trackResponse,
  updateResponseReaction,

  // Adaptations
  getPersonalityAdaptations,
  getResponseParameters,
  getVariedGreeting,

  // Analysis
  analyzeUserSentiment,
  detectAskingForMore,
  detectAskingForLess,

  // Sync
  syncPreferencesToDatabase,
  loadPreferencesFromDatabase,
};

export default personalityLearning;
