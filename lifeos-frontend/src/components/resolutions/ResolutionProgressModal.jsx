/**
 * Resolution Progress Modal
 * Shows check-in history and progress chart for a resolution
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Calendar, Flame, Target, CheckCircle2, MessageSquare } from 'lucide-react';
import { supabase, getCurrentUserId } from '../../lib/supabase';

export default function ResolutionProgressModal({ resolution, isOpen, onClose }) {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch check-in history from database
  useEffect(() => {
    if (!isOpen || !resolution?.id) return;

    const fetchCheckIns = async () => {
      setLoading(true);
      try {
        const userId = await getCurrentUserId();
        if (!userId) return;

        const { data, error } = await supabase
          .from('resolution_check_ins')
          .select('*')
          .eq('resolution_id', resolution.id)
          .eq('user_id', userId)
          .order('check_in_date', { ascending: false })
          .limit(30);

        if (error) throw error;
        setCheckIns(data || []);
      } catch (err) {
        console.error('Error fetching check-ins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckIns();
  }, [isOpen, resolution?.id]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!checkIns.length) return { total: 0, streak: 0, thisWeek: 0, thisMonth: 0 };

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const thisWeek = checkIns.filter(ci => new Date(ci.check_in_date) >= weekAgo).length;
    const thisMonth = checkIns.filter(ci => new Date(ci.check_in_date) >= monthAgo).length;

    // Calculate current streak
    let streak = 0;
    const sortedDates = checkIns
      .map(ci => ci.check_in_date)
      .sort((a, b) => new Date(b) - new Date(a));

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0];

    if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
      streak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const curr = new Date(sortedDates[i - 1]);
        const prev = new Date(sortedDates[i]);
        const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    return {
      total: checkIns.length,
      streak,
      thisWeek,
      thisMonth,
    };
  }, [checkIns]);

  // Generate calendar data for last 30 days
  const calendarData = useMemo(() => {
    const days = [];
    const today = new Date();
    const checkInDates = new Set(checkIns.map(ci => ci.check_in_date));

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: date.getDate(),
        checked: checkInDates.has(dateStr),
        isToday: i === 0,
      });
    }
    return days;
  }, [checkIns]);

  if (!isOpen) return null;

  const progressPercentage = resolution.targetValue > 0
    ? Math.min((resolution.currentValue / resolution.targetValue) * 100, 100)
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#12101a] w-full max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#12101a] border-b border-white/10 p-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${resolution.color || '#8b5cf6'}20` }}
              >
                <TrendingUp className="w-5 h-5" style={{ color: resolution.color || '#8b5cf6' }} />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Progress</h2>
                <p className="text-sm text-white/50 truncate max-w-[200px]">{resolution.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Progress Bar */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70">Overall Progress</span>
                    <span className="text-sm font-bold text-white">
                      {resolution.currentValue} / {resolution.targetValue} {resolution.unit}
                    </span>
                  </div>
                  <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: resolution.color || '#8b5cf6' }}
                    />
                  </div>
                  <p className="text-xs text-white/50 mt-2 text-right">
                    {progressPercentage.toFixed(1)}% complete
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-white/50">Total</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                    <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{stats.streak}</p>
                    <p className="text-xs text-white/50">Streak</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                    <Calendar className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{stats.thisWeek}</p>
                    <p className="text-xs text-white/50">This Week</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                    <Target className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{stats.thisMonth}</p>
                    <p className="text-xs text-white/50">This Month</p>
                  </div>
                </div>

                {/* Activity Calendar */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                  <h3 className="text-sm font-bold text-white/70 mb-3">Last 30 Days</h3>
                  <div className="grid grid-cols-10 gap-1">
                    {calendarData.map((day, idx) => (
                      <div
                        key={idx}
                        className={`aspect-square rounded-md flex items-center justify-center text-xs ${
                          day.checked
                            ? 'text-white font-bold'
                            : day.isToday
                            ? 'bg-white/10 text-white/70 ring-1 ring-white/30'
                            : 'bg-white/5 text-white/30'
                        }`}
                        style={{
                          backgroundColor: day.checked ? (resolution.color || '#8b5cf6') : undefined,
                        }}
                        title={day.date}
                      >
                        {day.day}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-4 mt-3 text-xs text-white/50">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-white/5" />
                      <span>Missed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: resolution.color || '#8b5cf6' }}
                      />
                      <span>Checked In</span>
                    </div>
                  </div>
                </div>

                {/* Recent Check-ins */}
                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <h3 className="text-sm font-bold text-white/70 p-4 border-b border-white/10">
                    Recent Check-ins
                  </h3>
                  {checkIns.length === 0 ? (
                    <div className="p-8 text-center">
                      <CheckCircle2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/50">No check-ins yet</p>
                      <p className="text-sm text-white/30 mt-1">
                        Start tracking your progress!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5 max-h-[200px] overflow-y-auto">
                      {checkIns.slice(0, 10).map((ci) => (
                        <div key={ci.id} className="p-3 flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${resolution.color || '#8b5cf6'}20` }}
                          >
                            <CheckCircle2
                              className="w-4 h-4"
                              style={{ color: resolution.color || '#8b5cf6' }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">
                              {new Date(ci.check_in_date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            {ci.note && (
                              <p className="text-xs text-white/50 truncate flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {ci.note}
                              </p>
                            )}
                          </div>
                          {ci.xp_earned > 0 && (
                            <span className="text-xs font-bold text-purple-400">
                              +{ci.xp_earned} XP
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
