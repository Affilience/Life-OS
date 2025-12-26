/**
 * Values Assessment - Guided Discovery Tool
 * Helps users identify their core values through:
 * - Scenario-based questions
 * - Value ranking exercises
 * - Real-life application prompts
 */

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, Heart, Lightbulb, Star } from 'lucide-react';
import Card from '../ui/Card';

const COMMON_VALUES = [
  { name: 'Freedom', description: 'Independence and autonomy in decisions' },
  { name: 'Growth', description: 'Continuous learning and self-improvement' },
  { name: 'Impact', description: 'Making a positive difference in the world' },
  { name: 'Authenticity', description: 'Being true to yourself' },
  { name: 'Excellence', description: 'Pursuing mastery and high standards' },
  { name: 'Family', description: 'Close relationships with loved ones' },
  { name: 'Wealth', description: 'Financial abundance and security' },
  { name: 'Health', description: 'Physical and mental wellbeing' },
  { name: 'Creativity', description: 'Expressing unique ideas and art' },
  { name: 'Adventure', description: 'New experiences and exploration' },
  { name: 'Peace', description: 'Harmony and tranquility' },
  { name: 'Justice', description: 'Fairness and equality' },
  { name: 'Loyalty', description: 'Commitment and reliability' },
  { name: 'Courage', description: 'Bravery in facing challenges' },
  { name: 'Community', description: 'Belonging and connection with others' },
  { name: 'Fun', description: 'Enjoyment and playfulness' },
  { name: 'Achievement', description: 'Accomplishing goals and winning' },
  { name: 'Wisdom', description: 'Deep understanding and insight' },
  { name: 'Service', description: 'Helping and supporting others' },
  { name: 'Innovation', description: 'Creating new solutions and approaches' },
];

const SCENARIOS = [
  {
    question: 'You have a free Saturday. What appeals to you most?',
    options: [
      { text: 'Learning a new skill online', values: ['Growth', 'Wisdom'] },
      { text: 'Spending time with close friends or family', values: ['Family', 'Community'] },
      { text: 'Working on a creative project', values: ['Creativity', 'Excellence'] },
      { text: 'Volunteering or helping others', values: ['Service', 'Impact'] },
      { text: 'Relaxing and recharging alone', values: ['Peace', 'Health'] },
      { text: 'Trying something completely new', values: ['Adventure', 'Courage'] },
    ],
  },
  {
    question: 'You receive a job offer with double your salary, but it requires sacrificing something important. What would make you decline?',
    options: [
      { text: 'Less time for personal projects', values: ['Freedom', 'Creativity'] },
      { text: 'Working on something that doesn\'t align with your beliefs', values: ['Authenticity', 'Impact'] },
      { text: 'No room for learning or growth', values: ['Growth', 'Excellence'] },
      { text: 'Less time with loved ones', values: ['Family', 'Community'] },
      { text: 'High stress affecting your health', values: ['Health', 'Peace'] },
      { text: 'Compromising your principles', values: ['Justice', 'Loyalty'] },
    ],
  },
  {
    question: 'When you feel most fulfilled, what are you usually doing?',
    options: [
      { text: 'Solving complex problems', values: ['Excellence', 'Innovation'] },
      { text: 'Creating something new', values: ['Creativity', 'Achievement'] },
      { text: 'Helping someone succeed', values: ['Service', 'Impact'] },
      { text: 'Pushing past your limits', values: ['Courage', 'Growth'] },
      { text: 'Sharing experiences with others', values: ['Community', 'Fun'] },
      { text: 'Being recognised for your work', values: ['Achievement', 'Excellence'] },
    ],
  },
  {
    question: 'What frustrates you most in your daily life?',
    options: [
      { text: 'Lack of control over my schedule', values: ['Freedom', 'Autonomy'] },
      { text: 'Not making meaningful progress', values: ['Growth', 'Achievement'] },
      { text: 'Seeing injustice or inequality', values: ['Justice', 'Impact'] },
      { text: 'Not being able to be myself', values: ['Authenticity', 'Freedom'] },
      { text: 'Constant stress and no peace', values: ['Peace', 'Health'] },
      { text: 'Mediocrity and lack of excellence', values: ['Excellence', 'Innovation'] },
    ],
  },
  {
    question: 'If you could wave a magic wand and change one thing about your life, what would it be?',
    options: [
      { text: 'More financial freedom', values: ['Wealth', 'Freedom'] },
      { text: 'Deeper, more meaningful relationships', values: ['Family', 'Community'] },
      { text: 'More time for creative pursuits', values: ['Creativity', 'Fun'] },
      { text: 'Better health and energy', values: ['Health', 'Peace'] },
      { text: 'Making a bigger impact', values: ['Impact', 'Service'] },
      { text: 'More exciting adventures', values: ['Adventure', 'Fun'] },
    ],
  },
];

