/**
 * System Knowledge Service
 * Provides Nova with comprehensive knowledge about LifeOS
 *
 * This service loads the structured knowledge base and provides
 * context-aware information about modules, features, and navigation.
 */

// Import all knowledge base files
import systemOverview from './knowledge_base/system_overview.json';
import dashboardModule from './knowledge_base/modules/dashboard.json';
import productivityModule from './knowledge_base/modules/productivity.json';
import healthModule from './knowledge_base/modules/health.json';
import knowledgeModule from './knowledge_base/modules/knowledge.json';
import journalModule from './knowledge_base/modules/journal.json';
import calendarModule from './knowledge_base/modules/calendar.json';
import skillsModule from './knowledge_base/modules/skills.json';
import financialModule from './knowledge_base/modules/financial.json';
import characterModule from './knowledge_base/modules/character.json';
import questsModule from './knowledge_base/modules/quests.json';
import socialModule from './knowledge_base/modules/social.json';
import settingsModule from './knowledge_base/modules/settings.json';
import navigationRoutes from './knowledge_base/navigation/routes.json';

// Compile all modules
const MODULES = {
  dashboard: dashboardModule,
  productivity: productivityModule,
  health: healthModule,
  knowledge: knowledgeModule,
  journal: journalModule,
  calendar: calendarModule,
  skills: skillsModule,
  financial: financialModule,
  character: characterModule,
  quests: questsModule,
  social: socialModule,
  settings: settingsModule
};

/**
 * Search keywords to module mapping
 */
const KEYWORD_MAP = {
  // Health keywords
  workout: 'health', exercise: 'health', gym: 'health', fitness: 'health',
  nutrition: 'health', meal: 'health', food: 'health', calories: 'health',
  macros: 'health', protein: 'health', sleep: 'health', cardio: 'health',
  supplements: 'health', weight: 'health',

  // Productivity keywords
  task: 'productivity', tasks: 'productivity', todo: 'productivity',
  project: 'productivity', projects: 'productivity', 'deep work': 'productivity',
  focus: 'productivity', pomodoro: 'productivity', productive: 'productivity',

  // Knowledge keywords
  book: 'knowledge', books: 'knowledge', reading: 'knowledge', read: 'knowledge',
  note: 'knowledge', notes: 'knowledge', idea: 'knowledge', ideas: 'knowledge',
  quote: 'knowledge', quotes: 'knowledge', learning: 'knowledge', learn: 'knowledge',

  // Journal keywords
  journal: 'journal', diary: 'journal', mood: 'journal', reflection: 'journal',
  gratitude: 'journal', entry: 'journal', entries: 'journal', write: 'journal',

  // Calendar keywords
  calendar: 'calendar', schedule: 'calendar', 'time block': 'calendar',
  event: 'calendar', events: 'calendar', appointment: 'calendar',

  // Skills keywords
  skill: 'skills', skills: 'skills', practice: 'skills', mastery: 'skills',

  // Financial keywords
  money: 'financial', budget: 'financial', expense: 'financial', expenses: 'financial',
  income: 'financial', spending: 'financial', savings: 'financial', 'net worth': 'financial',
  financial: 'financial', finance: 'financial',

  // Character keywords
  character: 'character', avatar: 'character', level: 'character',
  equipment: 'character', evolution: 'character', companion: 'character',
  pet: 'character', stats: 'character',

  // Quests keywords
  quest: 'quests', quests: 'quests', mission: 'quests', missions: 'quests',
  achievement: 'quests', achievements: 'quests', streak: 'quests', streaks: 'quests',
  daily: 'quests', badge: 'quests',

  // Social keywords
  friend: 'social', friends: 'social', guild: 'social', guilds: 'social',
  leaderboard: 'social', community: 'social', social: 'social',

  // Settings keywords
  settings: 'settings', preferences: 'settings', theme: 'settings',
  notification: 'settings', notifications: 'settings', account: 'settings'
};

/**
 * Detect which module a query is about
 */
export function detectModule(query) {
  const lowerQuery = query.toLowerCase();

  // Check for exact route matches
  for (const route of navigationRoutes.routes) {
    if (lowerQuery.includes(route.name.toLowerCase())) {
      return route.name.toLowerCase();
    }
  }

  // Check keyword map
  for (const [keyword, module] of Object.entries(KEYWORD_MAP)) {
    if (lowerQuery.includes(keyword)) {
      return module;
    }
  }

  return null;
}

/**
 * Get module information
 */
export function getModuleInfo(moduleName) {
  const module = MODULES[moduleName];
  if (!module) return null;

  return {
    name: module.name,
    route: module.route,
    purpose: module.purpose,
    features: module.key_features || module.tabs || [],
    commonActions: module.common_user_actions,
    tips: module.tips || []
  };
}

/**
 * Find answer to a navigation question
 */
export function findNavigationAnswer(query) {
  const lowerQuery = query.toLowerCase();

  // Check common questions
  for (const qa of navigationRoutes.common_questions) {
    const questionWords = qa.question.toLowerCase().split(' ');
    const matchCount = questionWords.filter(word =>
      lowerQuery.includes(word) && word.length > 2
    ).length;

    if (matchCount >= 2) {
      return qa.answer;
    }
  }

  // Check quick actions
  for (const action of navigationRoutes.quick_actions) {
    if (lowerQuery.includes(action.action.toLowerCase().split(' ').slice(0, 2).join(' '))) {
      return `You can ${action.action} in the ${MODULES[action.route.slice(1)]?.name || 'app'} module at ${action.route}${action.tab ? `, ${action.tab} tab` : ''}.`;
    }
  }

  return null;
}

/**
 * Build comprehensive system context for Nova
 * This is added to every Nova conversation
 */
export function buildSystemContext(query = '') {
  const detectedModule = detectModule(query);
  const navigationAnswer = findNavigationAnswer(query);

  let context = `
SYSTEM KNOWLEDGE - LifeOS Structure:

${systemOverview.description}

MODULES:
${Object.entries(MODULES).map(([key, mod]) =>
  `- ${mod.name} (${mod.route}): ${mod.purpose}`
).join('\n')}
`;

  // Add specific module details if detected
  if (detectedModule) {
    const moduleInfo = getModuleInfo(detectedModule);
    if (moduleInfo) {
      context += `

RELEVANT MODULE - ${moduleInfo.name}:
Route: ${moduleInfo.route}
Purpose: ${moduleInfo.purpose}

Features:
${moduleInfo.features.map(f =>
  typeof f === 'string' ? `- ${f}` : `- ${f.name}: ${f.description}`
).join('\n')}

Common Actions: ${moduleInfo.commonActions?.join(', ') || 'N/A'}

${moduleInfo.tips?.length ? `Tips: ${moduleInfo.tips.join(' | ')}` : ''}
`;
    }
  }

  // Add navigation answer if found
  if (navigationAnswer) {
    context += `

NAVIGATION ANSWER: ${navigationAnswer}
`;
  }

  return context;
}

/**
 * Get all routes for navigation assistance
 */
export function getAllRoutes() {
  return navigationRoutes.routes;
}

/**
 * Get quick actions list
 */
export function getQuickActions() {
  return navigationRoutes.quick_actions;
}

/**
 * Export service
 */
export const systemKnowledgeService = {
  detectModule,
  getModuleInfo,
  findNavigationAnswer,
  buildSystemContext,
  getAllRoutes,
  getQuickActions,
  systemOverview,
  modules: MODULES
};

export default systemKnowledgeService;
