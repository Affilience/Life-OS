/**
 * Transaction Parser - AI-powered natural language transaction parsing
 * Handles inputs like: "spent $45 on groceries at Whole Foods"
 * Extracts: amount, merchant, category, type
 */

import { CATEGORIES } from '../data/financialData';

/**
 * Parse natural language transaction input
 * @param {string} input - Natural language description
 * @returns {object} Parsed transaction details
 */
export function parseTransaction(input) {
  if (!input || input.trim().length === 0) {
    return null;
  }

  const text = input.toLowerCase().trim();

  // Parse amount
  const amount = extractAmount(text);
  if (!amount) {
    return null;
  }

  // Determine transaction type
  const type = determineType(text);

  // Extract merchant
  const merchant = extractMerchant(text);

  // Detect category
  const category = detectCategory(text);

  // Generate description
  const description = generateDescription(text, merchant, category);

  return {
    amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
    type,
    merchant: merchant || 'Unknown',
    category: category || (type === 'expense' ? 'other' : 'other_income'),
    description,
  };
}

/**
 * Extract amount from text
 */
function extractAmount(text) {
  // Match patterns like: $45, 45 dollars, 45.50, $1,234.56
  const patterns = [
    /\$\s*([0-9,]+\.?[0-9]*)/,  // $45.50
    /([0-9,]+\.?[0-9]*)\s*dollars?/,  // 45 dollars
    /([0-9,]+\.?[0-9]*)\s*bucks?/,  // 45 bucks
    /([0-9,]+\.?[0-9]*)\s*usd/,  // 45 usd
    /(?:spent|paid|cost|earned|received|got)\s+([0-9,]+\.?[0-9]*)/,  // spent 45
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0) {
        return num;
      }
    }
  }

  return null;
}

/**
 * Determine if transaction is income or expense
 */
function determineType(text) {
  const incomeKeywords = [
    'earned',
    'received',
    'got',
    'income',
    'salary',
    'paycheck',
    'bonus',
    'refund',
    'cashback',
    'freelance',
    'payment received',
    'deposit',
  ];

  const expenseKeywords = [
    'spent',
    'paid',
    'bought',
    'purchase',
    'cost',
    'charged',
    'withdrawal',
  ];

  // Check income keywords first (more specific)
  for (const keyword of incomeKeywords) {
    if (text.includes(keyword)) {
      return 'income';
    }
  }

  // Default to expense
  return 'expense';
}

/**
 * Extract merchant name
 */
function extractMerchant(text) {
  // Patterns to extract merchant
  const patterns = [
    /(?:at|from)\s+([A-Za-z0-9\s&'-]+?)(?:\s+(?:for|on|in|$))/i,  // "at Whole Foods for"
    /(?:at|from)\s+([A-Za-z0-9\s&'-]+?)$/i,  // "at Whole Foods"
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let merchant = match[1].trim();
      // Capitalize first letter of each word
      merchant = merchant
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return merchant;
    }
  }

  return null;
}

/**
 * Detect category based on keywords
 */
function detectCategory(text) {
  // Check each category's keywords
  const categoryScores = {};

  Object.entries(CATEGORIES).forEach(([categoryId, categoryData]) => {
    let score = 0;

    // Check keywords
    categoryData.keywords.forEach((keyword) => {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });

    // Check category name
    if (text.includes(categoryData.name.toLowerCase())) {
      score += 2;
    }

    if (score > 0) {
      categoryScores[categoryId] = score;
    }
  });

  // Return category with highest score
  if (Object.keys(categoryScores).length > 0) {
    return Object.entries(categoryScores).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )[0];
  }

  return null;
}

/**
 * Generate clean description
 */
function generateDescription(text, merchant, category) {
  // If we have a merchant, use it
  if (merchant) {
    return merchant;
  }

  // Otherwise, extract a meaningful description
  // Remove common prefixes
  let description = text
    .replace(/^(spent|paid|bought|earned|received|got)\s+/i, '')
    .replace(/\$\s*[0-9,]+\.?[0-9]*/g, '')
    .replace(/[0-9,]+\.?[0-9]*\s*(dollars?|bucks?|usd)/gi, '')
    .replace(/\s+on\s+/gi, ' ')
    .replace(/\s+at\s+/gi, ' ')
    .replace(/\s+for\s+/gi, ' ')
    .trim();

  // Capitalize first letter
  if (description.length > 0) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  // If description is still empty, use category name
  if (!description && category) {
    description = CATEGORIES[category]?.name || 'Transaction';
  }

  return description || 'Transaction';
}

/**
 * Validate parsed transaction
 */
export function validateTransaction(parsed) {
  if (!parsed) return false;
  if (!parsed.amount || parsed.amount === 0) return false;
  if (!parsed.type) return false;
  return true;
}

/**
 * Get parsing suggestions based on input
 */
export function getParsingHints(input) {
  const hints = [];

  if (!input || input.trim().length === 0) {
    return ['Try: "spent $45 on groceries at Whole Foods"'];
  }

  const text = input.toLowerCase();

  // Check if amount is present
  if (!extractAmount(text)) {
    hints.push('Add an amount (e.g., $45 or 45 dollars)');
  }

  // Check if merchant is present
  if (!extractMerchant(text)) {
    hints.push('Add merchant name (e.g., "at Starbucks")');
  }

  // Check if category keywords are present
  if (!detectCategory(text)) {
    hints.push('Add category keywords (e.g., "groceries", "restaurant")');
  }

  return hints;
}

/**
 * Format examples for user guidance
 */
export const TRANSACTION_EXAMPLES = [
  'spent $45 on groceries at Whole Foods',
  'paid $1800 for rent',
  'earned $5000 salary from employer',
  'bought $42.99 books on Amazon',
  'received $150 freelance payment',
  '$6.75 coffee at Starbucks',
  'paid $50 gym membership',
  'spent $68 on dinner at restaurant',
  'received $25 cashback',
  'paid $15.99 for Netflix subscription',
];