const ValuesAssessment = ({ onComplete }) => {
  const [step, setStep] = useState(0); // 0 = intro, 1-5 = scenarios, 6 = selection, 7 = ranking, 8 = importance
  const [answers, setAnswers] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [rankedValues, setRankedValues] = useState([]);
  const [customImportance, setCustomImportance] = useState({}); // { valueName: importance }

  const handleScenarioAnswer = (option) => {
    setAnswers([...answers, option]);
    setStep(step + 1);
  };

  const calculateTopValues = () => {
    const valueScores = {};

    // Count how many times each value appeared in answers
    answers.forEach((answer) => {
      answer.values.forEach((value) => {
        valueScores[value] = (valueScores[value] || 0) + 1;
      });
    });

    // Sort by frequency
    const sorted = Object.entries(valueScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12) // Top 12 values
      .map(([name, score]) => ({
        ...COMMON_VALUES.find((v) => v.name === name),
        score,
      }));

    return sorted;
  };

  const toggleValue = (value) => {
    if (selectedValues.find((v) => v.name === value.name)) {
      setSelectedValues(selectedValues.filter((v) => v.name !== value.name));
    } else {
      if (selectedValues.length < 5) {
        setSelectedValues([...selectedValues, value]);
      }
    }
  };

  // Initialize suggested importance scores based on ranking
  const initializeImportance = () => {
    const initial = {};
    rankedValues.forEach((value, index) => {
      initial[value.name] = 10 - index * 2; // 10, 8, 6, 4, 2
    });
    setCustomImportance(initial);
    setStep(8);
  };

  const handleComplete = () => {
    const finalValues = rankedValues.map((value) => ({
      ...value,
      importance: customImportance[value.name] || 5,
    }));
    onComplete(finalValues);
  };

  // Intro
  if (step === 0) {
    return (
      <Card padding="lg">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
            <Lightbulb className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
            Discover Your Core Values
          </h2>
          <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
            This guided assessment will help you identify what truly matters to you through
            real-life scenarios and reflections.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div
              className="p-4 rounded-lg"
              style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
            >
              <div className="text-2xl font-bold text-purple-400 mb-2">5</div>
              <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                Scenario Questions
              </div>
            </div>
            <div
              className="p-4 rounded-lg"
              style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
            >
              <div className="text-2xl font-bold text-purple-400 mb-2">5</div>
              <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                Core Values to Identify
              </div>
            </div>
            <div
              className="p-4 rounded-lg"
              style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
            >
              <div className="text-2xl font-bold text-purple-400 mb-2">~5</div>
              <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                Minutes to Complete
              </div>
            </div>
          </div>
          <button
            onClick={() => setStep(1)}
            className="px-8 py-4 rounded-lg font-semibold flex items-center gap-2 mx-auto shadow-lg shadow-purple-500/30"
            style={{
              background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
              color: 'rgba(255, 255, 255, 0.87)',
            }}
          >
            Begin Assessment
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </Card>
    );
  }

  // Scenarios 1-5
  if (step >= 1 && step <= 5) {
    const scenario = SCENARIOS[step - 1];
    return (
      <Card padding="lg">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
              Question {step} of 5
            </span>
            <div className="flex-1 mx-6 h-2 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
              {Math.round((step / 5) * 100)}%
            </span>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
              {scenario.question}
            </h3>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>
              Choose the option that resonates most with you
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {scenario.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleScenarioAnswer(option)}
                className="w-full text-left px-6 py-4 rounded-lg transition-all"
                style={{
                  background: 'rgba(39, 39, 42, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  color: 'rgba(255, 255, 255, 0.87)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.currentTarget.style.borderColor = '#8b5cf6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(39, 39, 42, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/20 text-purple-400 font-semibold flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span>{option.text}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Back Button */}
          {step > 1 && (
            <button
              onClick={() => {
                setStep(step - 1);
                setAnswers(answers.slice(0, -1));
              }}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg"
              style={{
                color: 'rgba(255, 255, 255, 0.60)',
                background: 'rgba(39, 39, 42, 0.4)',
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Question
            </button>
          )}
        </div>
      </Card>
    );
  }

  // Value Selection (step 6)
  if (step === 6) {
    const suggestedValues = calculateTopValues();

    return (
      <Card padding="lg">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
              Based on Your Answers
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
              These values appeared most frequently in your choices. Select your top 5.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {suggestedValues.map((value) => {
              const isSelected = selectedValues.find((v) => v.name === value.name);
              return (
                <button
                  key={value.name}
                  onClick={() => toggleValue(value)}
                  className="p-4 rounded-lg text-left transition-all"
                  style={{
                    background: isSelected
                      ? 'rgba(139, 92, 246, 0.2)'
                      : 'rgba(39, 39, 42, 0.4)',
                    border: isSelected
                      ? '2px solid #8b5cf6'
                      : '1px solid rgba(255, 255, 255, 0.04)',
                    opacity: !isSelected && selectedValues.length >= 5 ? 0.4 : 1,
                  }}
                  disabled={!isSelected && selectedValues.length >= 5}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-semibold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                      {value.name}
                    </span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />}
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                    {value.description}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    {[...Array(value.score)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-purple-500" />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4">
            <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
              {selectedValues.length} of 5 selected
            </span>
            <button
              onClick={() => {
                setRankedValues(selectedValues);
                setStep(7);
              }}
              disabled={selectedValues.length !== 5}
              className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                color: 'rgba(255, 255, 255, 0.87)',
              }}
            >
              Continue to Ranking
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // Ranking (step 7)
  if (step === 7) {
    return (
      <Card padding="lg">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <Heart className="w-12 h-12 mx-auto mb-4 text-pink-400" />
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
              Rank Your Values
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
              Drag to reorder from most important (top) to least important (bottom)
            </p>
          </div>

          <div className="space-y-3">
            {rankedValues.map((value, index) => (
              <div
                key={value.name}
                className="flex items-center gap-4 p-4 rounded-lg"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                }}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('index', index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const dragIndex = parseInt(e.dataTransfer.getData('index'));
                  const newRanked = [...rankedValues];
                  const [removed] = newRanked.splice(dragIndex, 1);
                  newRanked.splice(index, 0, removed);
                  setRankedValues(newRanked);
                }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                    {value.name}
                  </div>
                  <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                    {value.description}
                  </div>
                </div>
                <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>
                  ⋮⋮
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={initializeImportance}
            className="w-full px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
            style={{
              background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
              color: 'rgba(255, 255, 255, 0.87)',
            }}
          >
            Continue to Importance
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </Card>
    );
  }

  // Custom Importance (step 8)
  if (step === 8) {
    return (
      <Card padding="lg">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <Star className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
              Rate Your Values
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
              Adjust the importance of each value (1-10). We've suggested scores based on your ranking.
            </p>
          </div>

          <div className="space-y-4">
            {rankedValues.map((value, index) => (
              <div
                key={value.name}
                className="p-5 rounded-xl"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg" style={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                      {value.name}
                    </div>
                    <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                      {value.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={customImportance[value.name] || 5}
                    onChange={(e) =>
                      setCustomImportance({
                        ...customImportance,
                        [value.name]: parseInt(e.target.value),
                      })
                    }
                    className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((customImportance[value.name] || 5) - 1) * 11.1}%, rgba(255,255,255,0.1) ${((customImportance[value.name] || 5) - 1) * 11.1}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl min-w-[100px] justify-center"
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-xl text-white">
                      {customImportance[value.name] || 5}
                    </span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.38)' }}>/10</span>
                  </div>
                </div>

                <div className="mt-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.38)' }}>
                  Suggested: {10 - index * 2}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep(7)}
              className="px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              style={{
                background: 'rgba(39, 39, 42, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.60)',
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Ranking
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
              style={{
                background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                color: 'rgba(255, 255, 255, 0.87)',
              }}
            >
              <CheckCircle2 className="w-5 h-5" />
              Complete Assessment
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};

export default ValuesAssessment;
