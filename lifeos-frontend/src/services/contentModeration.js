/**
 * Content Moderation Service
 * Analyzes text content for toxicity, spam, and guideline violations
 * Can run client-side or call edge function when deployed
 */

// Toxicity patterns (basic keyword detection)
const TOXIC_PATTERNS = {
  hate_speech: [
    /\b(hate|kill|die|murder)\s+(all|every)\s+\w+/gi,
    /\b(racial|ethnic)\s+slur/gi,
  ],
  harassment: [
    /\b(you('re|r)?\s+)?(stupid|idiot|moron|dumb|loser|pathetic)\b/gi,
    /\bkill\s+your\s*self\b/gi,
    /\bgo\s+die\b/gi,
  ],
  threats: [
    /\bi('ll|m\s+going\s+to|will)\s+(kill|hurt|harm|destroy)\s+(you|u)\b/gi,
    /\b(threat|threaten)\w*\b/gi,
  ],
  spam: [
    /(.)\1{5,}/g, // Repeated characters
    /(https?:\/\/[^\s]+\s*){3,}/gi, // Multiple links
    /\b(buy|click|subscribe|follow)\s+(now|here|this)\b/gi,
  ],
  sexual_content: [
    /\b(porn|xxx|nsfw|nude|naked)\b/gi,
  ],
  personal_info: [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Phone numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
    /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, // SSN pattern
  ],
};

// Profanity list (basic - can be expanded)
const PROFANITY_LIST = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'bastard',
  'dick', 'cock', 'pussy', 'cunt', 'fag', 'retard'
];

// Severity weights
const SEVERITY_WEIGHTS = {
  hate_speech: 1.0,
  harassment: 0.9,
  threats: 1.0,
  spam: 0.5,
  sexual_content: 0.7,
  personal_info: 0.8,
  profanity: 0.4,
};

/**
 * Analyze content for moderation
 * @param {string} text - Text to analyze
 * @returns {Object} Moderation result
 */
export function analyzeContent(text) {
  if (!text || typeof text !== 'string') {
    return {
      is_safe: true,
      should_block: false,
      requires_review: false,
      toxicity_score: 0,
      categories: {},
      flagged_items: [],
      filtered_content: text || '',
    };
  }

  const categories = {
    hate_speech: 0,
    harassment: 0,
    threats: 0,
    spam: 0,
    sexual_content: 0,
    personal_info: 0,
    profanity: 0,
  };

  const flaggedItems = [];
  let filteredContent = text;
  const lowerText = text.toLowerCase();

  // Check each toxic pattern category
  for (const [category, patterns] of Object.entries(TOXIC_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        categories[category] = Math.min(
          1,
          categories[category] + matches.length * 0.3
        );
        flaggedItems.push(`${category}: ${matches.join(', ')}`);
      }
    }
  }

  // Check profanity
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      categories.profanity = Math.min(1, categories.profanity + matches.length * 0.2);
      flaggedItems.push(`profanity: ${word}`);
      // Replace profanity with asterisks
      filteredContent = filteredContent.replace(regex, '*'.repeat(word.length));
    }
  }

  // Calculate overall toxicity score
  let toxicityScore = 0;
  for (const [category, score] of Object.entries(categories)) {
    toxicityScore += score * SEVERITY_WEIGHTS[category];
  }
  toxicityScore = Math.min(1, toxicityScore / Object.keys(categories).length);

  // Determine action thresholds
  const maxCategoryScore = Math.max(...Object.values(categories));
  const shouldBlock = maxCategoryScore >= 0.85 ||
    categories.threats >= 0.5 ||
    categories.hate_speech >= 0.7;
  const requiresReview = maxCategoryScore >= 0.5 && !shouldBlock;
  const isSafe = maxCategoryScore < 0.3;

  return {
    is_safe: isSafe,
    should_block: shouldBlock,
    requires_review: requiresReview,
    toxicity_score: Math.round(toxicityScore * 1000) / 1000,
    categories,
    flagged_items: flaggedItems,
    filtered_content: filteredContent,
  };
}

/**
 * Filter/censor profanity from text
 * @param {string} text - Text to filter
 * @returns {string} Filtered text
 */
export function filterProfanity(text) {
  if (!text) return text;

  let filtered = text;
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  }
  return filtered;
}

/**
 * Check if content is safe to post
 * @param {string} text - Text to check
 * @returns {Object} { safe: boolean, reason?: string }
 */
export function isContentSafe(text) {
  const result = analyzeContent(text);

  if (result.should_block) {
    return {
      safe: false,
      reason: 'Content violates community guidelines',
      categories: Object.entries(result.categories)
        .filter(([_, score]) => score > 0.5)
        .map(([cat]) => cat),
    };
  }

  if (result.requires_review) {
    return {
      safe: true,
      warning: 'Content flagged for review',
      filtered_content: result.filtered_content,
    };
  }

  return { safe: true };
}

/**
 * Moderate a comment before posting
 * @param {string} comment - Comment text
 * @returns {Object} { allowed: boolean, filtered?: string, reason?: string }
 */
export function moderateComment(comment) {
  const check = isContentSafe(comment);

  if (!check.safe) {
    return {
      allowed: false,
      reason: check.reason,
    };
  }

  const result = analyzeContent(comment);

  return {
    allowed: true,
    filtered: result.filtered_content,
    was_filtered: result.filtered_content !== comment,
  };
}

/**
 * Validate display name
 * @param {string} name - Display name to validate
 * @returns {Object} { valid: boolean, reason?: string }
 */
export function validateDisplayName(name) {
  if (!name || name.trim().length < 2) {
    return { valid: false, reason: 'Name must be at least 2 characters' };
  }

  if (name.length > 30) {
    return { valid: false, reason: 'Name must be 30 characters or less' };
  }

  const result = analyzeContent(name);

  if (result.should_block || result.categories.profanity > 0) {
    return { valid: false, reason: 'Name contains inappropriate content' };
  }

  // Check for impersonation patterns
  const impersonationPatterns = [
    /\b(admin|moderator|mod|staff|official|support)\b/gi,
    /\b(supabase|lifeos|system)\b/gi,
  ];

  for (const pattern of impersonationPatterns) {
    if (pattern.test(name)) {
      return { valid: false, reason: 'Name may not impersonate staff' };
    }
  }

  return { valid: true };
}

/**
 * Validate bio/description
 * @param {string} bio - Bio text to validate
 * @returns {Object} { valid: boolean, reason?: string, filtered?: string }
 */
export function validateBio(bio) {
  if (!bio) return { valid: true };

  if (bio.length > 280) {
    return { valid: false, reason: 'Bio must be 280 characters or less' };
  }

  const result = analyzeContent(bio);

  if (result.should_block) {
    return { valid: false, reason: 'Bio contains inappropriate content' };
  }

  return {
    valid: true,
    filtered: result.filtered_content,
    was_filtered: result.filtered_content !== bio,
  };
}

export default {
  analyzeContent,
  filterProfanity,
  isContentSafe,
  moderateComment,
  validateDisplayName,
  validateBio,
};
