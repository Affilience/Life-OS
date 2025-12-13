import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Heart, Wallet, Zap, BookOpen,
  Dumbbell, Scale, Moon, DollarSign, PiggyBank, TrendingUp,
  Clock, ListTodo, Brain, GraduationCap
} from 'lucide-react';
import { useNewOnboardingStore, LIFE_GOALS } from '../../../stores/newOnboardingStore';

// Quick setup questions per module (2-3 max per module)
const MODULE_QUESTIONS = {
  health: {
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    title: 'Health Setup',
    questions: [
      {
        id: 'primary_goal',
        question: 'Primary health goal?',
        options: [
          { value: 'lose_weight', label: 'Lose Weight', icon: Scale },
          { value: 'build_muscle', label: 'Build Muscle', icon: Dumbbell },
          { value: 'improve_energy', label: 'More Energy', icon: Zap },
          { value: 'better_sleep', label: 'Better Sleep', icon: Moon },
        ],
      },
      {
        id: 'activity_level',
        question: 'Current activity level?',
        options: [
          { value: 'sedentary', label: 'Sedentary' },
          { value: 'light', label: 'Light Activity' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'very_active', label: 'Very Active' },
        ],
      },
    ],
  },
  financial: {
    icon: Wallet,
    color: 'from-green-500 to-emerald-500',
    title: 'Financial Setup',
    questions: [
      {
        id: 'primary_goal',
        question: 'Main financial goal?',
        options: [
          { value: 'save_more', label: 'Save More', icon: PiggyBank },
          { value: 'track_spending', label: 'Track Spending', icon: DollarSign },
          { value: 'grow_wealth', label: 'Grow Wealth', icon: TrendingUp },
          { value: 'reduce_debt', label: 'Reduce Debt', icon: Scale },
        ],
      },
      {
        id: 'budget_style',
        question: 'Preferred tracking style?',
        options: [
          { value: 'detailed', label: 'Detailed Categories' },
          { value: 'simple', label: 'Simple Overview' },
          { value: 'goals_focused', label: 'Goal-Focused' },
        ],
      },
    ],
  },
  productivity: {
    icon: Zap,
    color: 'from-orange-500 to-amber-500',
    title: 'Productivity Setup',
    questions: [
      {
        id: 'work_style',
        question: 'How do you work best?',
        options: [
          { value: 'deep_work', label: 'Deep Focus Sessions', icon: Brain },
          { value: 'pomodoro', label: 'Pomodoro Technique', icon: Clock },
          { value: 'task_batching', label: 'Task Batching', icon: ListTodo },
        ],
      },
      {
        id: 'peak_hours',
        question: 'When are you most productive?',
        options: [
          { value: 'morning', label: 'Morning (6am-12pm)' },
          { value: 'afternoon', label: 'Afternoon (12pm-6pm)' },
          { value: 'evening', label: 'Evening (6pm-12am)' },
          { value: 'varies', label: 'It Varies' },
        ],
      },
    ],
  },
  knowledge: {
    icon: BookOpen,
    color: 'from-blue-500 to-cyan-500',
    title: 'Learning Setup',
    questions: [
      {
        id: 'learning_style',
        question: 'Preferred way to learn?',
        options: [
          { value: 'reading', label: 'Books & Articles', icon: BookOpen },
          { value: 'video', label: 'Videos & Courses', icon: GraduationCap },
          { value: 'practice', label: 'Hands-on Practice', icon: Zap },
          { value: 'mixed', label: 'Mix of Everything', icon: Brain },
        ],
      },
    ],
  },
};

