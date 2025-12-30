/**
 * Nova Token Manager
 *
 * Manages context window budget to prevent overflow and optimize relevance.
 * Uses tiktoken-style estimation for Claude's tokenizer.
 *
 * Claude 3.5 Sonnet context: ~200K tokens
 * Recommended usage: Keep under 8K for fast responses
 */

// Approximate tokens per character ratio for Claude
const TOKENS_PER_CHAR = 0.25; // ~4 chars per token average

// Context budget configuration
const CONTEXT_BUDGET = {
  TOTAL_MAX: 8000, // Stay well under model limits for speed
  SYSTEM_PROMPT: 1500, // Nova's personality + guidelines
  SYSTEM_KNOWLEDGE: 1500, // Ascynt documentation
  USER_DATA: 1500, // Current state from stores
  MEMORIES: 1000, // Learned facts + patterns
  CORRELATIONS: 500, // Cross-module insights
  CONVERSATION_HISTORY: 1500, // Recent messages
  BUFFER: 500 // Safety buffer
};

// Priority weights for content selection
const PRIORITY_WEIGHTS = {
  CRITICAL: 1.0,    // Must include (errors, direct answers)
  HIGH: 0.8,        // Very relevant to query
  MEDIUM: 0.5,      // Somewhat relevant
  LOW: 0.2,         // Nice to have
  BACKGROUND: 0.1   // Only if space permits
};

/**
 * Estimate token count for text
 */
export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length * TOKENS_PER_CHAR);
}

/**
 * Truncate text to fit within token budget
 */
export function truncateToTokenBudget(text, maxTokens) {
  const currentTokens = estimateTokens(text);
  if (currentTokens <= maxTokens) return text;

  // Estimate chars needed
  const maxChars = Math.floor(maxTokens / TOKENS_PER_CHAR);
  return text.slice(0, maxChars - 3) + '...';
}

/**
 * Score content relevance to query
 * Returns 0-1 relevance score
 */
export function scoreRelevance(content, query, contentType) {
  if (!query || !content) return PRIORITY_WEIGHTS.BACKGROUND;

  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();

  // Extract keywords from query
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  // Count keyword matches
  const matches = queryWords.filter(word => contentLower.includes(word)).length;
  const matchRatio = queryWords.length > 0 ? matches / queryWords.length : 0;

  // Boost based on content type relevance
  let typeBoost = 0;
  if (contentType === 'direct_answer') typeBoost = 0.3;
  else if (contentType === 'navigation') typeBoost = 0.2;
  else if (contentType === 'current_context') typeBoost = 0.15;

  // Check for question patterns
  const isNavigationQuery = /where|how|find|locate|go to/i.test(query);
  if (isNavigationQuery && contentType === 'navigation') typeBoost += 0.2;

  const isDataQuery = /how many|what is my|show me|status|progress/i.test(query);
  if (isDataQuery && contentType === 'user_data') typeBoost += 0.2;

  return Math.min(1, matchRatio * 0.7 + typeBoost);
}

/**
 * Build optimized context within token budget
 */
export function buildOptimizedContext(contextSources, query, options = {}) {
  const {
    maxTokens = CONTEXT_BUDGET.TOTAL_MAX,
    includeDebugInfo = false
  } = options;

  const result = {
    sections: [],
    totalTokens: 0,
    truncated: [],
    excluded: [],
    debugInfo: null
  };

  // Score and sort all sources by priority * relevance
  const scoredSources = contextSources.map(source => ({
    ...source,
    relevanceScore: scoreRelevance(source.content, query, source.type),
    effectivePriority: source.priority * scoreRelevance(source.content, query, source.type),
    tokens: estimateTokens(source.content)
  })).sort((a, b) => b.effectivePriority - a.effectivePriority);

  let remainingBudget = maxTokens;

  for (const source of scoredSources) {
    if (remainingBudget <= CONTEXT_BUDGET.BUFFER) {
      result.excluded.push({
        type: source.type,
        reason: 'budget_exhausted',
        tokens: source.tokens
      });
      continue;
    }

    // Skip very low relevance content
    if (source.relevanceScore < 0.1 && source.priority < PRIORITY_WEIGHTS.HIGH) {
      result.excluded.push({
        type: source.type,
        reason: 'low_relevance',
        score: source.relevanceScore
      });
      continue;
    }

    if (source.tokens <= remainingBudget) {
      // Include full content
      result.sections.push({
        type: source.type,
        content: source.content,
        tokens: source.tokens,
        relevance: source.relevanceScore
      });
      remainingBudget -= source.tokens;
      result.totalTokens += source.tokens;
    } else if (remainingBudget > 100 && source.priority >= PRIORITY_WEIGHTS.MEDIUM) {
      // Truncate to fit
      const truncatedContent = truncateToTokenBudget(source.content, remainingBudget - 50);
      const truncatedTokens = estimateTokens(truncatedContent);

      result.sections.push({
        type: source.type,
        content: truncatedContent,
        tokens: truncatedTokens,
        relevance: source.relevanceScore,
        wasTruncated: true
      });

      result.truncated.push({
        type: source.type,
        originalTokens: source.tokens,
        truncatedTo: truncatedTokens
      });

      remainingBudget -= truncatedTokens;
      result.totalTokens += truncatedTokens;
    } else {
      result.excluded.push({
        type: source.type,
        reason: 'too_large',
        tokens: source.tokens,
        available: remainingBudget
      });
    }
  }

  if (includeDebugInfo) {
    result.debugInfo = {
      queryTokens: estimateTokens(query),
      sourcesProcessed: scoredSources.length,
      includedCount: result.sections.length,
      excludedCount: result.excluded.length,
      truncatedCount: result.truncated.length,
      budgetUsed: `${result.totalTokens}/${maxTokens} (${Math.round(result.totalTokens/maxTokens*100)}%)`
    };
  }

  return result;
}

/**
 * Combine context sections into final prompt string
 */
export function assembleContext(optimizedContext) {
  return optimizedContext.sections
    .map(s => s.content)
    .join('\n\n');
}

/**
 * Get budget allocation for each context type
 */
export function getBudgetAllocation() {
  return { ...CONTEXT_BUDGET };
}

/**
 * Calculate conversation history budget
 * Older messages get lower priority
 */
export function prioritizeConversationHistory(messages, maxTokens) {
  if (!messages || messages.length === 0) return [];

  // Most recent messages are most important
  const prioritized = messages.map((msg, idx) => {
    const recency = (idx + 1) / messages.length; // 0 = oldest, 1 = newest
    const priority = 0.5 + (recency * 0.5); // 0.5 to 1.0
    return {
      ...msg,
      priority,
      tokens: estimateTokens(msg.content)
    };
  }).reverse(); // Newest first

  let remaining = maxTokens;
  const selected = [];

  for (const msg of prioritized) {
    if (msg.tokens <= remaining) {
      selected.push(msg);
      remaining -= msg.tokens;
    } else if (remaining > 50) {
      // Truncate last message to fit
      selected.push({
        ...msg,
        content: truncateToTokenBudget(msg.content, remaining - 20),
        truncated: true
      });
      break;
    }
  }

  // Return in chronological order
  return selected.reverse();
}

// Export constants for direct import
export { PRIORITY_WEIGHTS, CONTEXT_BUDGET };

export const tokenManager = {
  estimateTokens,
  truncateToTokenBudget,
  scoreRelevance,
  buildOptimizedContext,
  assembleContext,
  getBudgetAllocation,
  prioritizeConversationHistory,
  CONTEXT_BUDGET,
  PRIORITY_WEIGHTS
};

export default tokenManager;
