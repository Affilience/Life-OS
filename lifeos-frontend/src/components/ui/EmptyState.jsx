import React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';

/**
 * EmptyState - A beautiful, engaging empty state component
 *
 * @param {string} type - The type of empty state (determines illustration)
 *   Options: 'tasks', 'quests', 'rewards', 'workouts', 'meals', 'books',
 *            'journal', 'ideas', 'calendar', 'equipment', 'financial',
 *            'projects', 'notes', 'social', 'generic'
 * @param {string} title - Main heading text
 * @param {string} description - Secondary description text
 * @param {string} actionLabel - CTA button text (optional)
 * @param {function} onAction - CTA button click handler (optional)
 * @param {string} variant - Color variant matching module theme
 *   Options: 'violet', 'emerald', 'cyan', 'amber', 'rose', 'blue', 'orange'
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 */

// SVG Illustrations for different empty state types
const illustrations = {
  tasks: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Clipboard */}
      <rect x="60" y="20" width="80" height="110" rx="8" fill={`${color}15`} stroke={`${color}40`} strokeWidth="2"/>
      <rect x="75" y="10" width="50" height="20" rx="4" fill={`${color}30`}/>
      <circle cx="100" cy="20" r="5" fill={`${color}60`}/>
      {/* Checkboxes */}
      <rect x="75" y="45" width="16" height="16" rx="3" stroke={`${color}40`} strokeWidth="2" strokeDasharray="4 2"/>
      <rect x="75" y="75" width="16" height="16" rx="3" stroke={`${color}30`} strokeWidth="2" strokeDasharray="4 2"/>
      <rect x="75" y="105" width="16" height="16" rx="3" stroke={`${color}20`} strokeWidth="2" strokeDasharray="4 2"/>
      {/* Lines */}
      <rect x="100" y="50" width="30" height="6" rx="3" fill={`${color}30`}/>
      <rect x="100" y="80" width="25" height="6" rx="3" fill={`${color}20`}/>
      <rect x="100" y="110" width="20" height="6" rx="3" fill={`${color}15`}/>
      {/* Sparkle */}
      <circle cx="150" cy="40" r="3" fill={`${color}60`}/>
      <circle cx="45" cy="90" r="2" fill={`${color}40`}/>
    </svg>
  ),

  quests: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Scroll */}
      <path d="M50 30 C50 20 60 15 70 15 L150 15 C160 15 170 25 170 35 L170 125 C170 135 160 145 150 145 L70 145 C60 145 50 135 50 125 Z"
            fill={`${color}10`} stroke={`${color}40`} strokeWidth="2"/>
      {/* Scroll top curl */}
      <ellipse cx="50" cy="30" rx="8" ry="15" fill={`${color}20`} stroke={`${color}40`} strokeWidth="2"/>
      <ellipse cx="170" cy="30" rx="8" ry="15" fill={`${color}20`} stroke={`${color}40`} strokeWidth="2"/>
      {/* Quest marker */}
      <circle cx="100" cy="70" r="25" fill={`${color}20`} stroke={`${color}50`} strokeWidth="2"/>
      <text x="100" y="78" textAnchor="middle" fill={`${color}80`} fontSize="24" fontWeight="bold">?</text>
      {/* Stars */}
      <path d="M140 50 L142 55 L148 55 L143 59 L145 65 L140 61 L135 65 L137 59 L132 55 L138 55 Z" fill={`${color}50`}/>
      <path d="M65 100 L66 103 L70 103 L67 106 L68 110 L65 107 L62 110 L63 106 L60 103 L64 103 Z" fill={`${color}40`}/>
      {/* Decorative lines */}
      <rect x="70" y="110" width="60" height="4" rx="2" fill={`${color}25`}/>
      <rect x="80" y="120" width="40" height="4" rx="2" fill={`${color}15`}/>
    </svg>
  ),

  rewards: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Gift box */}
      <rect x="55" y="70" width="90" height="70" rx="6" fill={`${color}15`} stroke={`${color}40`} strokeWidth="2"/>
      {/* Box lid */}
      <rect x="50" y="55" width="100" height="20" rx="4" fill={`${color}25`} stroke={`${color}50`} strokeWidth="2"/>
      {/* Ribbon vertical */}
      <rect x="95" y="55" width="10" height="85" fill={`${color}40`}/>
      {/* Ribbon horizontal */}
      <rect x="55" y="80" width="90" height="10" fill={`${color}40`}/>
      {/* Bow */}
      <ellipse cx="85" cy="50" rx="15" ry="10" fill={`${color}50`}/>
      <ellipse cx="115" cy="50" rx="15" ry="10" fill={`${color}50`}/>
      <circle cx="100" cy="52" r="8" fill={`${color}60`}/>
      {/* Sparkles */}
      <circle cx="45" cy="45" r="3" fill={`${color}50`}/>
      <circle cx="160" cy="60" r="4" fill={`${color}40`}/>
      <circle cx="155" cy="100" r="2" fill={`${color}30`}/>
    </svg>
  ),

  workouts: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Dumbbell */}
      <rect x="30" y="65" width="20" height="30" rx="3" fill={`${color}40`}/>
      <rect x="150" y="65" width="20" height="30" rx="3" fill={`${color}40`}/>
      <rect x="40" y="55" width="10" height="50" rx="2" fill={`${color}50`}/>
      <rect x="150" y="55" width="10" height="50" rx="2" fill={`${color}50`}/>
      {/* Bar */}
      <rect x="50" y="75" width="100" height="10" rx="5" fill={`${color}30`}/>
      {/* Motion lines */}
      <path d="M85 45 C90 40, 110 40, 115 45" stroke={`${color}30`} strokeWidth="2" strokeLinecap="round"/>
      <path d="M80 35 C90 28, 110 28, 120 35" stroke={`${color}20`} strokeWidth="2" strokeLinecap="round"/>
      {/* Heart rate */}
      <path d="M60 120 L70 120 L75 110 L85 130 L95 100 L105 130 L110 120 L140 120"
            stroke={`${color}50`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),

  meals: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Plate */}
      <ellipse cx="100" cy="100" rx="70" ry="25" fill={`${color}10`} stroke={`${color}30`} strokeWidth="2"/>
      <ellipse cx="100" cy="95" rx="55" ry="18" fill={`${color}15`} stroke={`${color}25`} strokeWidth="1"/>
      {/* Fork */}
      <rect x="35" y="30" width="3" height="60" rx="1" fill={`${color}40`}/>
      <rect x="30" y="30" width="2" height="20" rx="1" fill={`${color}40`}/>
      <rect x="35" y="30" width="2" height="20" rx="1" fill={`${color}40`}/>
      <rect x="40" y="30" width="2" height="20" rx="1" fill={`${color}40`}/>
      {/* Knife */}
      <path d="M165 30 L165 70 C165 75 160 80 160 85 L160 90" stroke={`${color}40`} strokeWidth="3" strokeLinecap="round"/>
      <path d="M165 30 L170 30 L170 60 C170 65 165 68 165 70" fill={`${color}30`}/>
      {/* Steam */}
      <path d="M85 60 Q80 50 85 40" stroke={`${color}30`} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M100 55 Q95 45 100 35" stroke={`${color}25`} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M115 60 Q110 50 115 40" stroke={`${color}20`} strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),

  books: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Stack of books */}
      <rect x="50" y="100" width="100" height="20" rx="2" fill={`${color}30`} stroke={`${color}50`} strokeWidth="1"/>
      <rect x="55" y="80" width="90" height="20" rx="2" fill={`${color}25`} stroke={`${color}45`} strokeWidth="1"/>
      <rect x="60" y="60" width="80" height="20" rx="2" fill={`${color}20`} stroke={`${color}40`} strokeWidth="1"/>
      {/* Open book on top */}
      <path d="M70 55 Q100 45 100 30 Q100 45 130 55 L130 60 Q100 50 100 35 Q100 50 70 60 Z"
            fill={`${color}15`} stroke={`${color}40`} strokeWidth="1"/>
      {/* Book spine details */}
      <rect x="52" y="102" width="3" height="16" rx="1" fill={`${color}50`}/>
      <rect x="57" y="82" width="3" height="16" rx="1" fill={`${color}45`}/>
      {/* Reading sparkle */}
      <circle cx="145" cy="45" r="4" fill={`${color}50`}/>
      <circle cx="55" cy="50" r="3" fill={`${color}40`}/>
    </svg>
  ),

  journal: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Journal book */}
      <rect x="55" y="25" width="90" height="115" rx="4" fill={`${color}20`} stroke={`${color}40`} strokeWidth="2"/>
      {/* Spine */}
      <rect x="55" y="25" width="12" height="115" rx="2" fill={`${color}35`}/>
      {/* Pages */}
      <rect x="70" y="35" width="65" height="95" rx="2" fill={`${color}08`}/>
      {/* Writing lines */}
      <rect x="80" y="50" width="45" height="3" rx="1" fill={`${color}20`}/>
      <rect x="80" y="60" width="40" height="3" rx="1" fill={`${color}15`}/>
      <rect x="80" y="70" width="35" height="3" rx="1" fill={`${color}10`}/>
      {/* Bookmark */}
      <path d="M120 25 L120 55 L125 50 L130 55 L130 25" fill={`${color}50`}/>
      {/* Pen */}
      <rect x="150" y="60" width="6" height="50" rx="2" fill={`${color}40`} transform="rotate(20 150 60)"/>
      <path d="M165 105 L168 115 L162 115 Z" fill={`${color}50`} transform="rotate(20 165 110)"/>
    </svg>
  ),

  ideas: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Light bulb */}
      <circle cx="100" cy="60" r="40" fill={`${color}15`} stroke={`${color}40`} strokeWidth="2"/>
      {/* Bulb glow */}
      <circle cx="100" cy="60" r="50" fill={`${color}05`}/>
      {/* Filament */}
      <path d="M85 55 Q90 65 100 55 Q110 65 115 55" stroke={`${color}50`} strokeWidth="2" fill="none"/>
      {/* Base */}
      <rect x="85" y="100" width="30" height="8" rx="2" fill={`${color}30`}/>
      <rect x="88" y="108" width="24" height="6" rx="2" fill={`${color}35`}/>
      <rect x="91" y="114" width="18" height="6" rx="2" fill={`${color}40`}/>
      {/* Rays */}
      <line x1="100" y1="5" x2="100" y2="15" stroke={`${color}40`} strokeWidth="3" strokeLinecap="round"/>
      <line x1="145" y1="20" x2="138" y2="28" stroke={`${color}35`} strokeWidth="3" strokeLinecap="round"/>
      <line x1="55" y1="20" x2="62" y2="28" stroke={`${color}35`} strokeWidth="3" strokeLinecap="round"/>
      <line x1="160" y1="60" x2="150" y2="60" stroke={`${color}30`} strokeWidth="3" strokeLinecap="round"/>
      <line x1="40" y1="60" x2="50" y2="60" stroke={`${color}30`} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),

  calendar: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Calendar body */}
      <rect x="45" y="35" width="110" height="100" rx="8" fill={`${color}10`} stroke={`${color}40`} strokeWidth="2"/>
      {/* Header */}
      <rect x="45" y="35" width="110" height="25" rx="8" fill={`${color}25`}/>
      <rect x="45" y="50" width="110" height="10" fill={`${color}25`}/>
      {/* Rings */}
      <rect x="70" y="28" width="8" height="18" rx="4" fill={`${color}40`}/>
      <rect x="122" y="28" width="8" height="18" rx="4" fill={`${color}40`}/>
      {/* Grid */}
      <rect x="55" y="70" width="18" height="18" rx="3" fill={`${color}08`}/>
      <rect x="78" y="70" width="18" height="18" rx="3" fill={`${color}08`}/>
      <rect x="101" y="70" width="18" height="18" rx="3" fill={`${color}08`}/>
      <rect x="124" y="70" width="18" height="18" rx="3" fill={`${color}08`}/>
      <rect x="55" y="93" width="18" height="18" rx="3" fill={`${color}08`}/>
      <rect x="78" y="93" width="18" height="18" rx="3" fill={`${color}08`}/>
      <rect x="101" y="93" width="18" height="18" rx="3" fill={`${color}20`} stroke={`${color}50`} strokeWidth="2"/>
      <rect x="124" y="93" width="18" height="18" rx="3" fill={`${color}08`}/>
      {/* Today marker */}
      <circle cx="110" cy="102" r="4" fill={`${color}60`}/>
    </svg>
  ),

  equipment: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Shield */}
      <path d="M100 20 L140 35 L140 80 C140 110 100 140 100 140 C100 140 60 110 60 80 L60 35 Z"
            fill={`${color}15`} stroke={`${color}40`} strokeWidth="2"/>
      {/* Shield emblem */}
      <circle cx="100" cy="70" r="25" fill={`${color}25`} stroke={`${color}45`} strokeWidth="2"/>
      {/* Star in shield */}
      <path d="M100 52 L104 64 L117 64 L107 72 L111 85 L100 77 L89 85 L93 72 L83 64 L96 64 Z"
            fill={`${color}50`}/>
      {/* Sword behind */}
      <rect x="42" y="25" width="6" height="80" rx="2" fill={`${color}30`} transform="rotate(-15 42 25)"/>
      <path d="M38 20 L48 25 L48 30 L43 32 L38 30 L38 25 Z" fill={`${color}40`} transform="rotate(-15 43 26)"/>
      {/* Sparkle */}
      <circle cx="155" cy="45" r="4" fill={`${color}50`}/>
    </svg>
  ),

  financial: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Coins stack */}
      <ellipse cx="70" cy="110" rx="30" ry="10" fill={`${color}30`}/>
      <ellipse cx="70" cy="100" rx="30" ry="10" fill={`${color}35`}/>
      <ellipse cx="70" cy="90" rx="30" ry="10" fill={`${color}40`}/>
      {/* Coin detail */}
      <text x="70" y="94" textAnchor="middle" fill={`${color}70`} fontSize="12" fontWeight="bold">$</text>
      {/* Chart going up */}
      <path d="M110 120 L125 100 L140 110 L155 70 L170 50"
            stroke={`${color}50`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Arrow at end */}
      <path d="M165 45 L175 45 L175 55" stroke={`${color}50`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Grid lines */}
      <line x1="110" y1="50" x2="110" y2="120" stroke={`${color}15`} strokeWidth="1"/>
      <line x1="110" y1="120" x2="180" y2="120" stroke={`${color}15`} strokeWidth="1"/>
    </svg>
  ),

  projects: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Folder back */}
      <path d="M40 45 L40 130 C40 135 45 140 50 140 L150 140 C155 140 160 135 160 130 L160 55 C160 50 155 45 150 45 L100 45 L90 35 L50 35 C45 35 40 40 40 45 Z"
            fill={`${color}20`} stroke={`${color}40`} strokeWidth="2"/>
      {/* Folder front */}
      <rect x="45" y="60" width="110" height="75" rx="5" fill={`${color}15`} stroke={`${color}35`} strokeWidth="1"/>
      {/* Document */}
      <rect x="70" y="50" width="60" height="70" rx="3" fill={`${color}08`} stroke={`${color}30`} strokeWidth="1"/>
      <rect x="80" y="65" width="40" height="4" rx="2" fill={`${color}25`}/>
      <rect x="80" y="75" width="35" height="4" rx="2" fill={`${color}20`}/>
      <rect x="80" y="85" width="30" height="4" rx="2" fill={`${color}15`}/>
      {/* Checkmark */}
      <circle cx="145" cy="50" r="15" fill={`${color}40`}/>
      <path d="M138 50 L143 55 L153 45" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  notes: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Multiple notes */}
      <rect x="70" y="30" width="80" height="100" rx="4" fill={`${color}15`} stroke={`${color}35`} strokeWidth="1" transform="rotate(5 110 80)"/>
      <rect x="60" y="25" width="80" height="100" rx="4" fill={`${color}12`} stroke={`${color}30`} strokeWidth="1" transform="rotate(-3 100 75)"/>
      <rect x="50" y="20" width="80" height="100" rx="4" fill={`${color}10`} stroke={`${color}40`} strokeWidth="2"/>
      {/* Lines on note */}
      <rect x="60" y="40" width="50" height="4" rx="2" fill={`${color}25`}/>
      <rect x="60" y="52" width="45" height="4" rx="2" fill={`${color}20`}/>
      <rect x="60" y="64" width="55" height="4" rx="2" fill={`${color}15`}/>
      <rect x="60" y="76" width="40" height="4" rx="2" fill={`${color}12`}/>
      {/* Pin */}
      <circle cx="90" cy="15" r="8" fill={`${color}50`}/>
      <rect x="88" y="20" width="4" height="10" rx="1" fill={`${color}40`}/>
    </svg>
  ),

  social: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* People circles */}
      <circle cx="100" cy="50" r="25" fill={`${color}20`} stroke={`${color}40`} strokeWidth="2"/>
      <circle cx="60" cy="100" r="20" fill={`${color}15`} stroke={`${color}35`} strokeWidth="2"/>
      <circle cx="140" cy="100" r="20" fill={`${color}15`} stroke={`${color}35`} strokeWidth="2"/>
      {/* Person icons */}
      <circle cx="100" cy="42" r="8" fill={`${color}40`}/>
      <path d="M85 65 Q100 55 115 65" fill={`${color}35`}/>
      <circle cx="60" cy="93" r="6" fill={`${color}35`}/>
      <path d="M48 113 Q60 105 72 113" fill={`${color}30`}/>
      <circle cx="140" cy="93" r="6" fill={`${color}35`}/>
      <path d="M128 113 Q140 105 152 113" fill={`${color}30`}/>
      {/* Connection lines */}
      <line x1="80" y1="65" x2="70" y2="85" stroke={`${color}25`} strokeWidth="2" strokeDasharray="4 2"/>
      <line x1="120" y1="65" x2="130" y2="85" stroke={`${color}25`} strokeWidth="2" strokeDasharray="4 2"/>
      <line x1="80" y1="100" x2="120" y2="100" stroke={`${color}20`} strokeWidth="2" strokeDasharray="4 2"/>
    </svg>
  ),

  generic: (color) => (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Empty box */}
      <path d="M100 30 L160 55 L160 115 L100 140 L40 115 L40 55 Z"
            fill={`${color}10`} stroke={`${color}40`} strokeWidth="2"/>
      <path d="M100 30 L100 90 L40 115 L40 55 Z" fill={`${color}15`}/>
      <path d="M100 90 L160 115 L160 55 L100 30" fill={`${color}08`}/>
      <line x1="100" y1="30" x2="100" y2="90" stroke={`${color}30`} strokeWidth="1"/>
      {/* Sparkles suggesting potential */}
      <circle cx="100" cy="80" r="3" fill={`${color}40`}/>
      <circle cx="85" cy="70" r="2" fill={`${color}30`}/>
      <circle cx="115" cy="70" r="2" fill={`${color}30`}/>
      {/* Dotted lines suggesting content to come */}
      <path d="M70 100 L90 100" stroke={`${color}25`} strokeWidth="2" strokeDasharray="3 3"/>
      <path d="M110 100 L130 100" stroke={`${color}25`} strokeWidth="2" strokeDasharray="3 3"/>
    </svg>
  ),
};