export default function ModuleSetupStep({ onNext, onPrev, onSkip, canSkip, isTransitioning }) {
  const {
    lifeGoals,
    moduleSetup,
    updateModuleSetup,
    isDialogueComplete,
    setNovaState,
    addOnboardingXP,
    getModulesToSetup,
  } = useNewOnboardingStore();

  // Get modules to setup based on selected life goals
  const modulesToSetup = useMemo(() => {
    const modules = getModulesToSetup();
    // Filter to only modules that have questions defined
    return modules.filter(m => MODULE_QUESTIONS[m]);
  }, [lifeGoals]);

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [answers, setAnswers] = useState(moduleSetup || {});

  const dialogueComplete = isDialogueComplete();

  // If no modules to setup, skip this step
  if (modulesToSetup.length === 0 && dialogueComplete) {
    return (
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-4">All Set!</h1>
          <p className="text-white/60 mb-8">Your modules are ready to go.</p>
          <motion.button
            onClick={onNext}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            <span>Continue</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentModule = modulesToSetup[currentModuleIndex];
  const moduleConfig = MODULE_QUESTIONS[currentModule];
  const currentAnswers = answers[currentModule] || {};

  const handleSelectOption = (questionId, value) => {
    const newAnswers = {
      ...answers,
      [currentModule]: {
        ...currentAnswers,
        [questionId]: value,
      },
    };
    setAnswers(newAnswers);
    updateModuleSetup(currentModule, newAnswers[currentModule]);
    setNovaState('excited');
  };

  const handleNextModule = () => {
    if (currentModuleIndex < modulesToSetup.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
      setNovaState('thinking');
    } else {
      // All modules done
      addOnboardingXP(20);
      onNext();
    }
  };

  const handlePrevModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(prev => prev - 1);
    } else {
      onPrev();
    }
  };

  // Check if current module is complete (at least one answer)
  const isModuleComplete = moduleConfig?.questions.some(q => currentAnswers[q.id]);

  if (!moduleConfig) return null;

  const Icon = moduleConfig.icon;

  return (
    <div className="flex flex-col items-center">
      {/* Module indicator */}
      {dialogueComplete && modulesToSetup.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-6"
        >
          {modulesToSetup.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentModuleIndex
                  ? 'w-6 bg-purple-500'
                  : index < currentModuleIndex
                  ? 'bg-green-500'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </motion.div>
      )}

      {/* Title */}
      {dialogueComplete && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br ${moduleConfig.color}`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {moduleConfig.title}
          </h1>
          <p className="text-white/60">
            Quick setup to personalize your experience
          </p>
        </motion.div>
      )}

      {/* Questions */}
      {dialogueComplete && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentModule}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-2xl space-y-8"
          >
            {moduleConfig.questions.map((question, qIndex) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIndex * 0.1 }}
              >
                <h3 className="text-lg font-medium text-white mb-4 text-center">
                  {question.question}
                </h3>

                <div className={`grid gap-3 ${
                  question.options.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
                }`}>
                  {question.options.map((option) => {
                    const OptionIcon = option.icon;
                    const isSelected = currentAnswers[question.id] === option.value;

                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectOption(question.id, option.value)}
                        className={`
                          p-4 rounded-xl text-center transition-all duration-200
                          ${isSelected
                            ? `bg-gradient-to-br ${moduleConfig.color} border-2 border-white/30`
                            : 'bg-[#1a1724]/80 border border-white/10 hover:border-white/20'
                          }
                        `}
                      >
                        {OptionIcon && (
                          <OptionIcon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-white/60'}`} />
                        )}
                        <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                          {option.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6">
              <button
                onClick={handlePrevModule}
                className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-3">
                {canSkip && (
                  <button
                    onClick={onSkip}
                    className="px-4 py-2 text-white/40 hover:text-white/60 transition-colors text-sm"
                  >
                    Skip All
                  </button>
                )}

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleNextModule}
                  disabled={isTransitioning}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                    transition-all duration-200
                    ${isModuleComplete
                      ? `bg-gradient-to-r ${moduleConfig.color} text-white hover:shadow-lg hover:scale-[1.02]`
                      : 'bg-white/10 text-white/50 hover:bg-white/20'
                    }
                  `}
                >
                  <span>
                    {currentModuleIndex < modulesToSetup.length - 1 ? 'Next Module' : 'Continue'}
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
