/**
 * Demo Data Population Utility
 * Run this from the browser console to populate stores with sample data for screenshots
 *
 * Usage: Open dev console and run:
 * import('/src/utils/populateDemoData.js').then(m => m.populateDemoData())
 */

// Helper to generate dates in the last N days
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const today = new Date().toISOString().split('T')[0];

export const populateDemoData = async () => {
  console.log('🚀 Populating demo data for module health...');

  try {
    // Import stores dynamically
    const { useHealthStore } = await import('../stores/healthStore');
    const { default: useProductivityStore } = await import('../stores/productivityStore');
    const { useKnowledgeStore } = await import('../stores/knowledgeStore');
    const { useFinancialStore } = await import('../stores/financialStore');
    const { useCalendarStore } = await import('../stores/calendarStore');
    const { default: useSkillsStore } = await import('../stores/skillsStore');
    const { useWorkoutStore } = await import('../stores/workoutStore');
    const { useAvatarStore } = await import('../stores/avatarStore');

    // 1. Health Store - Add meals for last 7 days (target: 21 meals/week)
    const healthStore = useHealthStore.getState();
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const sampleMeals = [];

    for (let day = 0; day < 7; day++) {
      for (const mealType of mealTypes) {
        sampleMeals.push({
          id: `demo-meal-${day}-${mealType}`,
          timestamp: daysAgo(day),
          type: mealType,
          items: [{ name: 'Sample meal', calories: 500 }],
          totalCalories: 500,
          totalProtein: 30,
          totalCarbs: 50,
          totalFat: 15,
        });
      }
    }

    useHealthStore.setState({ meals: [...sampleMeals, ...(healthStore.meals || [])] });
    console.log('✅ Health: Added 21 meals for last 7 days');

    // 2. Productivity Store - Add completed tasks and sessions
    const productivityStore = useProductivityStore.getState();
    const sampleTasks = [];
    const sampleSessions = [];

    for (let i = 0; i < 5; i++) {
      sampleTasks.push({
        id: `demo-task-${i}`,
        title: `Completed task ${i + 1}`,
        status: 'done',
        completedAt: daysAgo(i),
        priority: ['high', 'medium', 'low'][i % 3],
      });

      sampleSessions.push({
        id: `demo-session-${i}`,
        type: 'deep-work',
        startTime: daysAgo(i),
        endTime: daysAgo(i),
        duration: 3600,
        focusQuality: 8,
      });
    }

    useProductivityStore.setState({
      tasks: [...sampleTasks, ...(productivityStore.tasks || [])],
      sessions: [...sampleSessions, ...(productivityStore.sessions || [])],
    });
    console.log('✅ Productivity: Added 5 tasks and 5 sessions');

    // 3. Knowledge Store - Add notes and ideas
    const knowledgeStore = useKnowledgeStore.getState();
    const sampleNotes = [];
    const sampleIdeas = [];

    for (let i = 0; i < 5; i++) {
      sampleNotes.push({
        id: `demo-note-${i}`,
        title: `Sample Note ${i + 1}`,
        content: 'Demo content for screenshot',
        createdAt: daysAgo(i),
        dateCreated: daysAgo(i),
      });

      sampleIdeas.push({
        id: `demo-idea-${i}`,
        title: `Sample Idea ${i + 1}`,
        createdAt: daysAgo(i),
      });
    }

    useKnowledgeStore.setState({
      notes: [...sampleNotes, ...(knowledgeStore.notes || [])],
      ideas: [...sampleIdeas, ...(knowledgeStore.ideas || [])],
      contentItems: [{ id: 'demo-content', status: 'in_progress' }],
    });
    console.log('✅ Knowledge: Added 5 notes and 5 ideas');

    // 4. Avatar Store - Add journal stats
    const avatarStore = useAvatarStore.getState();
    const updatedModuleProgress = {
      ...(avatarStore.moduleProgress || {}),
      journal: {
        entriesWritten: 25,
        journalStreak: 7,
      },
    };

    useAvatarStore.setState({
      moduleProgress: updatedModuleProgress,
    });
    // Also set as stats for backward compatibility
    useAvatarStore.setState(state => ({
      ...state,
      stats: {
        ...(state.stats || {}),
        journal: updatedModuleProgress.journal,
      },
    }));
    console.log('✅ Journal: Set 25 entries and 7-day streak');

    // 5. Financial Store - Add transactions and budgets
    const financialStore = useFinancialStore.getState();
    const sampleTransactions = [];

    for (let i = 0; i < 10; i++) {
      sampleTransactions.push({
        id: `demo-transaction-${i}`,
        date: daysAgo(i * 2),
        amount: 50 + (i * 10),
        category: 'groceries',
        description: `Sample transaction ${i + 1}`,
      });
    }

    const sampleBudgets = [{
      id: 'demo-budget',
      name: 'Monthly Budget',
      amount: 2000,
      spent: 1200,
    }];

    useFinancialStore.setState({
      transactions: [...sampleTransactions, ...(financialStore.transactions || [])],
      budgets: [...sampleBudgets, ...(financialStore.budgets || [])],
    });
    console.log('✅ Finance: Added 10 transactions and 1 budget');

    // 6. Calendar Store - Add time blocks
    const calendarStore = useCalendarStore.getState();
    const sampleTimeBlocks = [];

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const blockDate = new Date(startOfWeek);
      blockDate.setDate(blockDate.getDate() + i);

      sampleTimeBlocks.push({
        id: `demo-block-${i}`,
        date: blockDate.toISOString().split('T')[0],
        title: `Time block ${i + 1}`,
        status: i < 5 ? 'completed' : 'planned',
        startTime: '09:00',
        endTime: '10:00',
      });
    }

    useCalendarStore.setState({
      timeBlocks: [...sampleTimeBlocks, ...(calendarStore.timeBlocks || [])],
    });
    console.log('✅ Calendar: Added 7 time blocks (5 completed)');

    // 7. Skills Store - Add skills with recent sessions
    const skillsStore = useSkillsStore.getState();
    const sampleSkills = [];

    const skillNames = ['Coding', 'Design', 'Writing'];
    for (let i = 0; i < 3; i++) {
      sampleSkills.push({
        id: `demo-skill-${i}`,
        name: skillNames[i],
        sessions: [
          { id: `demo-skill-session-${i}-1`, date: daysAgo(1), duration: 60 },
          { id: `demo-skill-session-${i}-2`, date: daysAgo(3), duration: 45 },
        ],
      });
    }

    useSkillsStore.setState({
      skills: [...sampleSkills, ...(skillsStore.skills || [])],
    });
    console.log('✅ Skills: Added 3 skills with recent practice');

    // 8. Workout Store - Add workouts (target: 4/week)
    const workoutStore = useWorkoutStore.getState();
    const sampleWorkouts = [];

    for (let i = 0; i < 4; i++) {
      sampleWorkouts.push({
        id: `demo-workout-${i}`,
        date: daysAgo(i),
        name: `Workout ${i + 1}`,
        duration: 60,
        exercises: [],
      });
    }

    useWorkoutStore.setState({
      workouts: [...sampleWorkouts, ...(workoutStore.workouts || [])],
    });
    console.log('✅ Fitness: Added 4 workouts for this week');

    console.log('\n🎉 Demo data populated! Refresh the dashboard to see updated module health scores.');

    return true;
  } catch (error) {
    console.error('❌ Error populating demo data:', error);
    return false;
  }
};