// Color mappings for different variants
const colorMap = {
  violet: '#8b5cf6',
  emerald: '#10b981',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  rose: '#f43f5e',
  blue: '#3b82f6',
  orange: '#f97316',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
};

export default function EmptyState({
  type = 'generic',
  title = 'Nothing here yet',
  description = 'Get started by adding your first item',
  actionLabel,
  onAction,
  variant = 'violet',
  size = 'md',
  className = '',
}) {
  const color = colorMap[variant] || colorMap.violet;
  const IllustrationSVG = illustrations[type] || illustrations.generic;

  const sizeClasses = {
    sm: {
      container: 'py-8 px-4',
      illustration: 'w-24 h-20 mb-4',
      title: 'text-base',
      description: 'text-sm',
      button: 'px-4 py-2 text-sm',
    },
    md: {
      container: 'py-12 px-6',
      illustration: 'w-40 h-32 mb-6',
      title: 'text-lg',
      description: 'text-sm',
      button: 'px-6 py-3 text-sm',
    },
    lg: {
      container: 'py-16 px-8',
      illustration: 'w-52 h-40 mb-8',
      title: 'text-xl',
      description: 'text-base',
      button: 'px-8 py-4 text-base',
    },
  };

  const sizes = sizeClasses[size] || sizeClasses.md;

  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-center ${sizes.container} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Illustration */}
      <motion.div
        className={`${sizes.illustration}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {IllustrationSVG(color)}
      </motion.div>

      {/* Title */}
      <motion.h3
        className={`font-semibold text-white mb-2 ${sizes.title}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        className={`text-white/50 max-w-sm mb-6 ${sizes.description}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {description}
      </motion.p>

      {/* CTA Button */}
      {actionLabel && onAction && (
        <motion.button
          onClick={onAction}
          className={`
            inline-flex items-center gap-2 font-medium rounded-xl
            transition-all duration-200
            hover:scale-105 hover:shadow-lg
            active:scale-95
            ${sizes.button}
          `}
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            boxShadow: `0 4px 20px ${color}40`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{
            boxShadow: `0 6px 25px ${color}50`,
          }}
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

// Also export a simpler inline version for smaller contexts
export function EmptyStateInline({
  icon: Icon,
  message,
  hint,
  variant = 'violet'
}) {
  const color = colorMap[variant] || colorMap.violet;

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {Icon && (
        <Icon
          className="w-10 h-10 mb-3"
          style={{ color: `${color}60` }}
        />
      )}
      <p className="text-white/60 text-sm">{message}</p>
      {hint && <p className="text-white/40 text-xs mt-1">{hint}</p>}
    </div>
  );
}
