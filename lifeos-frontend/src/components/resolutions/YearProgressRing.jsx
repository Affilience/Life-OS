/**
 * YearProgressRing - Animated circular progress showing year completion
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';
import { useResolutionStore } from '../../stores/resolutionStore';

export default function YearProgressRing({ size = 200 }) {
  const { getYearProgress, getDaysRemaining, getStats } = useResolutionStore();

  const yearProgress = getYearProgress();
  const daysRemaining = getDaysRemaining();
  const stats = getStats();
  const targetYear = 2026;
  const now = new Date();
  const isBeforeTargetYear = now < new Date(targetYear, 0, 1);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (yearProgress / 100) * circumference;

  // Calculate current month for segment highlighting
  const currentMonth = new Date().getMonth();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="flex flex-col items-center">
      {/* Main Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />

          {/* Month markers */}
          {months.map((_, idx) => {
            const angle = (idx / 12) * 360 - 90;
            const x1 = size / 2 + (radius - 15) * Math.cos((angle * Math.PI) / 180);
            const y1 = size / 2 + (radius - 15) * Math.sin((angle * Math.PI) / 180);
            const x2 = size / 2 + (radius + 5) * Math.cos((angle * Math.PI) / 180);
            const y2 = size / 2 + (radius + 5) * Math.sin((angle * Math.PI) / 180);

            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={idx <= currentMonth ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.1)'}
                strokeWidth={2}
              />
            );
          })}

          {/* Progress ring with gradient */}
          <defs>
            <linearGradient id="yearProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#yearProgressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))',
            }}
          />

          {/* Current position marker */}
          <motion.circle
            cx={size / 2 + radius * Math.cos(((yearProgress / 100) * 360 - 90) * (Math.PI / 180))}
            cy={size / 2 + radius * Math.sin(((yearProgress / 100) * 360 - 90) * (Math.PI / 180))}
            r={6}
            fill="white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, duration: 0.3 }}
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))',
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            {isBeforeTargetYear ? (
              <>
                <div className="text-3xl font-bold text-white mb-1">
                  {targetYear}
                </div>
                <div className="text-sm text-white/50">Coming Soon</div>
              </>
            ) : (
              <>
                <div className="text-4xl font-bold text-white mb-1">
                  {yearProgress}%
                </div>
                <div className="text-sm text-white/50">Year Complete</div>
              </>
            )}
          </motion.div>
        </div>

        {/* Month labels around the ring */}
        {months.map((month, idx) => {
          const angle = (idx / 12) * 360 - 90;
          const labelRadius = radius + 25;
          const x = size / 2 + labelRadius * Math.cos((angle * Math.PI) / 180);
          const y = size / 2 + labelRadius * Math.sin((angle * Math.PI) / 180);

          return (
            <div
              key={month}
              className={`absolute text-xs transform -translate-x-1/2 -translate-y-1/2 ${
                idx === currentMonth
                  ? 'text-purple-400 font-bold'
                  : idx < currentMonth
                  ? 'text-white/40'
                  : 'text-white/20'
              }`}
              style={{ left: x, top: y }}
            >
              {month}
            </div>
          );
        })}
      </div>

      {/* Stats below the ring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 flex items-center gap-6"
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-2xl font-bold">{daysRemaining}</span>
          </div>
          <div className="text-xs text-white/50">
            {isBeforeTargetYear ? `Days Until ${targetYear}` : 'Days Left'}
          </div>
        </div>

        <div className="w-px h-10 bg-white/10" />

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-2xl font-bold">{stats.totalXP}</span>
          </div>
          <div className="text-xs text-white/50">XP Earned</div>
        </div>
      </motion.div>
    </div>
  );
}
