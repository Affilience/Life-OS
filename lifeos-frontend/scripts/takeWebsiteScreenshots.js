/**
 * Take screenshots for the website
 * - Waits for actual content to load
 * - Sets up localStorage to bypass onboarding
 * - Takes high-quality screenshots
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PAGES = [
  { path: '/', name: 'dashboard', waitFor: '.dashboard, [class*="dashboard"], main' },
  { path: '/modules', name: 'modules', waitFor: '.modules, [class*="module"], main' },
  { path: '/character', name: 'character', waitFor: '.character, [class*="character"], canvas, main' },
  { path: '/productivity', name: 'productivity', waitFor: '.productivity, [class*="productivity"], main' },
  { path: '/health', name: 'health', waitFor: '.health, [class*="health"], main' },
  { path: '/journal', name: 'journal', waitFor: '.journal, [class*="journal"], main' },
  { path: '/skills', name: 'skills', waitFor: '.skills, [class*="skill"], main' },
  // Quests page with multiple tabs - handled specially (navigate once, cycle tabs)
  {
    path: '/quests',
    waitFor: 'main',
    tabs: [
      { name: 'quests', clickTab: 'Today' },
      { name: 'streaks', clickTab: 'Streaks' },
      { name: 'achievements', clickTab: 'Achievements' },
    ]
  },
  { path: '/rewards', name: 'rewards', waitFor: '.rewards, [class*="reward"], main' },
  { path: '/avatar', name: 'avatar-equipment', waitFor: 'canvas, .avatar, [class*="avatar"], main' },
  { path: '/calendar', name: 'calendar', waitFor: '.calendar, [class*="calendar"], main' },
  { path: '/financial', name: 'financial', waitFor: '.financial, [class*="financial"], main' },
];

// Output directly to website public assets
const SCREENSHOT_DIR = '../lifeos-website/public/assets/screenshots';

// Get today's date for tasks
const TODAY = new Date().toISOString().split('T')[0];
const NOW = new Date().toISOString();

// LocalStorage setup to bypass onboarding and all tours
const LOCALSTORAGE_SETUP = {
  // NEW onboarding store (key: lifeos-new-onboarding)
  'lifeos-new-onboarding': JSON.stringify({
    state: {
      currentStep: 'completed',
      isOnboardingActive: false,
      isOnboardingComplete: true,
      startedAt: '2024-01-01T00:00:00.000Z',
      completedAt: '2024-01-01T00:05:00.000Z',
      gamificationMode: 'cosmic',
      profile: {
        username: 'Explorer',
        displayName: 'Explorer',
        gender: 'male',
      },
      lifeGoals: ['productivity', 'health', 'learning', 'financial', 'mindfulness'],
      dailyCommitment: 30,
      moduleSetup: {
        health: { activityLevel: 'moderate' },
        financial: { currency: 'USD' },
        productivity: { workStyle: 'deep-work' },
        knowledge: { interests: ['technology', 'science'] },
      },
      tourCompleted: {
        xp: true,
        avatar: true,
        skills: true,
        bazaar: true,
        purchase: true,
      },
      invitedFriends: [],
      skippedSocial: true,
      novaState: 'celebrating',
      novaDialogueIndex: 0,
      skippedSteps: [],
      xpEarned: 500,
    },
    version: 1,
  }),
  // Gamification store with rich demo data
  'lifeos-gamification': JSON.stringify({
    state: {
      xp: 12500,
      level: 25,
      streakDays: 14,
      totalXPEarned: 35000,
      credits: 2500,
      currentEvolutionStage: 15,
      unlockedAchievements: ['first_task', 'early_bird', 'streak_7', 'streak_14', 'level_10', 'level_25'],
    },
    version: 0,
  }),
  // Avatar store with equipment - use correct item IDs matching equipmentDatabase.js
  'lifeos-avatar': JSON.stringify({
    state: {
      characterGender: 'male',
      evolutionStage: 15,
      equipped: {
        helmet: 'helmet_dragon',
        chest: 'chest_dragon',
        legs: 'legs_dragon',
        mainHand: 'weapon_dragon_blade',
        offHand: 'shield_dragon',
        cape: 'cape_dragon',
        ring1: null,
        ring2: null,
        amulet: 'amulet_celestial',
      },
      unlockedEquipment: [
        'helmet_dragon', 'chest_dragon', 'legs_dragon',
        'weapon_dragon_blade', 'shield_dragon', 'cape_dragon',
        'amulet_celestial', 'weapon_training_sword', 'shield_wooden_buckler',
        'helmet_cloth_cap', 'chest_cloth_tunic', 'cape_traveler',
        'helmet_training', 'helmet_iron', 'chest_chainmail',
      ],
    },
    version: 0,
  }),
  // Pet store - no active pet for clean screenshots
  'lifeos-pets': JSON.stringify({
    state: {
      activePet: null,
      activePets: [],
      unlockedPets: [],
    },
    version: 0,
  }),
  // Dashboard store - ensure widgets are visible
  'dashboard-storage': JSON.stringify({
    state: {
      isEditMode: false,
      widgetVisibility: {
        'hero-section': true,
        'today-schedule': true,
        'streak-flame': true,
        'weekly-progress': true,
        'recent-activity': true,
        'module-quick-access': true,
        'ai-insights': true,
        'bento-stats': true,
      },
    },
    version: 0,
  }),
  // Integrated onboarding store (legacy fallback)
  'lifeos-integrated-onboarding': JSON.stringify({
    state: {
      hasSeenWelcome: true,
      isOnboardingComplete: true,
      showNovaGuide: false,
    },
    version: 0,
  }),
  // Disable all page tours (13 tour keys)
  'lifeos-tour-dashboard': 'completed',
  'lifeos-tour-character': 'completed',
  'lifeos-tour-productivity': 'completed',
  'lifeos-tour-health': 'completed',
  'lifeos-tour-journal': 'completed',
  'lifeos-tour-skills': 'completed',
  'lifeos-tour-quests': 'completed',
  'lifeos-tour-rewards': 'completed',
  'lifeos-tour-avatar': 'completed',
  'lifeos-tour-calendar': 'completed',
  'lifeos-tour-financial': 'completed',
  'lifeos-tour-modules': 'completed',
  'lifeos-tour-social': 'completed',
  // Additional tour dismissal flags
  'tour-dismissed-dashboard': 'true',
  'tour-dismissed-character': 'true',
  'tour-dismissed-productivity': 'true',
  'tour-dismissed-health': 'true',
  'tour-dismissed-journal': 'true',
  'tour-dismissed-skills': 'true',
  'tour-dismissed-quests': 'true',
  'tour-dismissed-rewards': 'true',
  'tour-dismissed-all': 'true',
  // Quests store with demo quests
  'quests-storage': JSON.stringify({
    state: {
      weeklyQuests: {
        [new Date().toISOString().split('T')[0]]: [
          { id: 'workout_warrior', title: 'Workout Warrior', description: 'Complete 5 workouts this week', icon: '💪', module: 'health', difficulty: 'normal', requirement: { type: 'workouts', count: 5 }, progress: 3, completed: false, xpReward: 300, creditsReward: 150 },
          { id: 'reading_sprint', title: 'Reading Sprint', description: 'Read for 7 hours this week', icon: '📚', module: 'knowledge', difficulty: 'normal', requirement: { type: 'reading_hours', count: 7 }, progress: 5, completed: false, xpReward: 300, creditsReward: 150 },
          { id: 'deep_focus', title: 'Deep Focus Week', description: 'Log 20 hours of deep work', icon: '🎯', module: 'productivity', difficulty: 'hard', requirement: { type: 'deep_work_hours', count: 20 }, progress: 14, completed: false, xpReward: 500, creditsReward: 250 },
        ],
      },
      monthlyQuests: {},
      questChains: {
        fitness_mastery: { started: true, currentStep: 3, completedSteps: [1, 2], startedAt: '2024-01-01T00:00:00.000Z' },
        knowledge_seeker: { started: true, currentStep: 2, completedSteps: [1], startedAt: '2024-01-05T00:00:00.000Z' },
      },
      questStats: {
        totalQuestsCompleted: 47,
        weeklyQuestsCompleted: 12,
        monthlyQuestsCompleted: 3,
        chainsCompleted: 1,
        totalXPEarned: 15000,
        totalCreditsEarned: 7500,
        longestStreak: 14,
        currentStreak: 7,
      },
    },
    version: 0,
  }),
  // Daily tasks for the quests page - tasksByDate format with today's date
  'daily-tasks-storage': JSON.stringify({
    state: {
      tasksByDate: {
        [TODAY]: [
          { id: 'task-1', title: 'Morning workout - 30 min strength training', completed: true, category: 'health', xpReward: 50, order: 0, createdAt: NOW, completedAt: NOW },
          { id: 'task-2', title: 'Read "Atomic Habits" - Chapter 5', completed: true, category: 'knowledge', xpReward: 25, order: 1, createdAt: NOW, completedAt: NOW },
          { id: 'task-3', title: 'Write morning journal entry', completed: true, category: 'journal', xpReward: 25, order: 2, createdAt: NOW, completedAt: NOW },
          { id: 'task-4', title: 'Complete 4 deep work pomodoros', completed: false, category: 'productivity', xpReward: 60, order: 3, createdAt: NOW },
          { id: 'task-5', title: 'Log all expenses for today', completed: false, category: 'financial', xpReward: 20, order: 4, createdAt: NOW },
          { id: 'task-6', title: 'Practice meditation - 15 min', completed: true, category: 'health', xpReward: 30, order: 5, createdAt: NOW, completedAt: NOW },
          { id: 'task-7', title: 'Review and plan weekly goals', completed: false, category: 'productivity', xpReward: 25, order: 6, createdAt: NOW },
          { id: 'task-8', title: 'Take daily vitamins & supplements', completed: true, category: 'health', xpReward: 10, order: 7, createdAt: NOW, completedAt: NOW },
          { id: 'task-9', title: 'Drink 8 glasses of water', completed: false, category: 'health', xpReward: 15, order: 8, createdAt: NOW },
          { id: 'task-10', title: 'Evening reflection & plan tomorrow', completed: false, category: 'productivity', xpReward: 20, order: 9, createdAt: NOW },
          { id: 'task-11', title: 'Practice Spanish on Duolingo', completed: true, category: 'knowledge', xpReward: 20, order: 10, createdAt: NOW, completedAt: NOW },
          { id: 'task-12', title: 'Review code for side project', completed: false, category: 'productivity', xpReward: 40, order: 11, createdAt: NOW },
        ],
      },
      templates: [],
    },
    version: 0,
  }),
};

async function takeScreenshots() {
  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-web-security', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2, // High DPI for crisp screenshots
  });

  const page = await context.newPage();

  // Inject CSS to hide navbar/sidebar/tours IMMEDIATELY before any navigation
  // This prevents any flash of navbar content and tour overlays
  // IMPORTANT: Be specific to avoid hiding elements with data-tour attributes
  const hideNavCSS = `
    header, nav, aside,
    [class*="sidebar"], [class*="Sidebar"],
    [class*="navbar"], [class*="Navbar"],
    [class*="top-bar"], [class*="TopBar"],
    [class*="side-nav"], [class*="SideNav"],
    .fixed.top-0, .fixed.left-0,
    [class*="bottom-nav"], [class*="BottomNav"],
    /* Tour and modal overlays - be specific with class names */
    .tour-prompt-backdrop,
    .tour-overlay,
    .tour-modal,
    .feature-tour,
    .FeatureTour,
    [class*="backdrop"]:not([data-tour]),
    [class*="Backdrop"]:not([data-tour]),
    [class*="overlay"]:not([data-tour]),
    [class*="Overlay"]:not([data-tour]),
    [role="dialog"],
    [class*="onboarding"], [class*="Onboarding"],
    .nova-guide, .NovaGuide, .nova-widget, .NovaWidget {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    /* Critical: Remove main content margin from sidebar */
    main, main.md\\:ml-\\[250px\\], [class*="md:ml-[250px]"] {
      margin-left: 0 !important;
      padding-left: 0 !important;
      padding-top: 0 !important;
      max-width: 100vw !important;
      width: 100vw !important;
    }
    /* Catch all margin-left utilities */
    [class*="md:ml-"], [class*="ml-64"], [class*="ml-["], [class*="mt-16"], [class*="pt-16"] {
      margin-left: 0 !important;
      margin-top: 0 !important;
      padding-top: 0 !important;
    }
    /* Ensure page content fills viewport */
    .space-y-8, [class*="page"], [class*="Page"] {
      width: 100% !important;
      max-width: 100% !important;
      padding-left: 24px !important;
      padding-right: 24px !important;
    }
  `;

  // Helper function to remove tour overlays via JavaScript (not tour-marked elements)
  const removeTourElements = async () => {
    await page.evaluate(() => {
      // Remove only tour overlay/backdrop elements, NOT elements with data-tour attributes
      const tourOverlays = document.querySelectorAll(
        '.tour-prompt-backdrop, .tour-overlay, .tour-modal, ' +
        '.feature-tour, .FeatureTour, ' +
        '.nova-guide, .NovaGuide, .nova-widget, .NovaWidget'
      );
      tourOverlays.forEach(el => el.remove());

      // Also remove elements with role="dialog" (modals)
      document.querySelectorAll('[role="dialog"]').forEach(el => el.remove());
    });
  };

  // Add CSS before any page load
  await page.addStyleTag({ content: hideNavCSS });

  // Set up localStorage before navigating
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });

  // Re-inject CSS after navigation (styles don't persist across navigations)
  await page.addStyleTag({ content: hideNavCSS });

  // Set localStorage
  for (const [key, value] of Object.entries(LOCALSTORAGE_SETUP)) {
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
  }

  console.log('✅ LocalStorage configured');
  console.log('📸 Starting screenshot capture...\n');

  // Helper function to hide UI elements and prepare for screenshot
  const prepareForScreenshot = async () => {
    // Click any dismiss/skip buttons for tour modals
    try {
      const dismissButtons = await page.$$('button:has-text("Skip"), button:has-text("Don\'t Show"), button:has-text("Close"), [aria-label="Close"]');
      for (const btn of dismissButtons) {
        await btn.click().catch(() => {});
      }
    } catch {}

    // Hide sidebar, navbar, modals, loading overlays, tour elements, and onboarding components
    await page.evaluate(() => {
      // IMPORTANT: Hide the sidebar completely for clean screenshots
      const sidebars = document.querySelectorAll('[class*="sidebar"], [class*="Sidebar"], nav[class*="md:flex"], aside, [class*="side-nav"], [class*="SideNav"]');
      sidebars.forEach(el => el.style.display = 'none');

      // IMPORTANT: Hide the top navbar/header for clean screenshots
      const navbars = document.querySelectorAll('header, [class*="navbar"], [class*="Navbar"], [class*="top-bar"], [class*="TopBar"], [class*="header"], [class*="Header"], nav.fixed.top-0, [class*="page-header"], [class*="PageHeader"]');
      navbars.forEach(el => {
        if (el.tagName === 'HEADER' || el.classList.toString().includes('nav') || el.classList.toString().includes('Nav') || el.classList.toString().includes('bar') || el.classList.toString().includes('Bar')) {
          el.style.display = 'none';
        }
      });

      // CRITICAL: Remove left margin/padding from main content that accounts for sidebar
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.marginLeft = '0';
        mainContent.style.marginRight = '0';
        mainContent.style.paddingLeft = '0';
        mainContent.style.paddingRight = '0';
        mainContent.style.paddingTop = '0';
        mainContent.style.maxWidth = '100vw';
        mainContent.style.width = '100vw';
        mainContent.classList.forEach(cls => {
          if (cls.includes('ml-') || cls.includes('md:ml-')) {
            mainContent.classList.remove(cls);
          }
        });
      }

      // Remove top padding from page containers
      const pageContainers = document.querySelectorAll('[class*="page"], [class*="Page"], [class*="container"], [class*="Container"]');
      pageContainers.forEach(el => {
        const computed = window.getComputedStyle(el);
        if (parseInt(computed.paddingTop) > 50) {
          el.style.paddingTop = '16px';
        }
      });

      // Also handle the layout wrapper - be very aggressive
      document.querySelectorAll('*').forEach(el => {
        const computed = window.getComputedStyle(el);
        if (parseInt(computed.marginLeft) > 200) {
          el.style.marginLeft = '0';
        }
      });

      // Hide loading elements
      document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="loader"], [class*="Loading"]').forEach(el => el.style.display = 'none');

      // Hide tour modals and onboarding components
      document.querySelectorAll('[class*="modal"], [class*="Modal"], [class*="tour"], [class*="Tour"], [class*="overlay"], [class*="Overlay"], [role="dialog"], [class*="onboarding"], [class*="Onboarding"], [class*="nova-guide"], [class*="NovaGuide"], [class*="feature-tour"], [class*="FeatureTour"]').forEach(el => el.style.display = 'none');

      // Remove any backdrop/overlay
      document.querySelectorAll('[class*="backdrop"], [class*="Backdrop"], [class*="dimmer"], [class*="Dimmer"]').forEach(el => el.style.display = 'none');

      // Hide Nova widget (AI companion)
      document.querySelectorAll('[class*="nova"], [class*="Nova"]').forEach(el => {
        if (el.classList.toString().includes('Widget') || el.classList.toString().includes('Guide')) {
          el.style.display = 'none';
        }
      });

      // Hide toast notifications
      document.querySelectorAll('[class*="toast"], [class*="Toast"], [class*="notification"], [class*="Notification"]').forEach(el => el.style.display = 'none');

      // Hide any fixed bottom elements (except navigation)
      document.querySelectorAll('.fixed[class*="bottom"]').forEach(el => {
        if (!el.classList.toString().includes('Nav') && !el.classList.toString().includes('nav')) {
          el.style.display = 'none';
        }
      });

      // Hide mobile bottom navigation for cleaner screenshots
      document.querySelectorAll('[class*="bottom-nav"], [class*="BottomNav"], nav.fixed.bottom-0').forEach(el => el.style.display = 'none');

      // Ensure page content containers are properly sized
      document.querySelectorAll('.space-y-8, .space-y-6, [class*="animate-fade-in"]').forEach(el => {
        el.style.width = '100%';
        el.style.maxWidth = '100%';
        el.style.paddingLeft = '24px';
        el.style.paddingRight = '24px';
      });
    });

    await page.waitForTimeout(500);
  };

  // Helper function to click a tab
  const clickTab = async (tabText) => {
    await page.evaluate(() => {
      document.querySelectorAll('.tour-prompt-backdrop, [role="dialog"]').forEach(el => el.remove());
    });

    const clicked = await page.evaluate((text) => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.includes(text)) {
          btn.click();
          return btn.textContent?.trim();
        }
      }
      return null;
    }, tabText);

    if (clicked) {
      console.log(`   📑 Clicked tab: "${clicked}"`);
      await page.waitForTimeout(1500);
    } else {
      console.log(`   ⚠️ Tab not found: ${tabText}`);
    }
    return clicked;
  };

  // Main capture loop
  for (const route of PAGES) {
    const url = `http://localhost:5173${route.path}`;

    try {
      // Handle pages with multiple tabs (like /quests)
      if (route.tabs) {
        console.log(`📷 Capturing: ${route.path} (with ${route.tabs.length} tabs)`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await removeTourElements();
        // DON'T apply hideNavCSS yet - we need tabs visible for clicking

        try {
          await page.waitForSelector(route.waitFor, { timeout: 8000 });
        } catch {
          console.log(`   ⚠️ Primary selector not found, waiting for any content...`);
        }

        await page.waitForTimeout(2000);

        // Cycle through each tab
        for (const tab of route.tabs) {
          console.log(`   📍 Tab: ${tab.name}`);
          // Click the tab FIRST (before any CSS changes)
          await clickTab(tab.clickTab);
          await page.waitForTimeout(2000); // Wait for content to render

          // Use CSS-only approach for tab pages to preserve React state
          await page.addStyleTag({ content: `
            aside, [class*="sidebar"], [class*="Sidebar"],
            .fixed.left-0, [class*="side-nav"],
            .tour-prompt-backdrop, [role="dialog"],
            .nova-guide, .nova-widget, header, nav,
            [class*="navbar"], [class*="Navbar"],
            [class*="bottom-nav"], .fixed.bottom-0 {
              display: none !important;
            }
            main {
              margin-left: 0 !important;
              margin-top: 0 !important;
              padding-left: 0 !important;
              padding-top: 0 !important;
              width: 100vw !important;
              max-width: 100vw !important;
            }
            [class*="md:ml-"], [class*="ml-64"], [class*="ml-["] {
              margin-left: 0 !important;
            }
          `});
          await page.waitForTimeout(500);

          const filepath = path.join(SCREENSHOT_DIR, `${tab.name}.png`);
          await page.screenshot({ path: filepath, fullPage: false });
          console.log(`   ✅ Saved: ${tab.name}.png`);

          // Reload page for next tab to get fresh state
          if (route.tabs.indexOf(tab) < route.tabs.length - 1) {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            await removeTourElements();
            await page.waitForTimeout(1500);
          }
        }
      } else {
        // Regular page without tabs
        const filename = `${route.name}.png`;
        const filepath = path.join(SCREENSHOT_DIR, filename);

        console.log(`📷 Capturing: ${route.name} (${route.path})`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await removeTourElements();
        await page.addStyleTag({ content: hideNavCSS });
        await removeTourElements();

        try {
          await page.waitForSelector(route.waitFor, { timeout: 8000 });
        } catch {
          console.log(`   ⚠️ Primary selector not found, waiting for any content...`);
        }

        await page.waitForTimeout(2000);
        await prepareForScreenshot();

        await page.screenshot({ path: filepath, fullPage: false });
        console.log(`   ✅ Saved: ${filename}`);
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${route.name || route.path} - ${error.message}`);
    }
  }

  await browser.close();
  console.log('\n✨ Screenshot capture complete!');
  console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}/`);
}

takeScreenshots().catch(console.error);
