/**
 * AddResolutionModal - Multi-step wizard for creating SMART resolutions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Target,
  Heart,
  Briefcase,
  BookOpen,
  DollarSign,
  Users,
  Palette,
  Brain,
  Repeat,
  Sparkles,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { RESOLUTION_CATEGORIES, useResolutionStore } from '../../stores/resolutionStore';
import { triggerGamification } from '../../hooks/useGamification';

const CATEGORY_ICONS = {
  Heart,
  Briefcase,
  BookOpen,
  DollarSign,
  Users,
  Palette,
  Brain,
  Repeat,
};

const STEPS = [
  { id: 'category', title: 'Choose Category', subtitle: 'What area of life?' },
  { id: 'what', title: 'Define Your Goal', subtitle: 'Be specific and measurable' },
  { id: 'why', title: 'Your Why', subtitle: 'What motivates you?' },
  { id: 'how', title: 'Action Plan', subtitle: 'Break it down into steps' },
  { id: 'review', title: 'Review & Launch', subtitle: 'Ready to commit?' },
];

const SMART_TIPS = {
  specific: 'Instead of "get fit", try "run 3 times per week"',
  measurable: 'Include numbers: "read 24 books" not "read more"',
  achievable: 'Start small - you can always increase later',
  relevant: 'Connect to your deeper values and goals',
  timeBound: 'The year provides natural quarterly checkpoints',
};

const EXAMPLE_RESOLUTIONS = {
  health: ['Run a 5K by March', 'Meditate 10 minutes daily', 'Lose 20 pounds by June'],
  career: ['Get promoted', 'Launch a side project', 'Earn $10K extra income'],
  learning: ['Read 24 books', 'Complete 3 online courses', 'Learn to play guitar'],
  financial: ['Save $5,000 emergency fund', 'Pay off credit card debt', 'Start investing $200/month'],
  relationships: ['Call parents weekly', 'Plan monthly date nights', 'Make 3 new friends'],
  creativity: ['Write 500 words daily', 'Complete a painting', 'Start a YouTube channel'],
  mindfulness: ['Meditate 10 min daily', 'Practice gratitude journaling', 'Digital detox weekends'],
  habits: ['Wake up at 6 AM', 'No phone first hour', 'Exercise 4x per week'],
};

export default function AddResolutionModal({ onClose }) {
  const { addResolution } = useResolutionStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    why: '',
    actionSteps: ['', '', ''],
    checkInFrequency: 'daily', // daily, weekly
    reminderTime: '09:00',
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const resolution = {
      ...formData,
      actionSteps: formData.actionSteps.filter(s => s.trim()),
    };
    addResolution(resolution);
    // Award XP for creating a new resolution
    triggerGamification('resolutionCreated', { xpOverride: 30, module: 'purpose' });
    onClose();
  };

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case 'category':
        return formData.category !== '';
      case 'what':
        return formData.title.trim().length >= 5;
      case 'why':
        return formData.why.trim().length >= 10;
      case 'how':
        return formData.actionSteps.filter(s => s.trim()).length >= 1;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'category':
        return <CategoryStep formData={formData} setFormData={setFormData} />;
      case 'what':
        return <WhatStep formData={formData} setFormData={setFormData} />;
      case 'why':
        return <WhyStep formData={formData} setFormData={setFormData} />;
      case 'how':
        return <HowStep formData={formData} setFormData={setFormData} />;
      case 'review':
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#1a1724] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">New Year's Resolution</h2>
                <p className="text-sm text-white/50">{new Date().getFullYear()} Goals</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center gap-2 ${
                    idx <= currentStep ? 'text-purple-400' : 'text-white/30'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      idx < currentStep
                        ? 'bg-purple-500 text-white'
                        : idx === currentStep
                        ? 'bg-purple-500/20 border-2 border-purple-500 text-purple-400'
                        : 'bg-white/10 text-white/30'
                    }`}
                  >
                    {idx < currentStep ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      idx < currentStep ? 'bg-purple-500' : 'bg-white/10'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-white mb-1">
                {STEPS[currentStep].title}
              </h3>
              <p className="text-sm text-white/50 mb-6">{STEPS[currentStep].subtitle}</p>
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              currentStep === 0
                ? 'opacity-0 pointer-events-none'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep === STEPS.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              Create Resolution
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 font-semibold transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Step Components
function CategoryStep({ formData, setFormData }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Object.entries(RESOLUTION_CATEGORIES).map(([key, category]) => {
        const Icon = CATEGORY_ICONS[category.icon] || Target;
        const isSelected = formData.category === key;

        return (
          <button
            key={key}
            onClick={() => setFormData({ ...formData, category: key })}
            className={`p-4 rounded-xl border-2 transition-all ${
              isSelected
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/10 hover:border-white/20 bg-white/5'
            }`}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color: category.color }} />
            </div>
            <div className="text-sm font-medium text-white text-center">{category.name}</div>
          </button>
        );
      })}
    </div>
  );
}

function WhatStep({ formData, setFormData }) {
  const category = RESOLUTION_CATEGORIES[formData.category];
  const examples = EXAMPLE_RESOLUTIONS[formData.category] || [];

  return (
    <div className="space-y-4">
      {/* SMART Tips */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Make it SMART</span>
        </div>
        <p className="text-sm text-white/60">{SMART_TIPS.specific}</p>
      </div>

      {/* Title Input */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Your Resolution
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Run a 5K by March"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
          autoFocus
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Description (optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Add more details about your goal..."
          rows={2}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500 resize-none"
        />
      </div>

      {/* Examples */}
      {examples.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-white/50 mb-2">
            Examples for inspiration
          </label>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => setFormData({ ...formData, title: example })}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WhyStep({ formData, setFormData }) {
  const whyPrompts = [
    'This will make me feel...',
    'I want this because...',
    'Achieving this means...',
    'Without this, I would...',
  ];

  return (
    <div className="space-y-4">
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">Find Your Intrinsic Motivation</span>
        </div>
        <p className="text-sm text-white/60">
          Research shows resolutions connected to personal values are 3x more likely to succeed.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Why is this important to you?
        </label>
        <textarea
          value={formData.why}
          onChange={(e) => setFormData({ ...formData, why: e.target.value })}
          placeholder="I want to achieve this because..."
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500 resize-none"
          autoFocus
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {whyPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => setFormData({ ...formData, why: formData.why + prompt + ' ' })}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/50 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function HowStep({ formData, setFormData }) {
  const updateStep = (index, value) => {
    const newSteps = [...formData.actionSteps];
    newSteps[index] = value;
    setFormData({ ...formData, actionSteps: newSteps });
  };

  const addStep = () => {
    if (formData.actionSteps.length < 5) {
      setFormData({ ...formData, actionSteps: [...formData.actionSteps, ''] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">Break It Down</span>
        </div>
        <p className="text-sm text-white/60">
          Small, concrete actions make big goals achievable. What's the first tiny step?
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Action Steps (what will you actually do?)
        </label>
        <div className="space-y-2">
          {formData.actionSteps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs text-white/50">
                {idx + 1}
              </span>
              <input
                type="text"
                value={step}
                onChange={(e) => updateStep(idx, e.target.value)}
                placeholder={
                  idx === 0
                    ? 'e.g., Download a running app'
                    : idx === 1
                    ? 'e.g., Run 3x per week'
                    : 'e.g., Sign up for race'
                }
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
              />
            </div>
          ))}
        </div>
        {formData.actionSteps.length < 5 && (
          <button
            onClick={addStep}
            className="mt-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            + Add another step
          </button>
        )}
      </div>

      {/* Check-in frequency */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          How often will you check in?
        </label>
        <div className="flex gap-2">
          {['daily', 'weekly'].map((freq) => (
            <button
              key={freq}
              onClick={() => setFormData({ ...formData, checkInFrequency: freq })}
              className={`flex-1 px-4 py-2 rounded-lg capitalize transition-all ${
                formData.checkInFrequency === freq
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ formData }) {
  const category = RESOLUTION_CATEGORIES[formData.category];
  const Icon = CATEGORY_ICONS[category?.icon] || Target;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
        {/* Category & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${category?.color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color: category?.color }} />
          </div>
          <div>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
            >
              {category?.name}
            </span>
            <h4 className="text-xl font-bold text-white mt-1">{formData.title}</h4>
          </div>
        </div>

        {/* Why */}
        {formData.why && (
          <div className="mb-4">
            <div className="text-xs text-white/50 mb-1">Why this matters</div>
            <p className="text-sm text-white/80 italic">"{formData.why}"</p>
          </div>
        )}

        {/* Action Steps */}
        {formData.actionSteps.filter(s => s.trim()).length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-white/50 mb-2">Action Steps</div>
            <div className="space-y-1">
              {formData.actionSteps.filter(s => s.trim()).map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Check-in frequency */}
        <div className="flex items-center gap-2 text-sm text-white/50">
          <span>Check-in:</span>
          <span className="px-2 py-0.5 bg-white/10 rounded capitalize">
            {formData.checkInFrequency}
          </span>
        </div>
      </div>

      {/* Commitment message */}
      <div className="text-center py-4">
        <p className="text-white/60 text-sm">
          By creating this resolution, you're committing to checking in{' '}
          <span className="text-purple-400 font-medium">{formData.checkInFrequency}</span> and
          tracking your progress throughout {new Date().getFullYear()}.
        </p>
      </div>
    </div>
  );
}
