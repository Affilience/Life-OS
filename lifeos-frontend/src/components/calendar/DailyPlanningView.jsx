/**
 * Daily Planning View - Morning Planning Ritual
 * Based on Sunsama's workflow: Reflect → Import → Plan → Execute → Shutdown
 * Helps users intentionally plan their day
 */

import React, { useState } from 'react';
import { useCalendarStore } from '../../stores/calendarStore';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import {
  Sun,
  Moon,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { EmptyStateInline } from '../ui';

export default function DailyPlanningView() {
  const { getTodaysBlocks, getPlannedTimeForDate, workHoursEnd, workHoursStart } =
    useCalendarStore();
  const { projects } = useKnowledgeStore();

  const [planningStep, setPlanningStep] = useState('reflect'); // reflect, import, plan, ready

  // Helper function for module colors
  const getModuleColor = (module) => {
    const colors = {
      productivity: '#3b82f6',
      health: '#ef4444',
      knowledge: '#f59e0b',
      finance: '#10b981',
      journal: '#8b5cf6',
      skills: '#ec4899',
      calendar: '#06b6d4',
    };
    return colors[module] || '#6b7280';
  };

  const today = new Date().toISOString().split('T')[0];
  const todaysBlocks = getTodaysBlocks();
  const plannedMinutes = getPlannedTimeForDate(today);
  const availableMinutes = (workHoursEnd - workHoursStart) * 60;
  const bufferPercentage = ((availableMinutes - plannedMinutes) / availableMinutes) * 100;

  // Get yesterday's blocks for reflection
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdaysBlocks = useCalendarStore
    .getState()
    .getBlocksForDate(yesterdayStr);

  const completedYesterday = yesterdaysBlocks.filter((b) => b.status === 'completed').length;
  const totalYesterday = yesterdaysBlocks.length;

  // Get tasks that could be scheduled
  const unscheduledTasks = projects.flatMap((project) =>
    project.tasks
      .filter((task) => !task.completed)
      .map((task) => ({
        ...task,
        projectTitle: project.title,
        projectId: project.id,
      }))
  );

  const renderReflectStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
          <Moon className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Yesterday's Reflection</h2>
        <p className="text-white/60">Review what you accomplished</p>
      </div>

      {yesterdaysBlocks.length === 0 ? (
        <EmptyStateInline
          icon={Moon}
          message="No data from yesterday"
          hint="Start planning today to build your history"
          variant="violet"
        />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-[#12101a]/60 border border-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400">
                {completedYesterday}
              </div>
              <div className="text-sm text-white/50 mt-1">Completed</div>
            </div>
            <div className="bg-[#12101a]/60 border border-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">{totalYesterday}</div>
              <div className="text-sm text-white/50 mt-1">Total Blocks</div>
            </div>
            <div className="bg-[#12101a]/60 border border-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">
                {Math.round((completedYesterday / totalYesterday) * 100)}%
              </div>
              <div className="text-sm text-white/50 mt-1">Success Rate</div>
            </div>
          </div>

          {/* Completed blocks */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">What you accomplished:</h3>
            <div className="space-y-2">
              {yesterdaysBlocks
                .filter((b) => b.status === 'completed')
                .map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center gap-3 bg-[#12101a]/40 border border-white/10 rounded-lg p-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-white font-medium">{block.title}</div>
                      <div className="text-sm text-white/50">
                        {block.actualDuration || block.plannedDuration} minutes
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      <button
        onClick={() => setPlanningStep('import')}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
      >
        Continue to Planning
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderImportStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
          <Sparkles className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Import Tasks</h2>
        <p className="text-white/60">Pull in tasks from your projects</p>
      </div>

      {unscheduledTasks.length === 0 ? (
        <div className="text-center py-12">
          <EmptyStateInline
            icon={CheckCircle2}
            message="No unscheduled tasks found"
            hint="All caught up! Continue to plan your time blocks"
            variant="emerald"
          />
          <button
            onClick={() => setPlanningStep('plan')}
            className="mt-4 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
          >
            Continue to Planning
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {unscheduledTasks.slice(0, 10).map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 bg-[#12101a]/40 border border-white/10 hover:border-purple-500/50 rounded-lg p-3 cursor-pointer transition-all"
              >
                <Circle className="w-5 h-5 text-zinc-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium">{task.title}</div>
                  <div className="text-sm text-white/50">{task.projectTitle}</div>
                </div>
                <button className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-sm transition-all">
                  Schedule
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPlanningStep('plan')}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
          >
            Continue to Planning
            <ArrowRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );

  const renderPlanStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 mb-4">
          <Sun className="w-8 h-8 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Today's Plan</h2>
        <p className="text-white/60">Your schedule for today</p>
      </div>

      {/* Capacity Check */}
      <div
        className={`border-2 rounded-lg p-4 ${
          bufferPercentage < 10
            ? 'border-red-500 bg-red-500/10'
            : bufferPercentage < 20
            ? 'border-orange-500 bg-orange-500/10'
            : 'border-green-500 bg-green-500/10'
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          {bufferPercentage < 20 ? (
            <AlertTriangle
              className={`w-5 h-5 ${
                bufferPercentage < 10 ? 'text-red-400' : 'text-orange-400'
              }`}
            />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          )}
          <div className="flex-1">
            <div className="text-white font-semibold">
              {plannedMinutes} minutes planned / {availableMinutes} available
            </div>
            <div className="text-sm text-white/60">
              {bufferPercentage.toFixed(0)}% buffer time remaining
            </div>
          </div>
        </div>

        {bufferPercentage < 20 && (
          <div className="text-sm text-orange-300 mt-2">
            ⚠️ You're scheduling too much! Leave at least 20% buffer time for flexibility.
          </div>
        )}
      </div>

      {/* Today's blocks */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Scheduled blocks ({todaysBlocks.length}):
        </h3>
        {todaysBlocks.length === 0 ? (
          <EmptyStateInline
            icon={Clock}
            message="No blocks scheduled yet"
            hint="Click 'Add Time Block' to start planning your day"
            variant="cyan"
          />
        ) : (
          <div className="space-y-2">
            {todaysBlocks
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((block) => (
                <div
                  key={block.id}
                  className="flex items-center gap-3 bg-[#12101a]/40 border border-white/10 rounded-lg p-3"
                >
                  <Clock className="w-4 h-4 text-white/50 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-white font-medium">{block.title}</div>
                    <div className="text-sm text-white/50">
                      {block.startTime} - {block.endTime} ({block.plannedDuration}m)
                    </div>
                  </div>
                  <div
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${getModuleColor(block.module)}20`,
                      color: getModuleColor(block.module),
                    }}
                  >
                    {block.module}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setPlanningStep('ready')}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
      >
        I'm Ready!
        <TrendingUp className="w-5 h-5" />
      </button>
    </div>
  );

  const renderReadyStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-4">
        <CheckCircle2 className="w-10 h-10 text-white" />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-white mb-2">You're All Set!</h2>
        <p className="text-lg text-white/60">
          Your cosmic day is planned. Time to execute!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
        <div className="bg-[#12101a]/60 border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">{todaysBlocks.length}</div>
          <div className="text-sm text-white/50 mt-1">Time Blocks</div>
        </div>
        <div className="bg-[#12101a]/60 border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">
            {(plannedMinutes / 60).toFixed(1)}h
          </div>
          <div className="text-sm text-white/50 mt-1">Planned Work</div>
        </div>
        <div className="bg-[#12101a]/60 border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">
            {bufferPercentage.toFixed(0)}%
          </div>
          <div className="text-sm text-white/50 mt-1">Buffer Time</div>
        </div>
      </div>

      <div className="pt-6">
        <button
          onClick={() => setPlanningStep('reflect')}
          className="px-6 py-3 bg-[#1a1724] hover:bg-[#221e2e] text-zinc-300 rounded-lg transition-all"
        >
          Start Over
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {['reflect', 'import', 'plan', 'ready'].map((step, index) => (
          <React.Fragment key={step}>
            <div
              className={`w-3 h-3 rounded-full transition-all ${
                planningStep === step
                  ? 'bg-purple-500 ring-4 ring-purple-500/30'
                  : index <
                    ['reflect', 'import', 'plan', 'ready'].indexOf(planningStep)
                  ? 'bg-purple-500'
                  : 'bg-[#221e2e]'
              }`}
            />
            {index < 3 && <div className="w-8 h-0.5 bg-[#221e2e]" />}
          </React.Fragment>
        ))}
      </div>

      {/* Content */}
      <div className="bg-[#12101a]/40 border border-white/10 rounded-xl p-6">
        {planningStep === 'reflect' && renderReflectStep()}
        {planningStep === 'import' && renderImportStep()}
        {planningStep === 'plan' && renderPlanStep()}
        {planningStep === 'ready' && renderReadyStep()}
      </div>
    </div>
  );
}
