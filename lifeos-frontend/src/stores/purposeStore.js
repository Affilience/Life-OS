/**
 * Purpose & Values Store - Track identity, values, vision, and decisions
 * Mission statement, core values, life vision, decision journal
 * Identity evolution and values alignment checking
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePurposeStore = create(
  persist(
    (set, get) => ({
      // Identity & Purpose
      missionStatement: '',
      personalVision: {
        oneYear: '',
        fiveYear: '',
        tenYear: '',
        ultimate: '',
      },

      // Core Values (ranked by importance)
      coreValues: [],
      // Example value: { id, name, description, importance: 1-10, definedDate, examples }

      // Decision Journal
      decisions: [],
      // Example decision: { id, title, context, options, chosenOption, expectedOutcome, actualOutcome, date, reviewDate, tags, valuesAlignment }

      // Identity Evolution
      identityCheckIns: [],
      // Example check-in: { id, date, identityStatement, reflections, changesFromLast }

      // Add/Update Mission Statement
      setMissionStatement: (statement) => {
        set({ missionStatement: statement });
      },

      // Update Vision
      updateVision: (timeframe, vision) => {
        set((state) => ({
          personalVision: {
            ...state.personalVision,
            [timeframe]: vision,
          },
        }));
      },

      // Core Values Management
      addValue: (valueData) => {
        const newValue = {
          id: `value-${Date.now()}`,
          name: valueData.name,
          description: valueData.description || '',
          importance: valueData.importance || 5, // 1-10
          definedDate: new Date().toISOString(),
          examples: valueData.examples || [], // Examples of living this value
          color: valueData.color || '#8b5cf6', // Cosmic color
        };

        set((state) => ({
          coreValues: [...state.coreValues, newValue].sort(
            (a, b) => b.importance - a.importance
          ),
        }));

        return newValue;
      },

      updateValue: (valueId, updates) => {
        set((state) => ({
          coreValues: state.coreValues
            .map((value) => (value.id === valueId ? { ...value, ...updates } : value))
            .sort((a, b) => b.importance - a.importance),
        }));
      },

      deleteValue: (valueId) => {
        set((state) => ({
          coreValues: state.coreValues.filter((value) => value.id !== valueId),
        }));
      },

      addValueExample: (valueId, example) => {
        set((state) => ({
          coreValues: state.coreValues.map((value) =>
            value.id === valueId
              ? { ...value, examples: [...value.examples, example] }
              : value
          ),
        }));
      },

      // Decision Journal
      addDecision: (decisionData) => {
        const newDecision = {
          id: `decision-${Date.now()}`,
          title: decisionData.title,
          context: decisionData.context || '',
          situation: decisionData.situation || '',
          options: decisionData.options || [], // Array of options considered
          chosenOption: decisionData.chosenOption || '',
          reasoning: decisionData.reasoning || '',
          expectedOutcome: decisionData.expectedOutcome || '',
          actualOutcome: decisionData.actualOutcome || '',
          date: decisionData.date || new Date().toISOString(),
          reviewDate: decisionData.reviewDate || null,
          tags: decisionData.tags || [],
          category: decisionData.category || 'personal', // personal, business, relationship, health
          importance: decisionData.importance || 'medium', // low, medium, high, critical
          valuesAlignment: decisionData.valuesAlignment || {}, // { valueId: alignmentScore }
          outcome: decisionData.outcome || 'pending', // pending, good, neutral, bad
          lessonsLearned: decisionData.lessonsLearned || '',
          wouldDoAgain: decisionData.wouldDoAgain || null, // true/false/null
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          decisions: [newDecision, ...state.decisions],
        }));

        return newDecision;
      },

      updateDecision: (decisionId, updates) => {
        set((state) => ({
          decisions: state.decisions.map((decision) =>
            decision.id === decisionId
              ? { ...decision, ...updates, updatedAt: new Date().toISOString() }
              : decision
          ),
        }));
      },

      deleteDecision: (decisionId) => {
        set((state) => ({
          decisions: state.decisions.filter((decision) => decision.id !== decisionId),
        }));
      },

      // Review a decision (update with actual outcome)
      reviewDecision: (decisionId, reviewData) => {
        set((state) => ({
          decisions: state.decisions.map((decision) =>
            decision.id === decisionId
              ? {
                  ...decision,
                  actualOutcome: reviewData.actualOutcome,
                  outcome: reviewData.outcome,
                  lessonsLearned: reviewData.lessonsLearned,
                  wouldDoAgain: reviewData.wouldDoAgain,
                  reviewDate: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : decision
          ),
        }));
      },

      // Calculate values alignment for a decision
      calculateValuesAlignment: (decisionId) => {
        const decision = get().decisions.find((d) => d.id === decisionId);
        const values = get().coreValues;

        if (!decision || !decision.valuesAlignment) return 0;

        const alignmentScores = Object.entries(decision.valuesAlignment);
        if (alignmentScores.length === 0) return 0;

        const weightedSum = alignmentScores.reduce((sum, [valueId, score]) => {
          const value = values.find((v) => v.id === valueId);
          const importance = value ? value.importance : 5;
          return sum + score * importance;
        }, 0);

        const maxPossibleScore = alignmentScores.reduce((sum, [valueId]) => {
          const value = values.find((v) => v.id === valueId);
          const importance = value ? value.importance : 5;
          return sum + 10 * importance; // Max score is 10
        }, 0);

        return maxPossibleScore > 0 ? (weightedSum / maxPossibleScore) * 100 : 0;
      },

      // Identity Check-Ins
      addIdentityCheckIn: (checkInData) => {
        const newCheckIn = {
          id: `checkin-${Date.now()}`,
          date: new Date().toISOString(),
          identityStatement: checkInData.identityStatement || '', // "I am..."
          reflections: checkInData.reflections || '',
          changesFromLast: checkInData.changesFromLast || '',
          proudOf: checkInData.proudOf || [],
          workingOn: checkInData.workingOn || [],
          valuesLived: checkInData.valuesLived || [], // Which values did you live this period?
        };

        set((state) => ({
          identityCheckIns: [newCheckIn, ...state.identityCheckIns],
        }));

        return newCheckIn;
      },

      updateIdentityCheckIn: (checkInId, updates) => {
        set((state) => ({
          identityCheckIns: state.identityCheckIns.map((checkIn) =>
            checkIn.id === checkInId ? { ...checkIn, ...updates } : checkIn
          ),
        }));
      },

      deleteIdentityCheckIn: (checkInId) => {
        set((state) => ({
          identityCheckIns: state.identityCheckIns.filter(
            (checkIn) => checkIn.id !== checkInId
          ),
        }));
      },

      // Getters
      getTopValues: (count = 5) => {
        return get().coreValues.slice(0, count);
      },

      getDecisionsByCategory: (category) => {
        return get().decisions.filter((d) => d.category === category);
      },

      getDecisionsByOutcome: (outcome) => {
        return get().decisions.filter((d) => d.outcome === outcome);
      },

      getPendingDecisions: () => {
        return get().decisions.filter(
          (d) => d.outcome === 'pending' && d.reviewDate && new Date(d.reviewDate) <= new Date()
        );
      },

      getRecentCheckIns: (count = 5) => {
        return get().identityCheckIns.slice(0, count);
      },

      // Analytics
      getDecisionQuality: () => {
        const decisions = get().decisions.filter((d) => d.outcome !== 'pending');
        if (decisions.length === 0) return 0;

        const goodDecisions = decisions.filter((d) => d.outcome === 'good').length;
        return (goodDecisions / decisions.length) * 100;
      },

      getValuesAlignmentTrend: () => {
        const decisions = get().decisions.filter(
          (d) => d.valuesAlignment && Object.keys(d.valuesAlignment).length > 0
        );

        return decisions.map((d) => ({
          date: d.date,
          alignment: get().calculateValuesAlignment(d.id),
        }));
      },

      // Export for reflection
      exportPurposeData: () => {
        const state = get();
        return {
          mission: state.missionStatement,
          vision: state.personalVision,
          values: state.coreValues,
          topDecisions: state.decisions.slice(0, 10),
          recentCheckIns: state.identityCheckIns.slice(0, 5),
          stats: {
            totalDecisions: state.decisions.length,
            decisionQuality: state.getDecisionQuality(),
            totalValues: state.coreValues.length,
            totalCheckIns: state.identityCheckIns.length,
          },
        };
      },
    }),
    {
      name: 'lifeos-purpose',
      partialize: (state) => ({
        missionStatement: state.missionStatement,
        personalVision: state.personalVision,
        coreValues: state.coreValues,
        decisions: state.decisions,
        identityCheckIns: state.identityCheckIns,
      }),
    }
  )
);
