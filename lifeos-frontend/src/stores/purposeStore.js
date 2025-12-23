/**
 * Purpose & Values Store - Track identity, values, vision, and decisions
 * Mission statement, core values, life vision, decision journal
 * Identity evolution and values alignment checking
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, getCurrentUserId } from '../lib/supabase';
import { triggerGamification } from '../hooks/useGamification';

// Supabase sync helpers
const syncPurposeToSupabase = async (purpose) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const dbPurpose = {
      user_id: userId,
      mission_statement: purpose.missionStatement || null,
      vision_one_year: purpose.visionOneYear || null,
      vision_five_year: purpose.visionFiveYear || null,
      vision_ten_year: purpose.visionTenYear || null,
      vision_ultimate: purpose.visionUltimate || null,
    };

    await supabase.from('user_purpose').upsert(dbPurpose, { onConflict: 'user_id' });
  } catch (error) {
    console.error('Error syncing purpose to Supabase:', error);
  }
};

const syncValueToSupabase = async (value, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase.from('user_values').delete().eq('id', value.id);
      return;
    }

    const dbValue = {
      id: value.id,
      user_id: userId,
      name: value.name,
      description: value.description || null,
      importance: value.importance || 5,
      color: value.color || '#8b5cf6',
      examples: value.examples || [],
      defined_date: value.definedDate || new Date().toISOString(),
    };

    await supabase.from('user_values').upsert(dbValue, { onConflict: 'id' });
  } catch (error) {
    console.error('Error syncing value to Supabase:', error);
  }
};

const syncDecisionToSupabase = async (decision, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase.from('user_decisions').delete().eq('id', decision.id);
      return;
    }

    const dbDecision = {
      id: decision.id,
      user_id: userId,
      title: decision.title,
      context: decision.context || null,
      situation: decision.situation || null,
      options: decision.options || [],
      chosen_option: decision.chosenOption || null,
      reasoning: decision.reasoning || null,
      expected_outcome: decision.expectedOutcome || null,
      actual_outcome: decision.actualOutcome || null,
      decision_date: decision.date || new Date().toISOString(),
      review_date: decision.reviewDate || null,
      tags: decision.tags || [],
      category: decision.category || 'personal',
      importance: decision.importance || 'medium',
      values_alignment: decision.valuesAlignment || {},
      outcome: decision.outcome || 'pending',
      lessons_learned: decision.lessonsLearned || null,
      would_do_again: decision.wouldDoAgain,
    };

    await supabase.from('user_decisions').upsert(dbDecision, { onConflict: 'id' });
  } catch (error) {
    console.error('Error syncing decision to Supabase:', error);
  }
};

const syncCheckInToSupabase = async (checkIn, action = 'upsert') => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (action === 'delete') {
      await supabase.from('user_identity_checkins').delete().eq('id', checkIn.id);
      return;
    }

    const dbCheckIn = {
      id: checkIn.id,
      user_id: userId,
      identity_statement: checkIn.identityStatement || null,
      reflections: checkIn.reflections || null,
      changes_from_last: checkIn.changesFromLast || null,
      proud_of: checkIn.proudOf || [],
      working_on: checkIn.workingOn || [],
      values_lived: checkIn.valuesLived || [],
      checkin_date: checkIn.date || new Date().toISOString(),
    };

    await supabase.from('user_identity_checkins').upsert(dbCheckIn, { onConflict: 'id' });
  } catch (error) {
    console.error('Error syncing check-in to Supabase:', error);
  }
};

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

      // Initialize from Supabase
      initializeFromSupabase: async (passedUserId = null) => {
        // Master timeout to prevent hanging
        const INIT_TIMEOUT_MS = 15000;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
          timedOut = true;
        }, INIT_TIMEOUT_MS);

        // Helper to wrap queries with timeout
        const withTimeout = (promise, timeoutMs = 10000) => {
          return Promise.race([
            promise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
            )
          ]).catch(() => ({ data: null, error: 'timeout' }));
        };

        try {
          const userId = passedUserId || await getCurrentUserId();
          if (!userId) {
            clearTimeout(timeoutId);
            return;
          }

          // Run all queries in parallel for faster initialization
          const [
            { data: purposeData },
            { data: valuesData },
            { data: decisionsData },
            { data: checkInsData }
          ] = await Promise.all([
            // Load purpose/vision
            withTimeout(
              supabase
                .from('user_purpose')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle()
            ),
            // Load values
            withTimeout(
              supabase
                .from('user_values')
                .select('*')
                .eq('user_id', userId)
                .order('importance', { ascending: false })
            ),
            // Load decisions
            withTimeout(
              supabase
                .from('user_decisions')
                .select('*')
                .eq('user_id', userId)
                .order('decision_date', { ascending: false })
            ),
            // Load identity check-ins
            withTimeout(
              supabase
                .from('user_identity_checkins')
                .select('*')
                .eq('user_id', userId)
                .order('checkin_date', { ascending: false })
            )
          ]);

          const updates = {};

          if (purposeData) {
            updates.missionStatement = purposeData.mission_statement || '';
            updates.personalVision = {
              oneYear: purposeData.vision_one_year || '',
              fiveYear: purposeData.vision_five_year || '',
              tenYear: purposeData.vision_ten_year || '',
              ultimate: purposeData.vision_ultimate || '',
            };
          }

          if (valuesData && valuesData.length > 0) {
            updates.coreValues = valuesData.map(v => ({
              id: v.id,
              name: v.name,
              description: v.description || '',
              importance: v.importance || 5,
              definedDate: v.defined_date,
              examples: v.examples || [],
              color: v.color || '#8b5cf6',
            }));
          }

          if (decisionsData && decisionsData.length > 0) {
            updates.decisions = decisionsData.map(d => ({
              id: d.id,
              title: d.title,
              context: d.context || '',
              situation: d.situation || '',
              options: d.options || [],
              chosenOption: d.chosen_option || '',
              reasoning: d.reasoning || '',
              expectedOutcome: d.expected_outcome || '',
              actualOutcome: d.actual_outcome || '',
              date: d.decision_date,
              reviewDate: d.review_date,
              tags: d.tags || [],
              category: d.category || 'personal',
              importance: d.importance || 'medium',
              valuesAlignment: d.values_alignment || {},
              outcome: d.outcome || 'pending',
              lessonsLearned: d.lessons_learned || '',
              wouldDoAgain: d.would_do_again,
              createdAt: d.created_at,
              updatedAt: d.updated_at,
            }));
          }

          if (checkInsData && checkInsData.length > 0) {
            updates.identityCheckIns = checkInsData.map(c => ({
              id: c.id,
              date: c.checkin_date,
              identityStatement: c.identity_statement || '',
              reflections: c.reflections || '',
              changesFromLast: c.changes_from_last || '',
              proudOf: c.proud_of || [],
              workingOn: c.working_on || [],
              valuesLived: c.values_lived || [],
            }));
          }

          if (Object.keys(updates).length > 0) {
            set(updates);
          }
          console.log('[PurposeStore] ✅ Initialized');
        } catch (error) {
          console.error('[PurposeStore] ❌ Error initializing:', error);
        } finally {
          clearTimeout(timeoutId);
        }
      },

      // Add/Update Mission Statement
      setMissionStatement: (statement) => {
        const previousMission = get().missionStatement;
        set({ missionStatement: statement });

        // Sync to Supabase
        const state = get();
        syncPurposeToSupabase({
          missionStatement: statement,
          visionOneYear: state.personalVision.oneYear,
          visionFiveYear: state.personalVision.fiveYear,
          visionTenYear: state.personalVision.tenYear,
          visionUltimate: state.personalVision.ultimate,
        });

        // Award XP for setting/updating mission statement
        // First time setting gets more XP
        const xpAmount = previousMission ? 10 : 30;
        triggerGamification('missionSet', { xpOverride: xpAmount, module: 'purpose' });
      },

      // Update Vision
      updateVision: (timeframe, vision) => {
        const previousVision = get().personalVision[timeframe];
        set((state) => ({
          personalVision: {
            ...state.personalVision,
            [timeframe]: vision,
          },
        }));

        // Sync to Supabase
        const state = get();
        const updatedVision = { ...state.personalVision, [timeframe]: vision };
        syncPurposeToSupabase({
          missionStatement: state.missionStatement,
          visionOneYear: updatedVision.oneYear,
          visionFiveYear: updatedVision.fiveYear,
          visionTenYear: updatedVision.tenYear,
          visionUltimate: updatedVision.ultimate,
        });

        // Award XP for setting vision (first time gets more)
        const xpAmount = previousVision ? 5 : 20;
        triggerGamification('visionSet', { xpOverride: xpAmount, module: 'purpose' });
      },

      // Core Values Management
      addValue: (valueData) => {
        const newValue = {
          id: crypto.randomUUID(),
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

        // Sync to Supabase
        syncValueToSupabase(newValue);

        // Award XP for defining a core value (MEDIUM tier: 10-20 XP)
        triggerGamification('valueCreated', {
          xpOverride: 10,
          module: 'knowledge', // Values relate to self-knowledge
        });

        return newValue;
      },

      updateValue: (valueId, updates) => {
        set((state) => ({
          coreValues: state.coreValues
            .map((value) => (value.id === valueId ? { ...value, ...updates } : value))
            .sort((a, b) => b.importance - a.importance),
        }));

        // Sync to Supabase
        const updatedValue = get().coreValues.find(v => v.id === valueId);
        if (updatedValue) {
          syncValueToSupabase(updatedValue);
        }
      },

      deleteValue: (valueId) => {
        const valueToDelete = get().coreValues.find(v => v.id === valueId);

        set((state) => ({
          coreValues: state.coreValues.filter((value) => value.id !== valueId),
        }));

        // Sync to Supabase
        if (valueToDelete) {
          syncValueToSupabase(valueToDelete, 'delete');
        }
      },

      addValueExample: (valueId, example) => {
        set((state) => ({
          coreValues: state.coreValues.map((value) =>
            value.id === valueId
              ? { ...value, examples: [...value.examples, example] }
              : value
          ),
        }));

        // Sync to Supabase
        const updatedValue = get().coreValues.find(v => v.id === valueId);
        if (updatedValue) {
          syncValueToSupabase(updatedValue);
        }
      },

      // Decision Journal
      addDecision: (decisionData) => {
        const newDecision = {
          id: crypto.randomUUID(),
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

        // Sync to Supabase
        syncDecisionToSupabase(newDecision);

        // Award XP for documenting a decision - more for important ones
        const xpByImportance = { low: 10, medium: 15, high: 25, critical: 40 };
        triggerGamification('decisionLogged', {
          xpOverride: xpByImportance[newDecision.importance] || 15,
          module: 'knowledge',
        });

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

        // Sync to Supabase
        const updatedDecision = get().decisions.find(d => d.id === decisionId);
        if (updatedDecision) {
          syncDecisionToSupabase(updatedDecision);
        }
      },

      deleteDecision: (decisionId) => {
        const decisionToDelete = get().decisions.find(d => d.id === decisionId);

        set((state) => ({
          decisions: state.decisions.filter((decision) => decision.id !== decisionId),
        }));

        // Sync to Supabase
        if (decisionToDelete) {
          syncDecisionToSupabase(decisionToDelete, 'delete');
        }
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

        // Sync to Supabase
        const updatedDecision = get().decisions.find(d => d.id === decisionId);
        if (updatedDecision) {
          syncDecisionToSupabase(updatedDecision);
        }

        // Award XP for reviewing a decision and extracting lessons (MEDIUM tier)
        triggerGamification('decisionReviewed', {
          xpOverride: 10,
          module: 'knowledge',
        });
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
          id: crypto.randomUUID(),
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

        // Sync to Supabase
        syncCheckInToSupabase(newCheckIn);

        // Award XP for identity reflection (MEDIUM tier: 10-20 XP)
        triggerGamification('identityCheckIn', {
          xpOverride: 15,
          module: 'knowledge',
        });

        return newCheckIn;
      },

      updateIdentityCheckIn: (checkInId, updates) => {
        set((state) => ({
          identityCheckIns: state.identityCheckIns.map((checkIn) =>
            checkIn.id === checkInId ? { ...checkIn, ...updates } : checkIn
          ),
        }));

        // Sync to Supabase
        const updatedCheckIn = get().identityCheckIns.find(c => c.id === checkInId);
        if (updatedCheckIn) {
          syncCheckInToSupabase(updatedCheckIn);
        }
      },

      deleteIdentityCheckIn: (checkInId) => {
        const checkInToDelete = get().identityCheckIns.find(c => c.id === checkInId);

        set((state) => ({
          identityCheckIns: state.identityCheckIns.filter(
            (checkIn) => checkIn.id !== checkInId
          ),
        }));

        // Sync to Supabase
        if (checkInToDelete) {
          syncCheckInToSupabase(checkInToDelete, 'delete');
        }
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

// Initialize purpose store from Supabase
export const initializePurposeStore = async (userId = null) => {
  const store = usePurposeStore.getState();
  await store.initializeFromSupabase(userId);
};