// Also export a cleanup function
export const clearDemoData = async () => {
  console.log('🧹 Clearing demo data...');

  try {
    const { useHealthStore } = await import('../stores/healthStore');
    const { default: useProductivityStore } = await import('../stores/productivityStore');
    const { useKnowledgeStore } = await import('../stores/knowledgeStore');
    const { useFinancialStore } = await import('../stores/financialStore');
    const { useCalendarStore } = await import('../stores/calendarStore');
    const { default: useSkillsStore } = await import('../stores/skillsStore');
    const { useWorkoutStore } = await import('../stores/workoutStore');

    // Filter out demo data (items with id starting with 'demo-')
    const filterDemo = (items) => (items || []).filter(item => !item.id?.startsWith('demo-'));

    useHealthStore.setState(state => ({ meals: filterDemo(state.meals) }));
    useProductivityStore.setState(state => ({
      tasks: filterDemo(state.tasks),
      sessions: filterDemo(state.sessions),
    }));
    useKnowledgeStore.setState(state => ({
      notes: filterDemo(state.notes),
      ideas: filterDemo(state.ideas),
      contentItems: filterDemo(state.contentItems),
    }));
    useFinancialStore.setState(state => ({
      transactions: filterDemo(state.transactions),
      budgets: filterDemo(state.budgets),
    }));
    useCalendarStore.setState(state => ({ timeBlocks: filterDemo(state.timeBlocks) }));
    useSkillsStore.setState(state => ({ skills: filterDemo(state.skills) }));
    useWorkoutStore.setState(state => ({ workouts: filterDemo(state.workouts) }));

    console.log('✅ Demo data cleared!');
    return true;
  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
    return false;
  }
};

// Make it available globally for easy console access
if (typeof window !== 'undefined') {
  window.populateDemoData = populateDemoData;
  window.clearDemoData = clearDemoData;
}
