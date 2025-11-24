/**
 * Cosmic Time Block - Individual time block with stellar effects
 * Shows planned vs actual time, energy levels, and module colors
 */

import React, { useState } from 'react';
import { useCalendarStore } from '../../stores/calendarStore';
import {
  Clock,
  CheckCircle2,
  Circle,
  Zap,
  AlertCircle,
  Trash2,
  Edit2,
} from 'lucide-react';

export default function CosmicTimeBlock({ block, heightMultiplier = 1 }) {
  const { updateTimeBlock, deleteTimeBlock, startTimeBlock, completeTimeBlock } =
    useCalendarStore();
  const [showActions, setShowActions] = useState(false);

  // Calculate position and height
  const startHour = parseInt(block.startTime.split(':')[0]);
  const startMinute = parseInt(block.startTime.split(':')[1]);
  const endHour = parseInt(block.endTime.split(':')[0]);
  const endMinute = parseInt(block.endTime.split(':')[1]);

  const pixelsPerHour = 64 * heightMultiplier; // Default 64px per hour, adjustable
  const top = (startHour - 6) * pixelsPerHour + (startMinute / 60) * pixelsPerHour;
  const duration = (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
  const height = duration * pixelsPerHour;

  // Module colors with cosmic theme
  const moduleColors = {
    productivity: { bg: '#3b82f620', border: '#3b82f6', glow: '#3b82f6' },
    health: { bg: '#ef444420', border: '#ef4444', glow: '#ef4444' },
    knowledge: { bg: '#f59e0b20', border: '#f59e0b', glow: '#f59e0b' },
    finance: { bg: '#10b98120', border: '#10b981', glow: '#10b981' },
    journal: { bg: '#8b5cf620', border: '#8b5cf6', glow: '#8b5cf6' },
    skills: { bg: '#ec489920', border: '#ec4899', glow: '#ec4899' },
    calendar: { bg: '#06b6d420', border: '#06b6d4', glow: '#06b6d4' },
  };

  const color = moduleColors[block.module] || moduleColors.calendar;

  // Energy level indicators
  const energyIcons = {
    high: { icon: Zap, color: '#fbbf24' },
    medium: { icon: Zap, color: '#60a5fa' },
    low: { icon: Zap, color: '#94a3b8' },
  };

  const EnergyIcon = energyIcons[block.energyLevel]?.icon || Zap;
  const energyColor = energyIcons[block.energyLevel]?.color || '#94a3b8';

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('Delete this time block?')) {
      deleteTimeBlock(block.id);
    }
  };

  const handleToggleStatus = (e) => {
    e.stopPropagation();
    if (block.status === 'planned') {
      startTimeBlock(block.id);
    } else if (block.status === 'in_progress') {
      completeTimeBlock(block.id);
    }
  };

  const getStatusStyles = () => {
    switch (block.status) {
      case 'completed':
        return 'opacity-70';
      case 'in_progress':
        return 'ring-2 ring-purple-500 ring-opacity-50';
      default:
        return '';
    }
  };

  const getPriorityDot = () => {
    const colors = {
      critical: '#ef4444',
      high: '#f59e0b',
      medium: '#3b82f6',
      low: '#6b7280',
    };
    return colors[block.priority] || colors.medium;
  };

  return (
    <div
      className={`absolute left-1 right-1 rounded-lg overflow-hidden group ${getStatusStyles()}`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: color.bg,
        borderLeft: `3px solid ${color.border}`,
        boxShadow: `0 0 20px ${color.glow}40`,
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Cosmic glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${color.glow}30 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative h-full p-2 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Priority dot */}
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: getPriorityDot() }}
            />

            {/* Time */}
            <span className="text-xs text-white/60 flex-shrink-0">
              {block.startTime}
            </span>

            {/* Energy level */}
            <EnergyIcon
              className="w-3 h-3 flex-shrink-0"
              style={{ color: energyColor }}
            />
          </div>

          {/* Status indicator */}
          <button
            onClick={handleToggleStatus}
            className="flex-shrink-0 hover:scale-110 transition-transform"
          >
            {block.status === 'completed' ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : block.status === 'in_progress' ? (
              <Circle className="w-4 h-4 text-purple-400 animate-pulse" />
            ) : (
              <Circle className="w-4 h-4 text-zinc-600 hover:text-purple-400" />
            )}
          </button>
        </div>

        {/* Title */}
        <div className="flex-1 min-h-0">
          <h4 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
            {block.title}
          </h4>
          {block.notes && (
            <p className="text-xs text-white/50 line-clamp-1 mt-1">{block.notes}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-1 text-xs text-white/50">
            <Clock className="w-3 h-3" />
            <span>{block.plannedDuration}m</span>
          </div>

          {block.actualDuration && block.actualDuration !== block.plannedDuration && (
            <div className="flex items-center gap-1 text-xs">
              <AlertCircle className="w-3 h-3 text-orange-400" />
              <span className="text-orange-400">{block.actualDuration}m</span>
            </div>
          )}

          {block.tags.length > 0 && (
            <span className="text-xs text-zinc-600 truncate">
              #{block.tags[0]}
            </span>
          )}
        </div>

        {/* Hover Actions */}
        {showActions && (
          <div className="absolute top-1 right-1 flex gap-1 bg-[#12101a]/90 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Open edit modal
              }}
              className="p-1 hover:bg-[#1a1724] rounded transition-all"
            >
              <Edit2 className="w-3 h-3 text-white/60" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-500/20 rounded transition-all"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
            </button>
          </div>
        )}
      </div>

      {/* Interruption indicator */}
      {block.interruptions && block.interruptions.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500/50" />
      )}
    </div>
  );
}
