import React from 'react';

/**
 * PageHeader - Unified page header component for consistent visual hierarchy
 *
 * Variants:
 * - default: Simple title + subtitle (most pages)
 * - icon: Title with icon box on left (modules with clear identity)
 * - gradient: Gradient text title (gamification/premium sections)
 * - compact: Smaller header for nested views
 * - elevated: Glass card with glowing title (premium feel)
 *
 * Color themes match module colors from design-tokens.css
 */

// Module color mappings
const moduleColors = {
  productivity: {
    primary: '#6366f1',    // Indigo
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    text: 'text-indigo-400',
    gradient: 'from-indigo-400 to-violet-400',
    glow: '0 0 30px rgba(99, 102, 241, 0.3)',
    glowSubtle: '0 0 20px rgba(99, 102, 241, 0.15)',
  },
  health: {
    primary: '#10b981',    // Emerald
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    gradient: 'from-emerald-400 to-teal-400',
    glow: '0 0 30px rgba(16, 185, 129, 0.3)',
    glowSubtle: '0 0 20px rgba(16, 185, 129, 0.15)',
  },
  knowledge: {
    primary: '#8b5cf6',    // Violet
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    gradient: 'from-violet-400 to-purple-400',
    glow: '0 0 30px rgba(139, 92, 246, 0.3)',
    glowSubtle: '0 0 20px rgba(139, 92, 246, 0.15)',
  },
  journal: {
    primary: '#8b5cf6',    // Violet (reflection)
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    gradient: 'from-violet-400 to-pink-400',
    glow: '0 0 30px rgba(139, 92, 246, 0.3)',
    glowSubtle: '0 0 20px rgba(139, 92, 246, 0.15)',
  },
  calendar: {
    primary: '#f43f5e',    // Rose
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    gradient: 'from-rose-400 to-pink-400',
    glow: '0 0 30px rgba(244, 63, 94, 0.3)',
    glowSubtle: '0 0 20px rgba(244, 63, 94, 0.15)',
  },
  financial: {
    primary: '#10b981',    // Emerald
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    gradient: 'from-emerald-400 to-green-400',
    glow: '0 0 30px rgba(16, 185, 129, 0.3)',
    glowSubtle: '0 0 20px rgba(16, 185, 129, 0.15)',
  },
  missions: {
    primary: '#8b5cf6',    // Violet
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    gradient: 'from-purple-400 via-pink-400 to-cyan-400',
    glow: '0 0 30px rgba(139, 92, 246, 0.3)',
    glowSubtle: '0 0 20px rgba(139, 92, 246, 0.15)',
  },
  progress: {
    primary: '#8b5cf6',    // Violet
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    gradient: 'from-purple-400 to-pink-400',
    glow: '0 0 30px rgba(139, 92, 246, 0.3)',
    glowSubtle: '0 0 20px rgba(139, 92, 246, 0.15)',
  },
  habits: {
    primary: '#f59e0b',    // Amber
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    gradient: 'from-amber-400 to-orange-400',
    glow: '0 0 30px rgba(245, 158, 11, 0.3)',
    glowSubtle: '0 0 20px rgba(245, 158, 11, 0.15)',
  },
  social: {
    primary: '#ec4899',    // Pink
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    text: 'text-pink-400',
    gradient: 'from-pink-400 to-rose-400',
    glow: '0 0 30px rgba(236, 72, 153, 0.3)',
    glowSubtle: '0 0 20px rgba(236, 72, 153, 0.15)',
  },
  skills: {
    primary: '#3b82f6',    // Blue
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    gradient: 'from-blue-400 to-cyan-400',
    glow: '0 0 30px rgba(59, 130, 246, 0.3)',
    glowSubtle: '0 0 20px rgba(59, 130, 246, 0.15)',
  },
  character: {
    primary: '#a855f7',    // Purple
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    gradient: 'from-purple-400 to-fuchsia-400',
    glow: '0 0 30px rgba(168, 85, 247, 0.3)',
    glowSubtle: '0 0 20px rgba(168, 85, 247, 0.15)',
  },
  default: {
    primary: '#8b5cf6',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    gradient: 'from-violet-400 to-purple-400',
    glow: '0 0 30px rgba(139, 92, 246, 0.3)',
    glowSubtle: '0 0 20px rgba(139, 92, 246, 0.15)',
  },
};

const PageHeader = ({
  title,
  subtitle,
  stats,           // Quick stats line (e.g., "4h today · 12 tasks")
  icon: Icon,      // Lucide icon component
  module = 'default',
  variant = 'default',  // default, icon, gradient, compact
  actions,
  className = '',
}) => {
  const colors = moduleColors[module] || moduleColors.default;

  // Compact variant - smaller, for nested views
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between mb-4 ${className}`}>
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon className={`w-5 h-5 ${colors.text}`} />
          )}
          <div>
            <h2 className="text-xl font-bold text-white">
              {title}
            </h2>
            {(subtitle || stats) && (
              <p className="text-sm text-white/50">
                {stats || subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    );
  }

  // Gradient variant - for gamification/premium sections
  if (variant === 'gradient') {
    return (
      <div className={`flex items-start justify-between mb-6 ${className}`}>
        <div>
          <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent mb-2 tracking-tight`}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/60 text-sm md:text-base">
              {subtitle}
            </p>
          )}
          {stats && (
            <p className="text-sm text-white/50 mt-1">
              {stats}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    );
  }

  // Elevated variant - glass card with glowing title (premium feel)
  if (variant === 'elevated') {
    return (
      <div className={`mb-4 ${className}`}>
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Gradient border effect */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              padding: '1px',
              background: `linear-gradient(135deg, ${colors.primary}30 0%, transparent 50%, ${colors.primary}15 100%)`,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />

          {/* Inner content */}
          <div className="relative px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div
                  className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}
                  style={{ boxShadow: colors.glowSubtle }}
                >
                  <Icon size={18} className={colors.text} />
                </div>
              )}
              <div>
                <h1
                  className="text-xl md:text-2xl font-bold text-white tracking-tight"
                  style={{ textShadow: colors.glow }}
                >
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-white/40 text-xs md:text-sm">
                    {subtitle}
                  </p>
                )}
                {stats && (
                  <p className={`text-xs ${colors.text}`}>
                    {stats}
                  </p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Icon variant - with icon box on left
  if (variant === 'icon' && Icon) {
    return (
      <div className={`flex items-start justify-between mb-6 ${className}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center flex-shrink-0`}>
            <Icon size={24} className={colors.text} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/60 mt-1 text-sm md:text-base">
                {subtitle}
              </p>
            )}
            {stats && (
              <p className="text-sm text-white/50 mt-1">
                {stats}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    );
  }

  // Default variant - clean, simple
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/60 text-sm md:text-base">
            {subtitle}
          </p>
        )}
        {stats && (
          <p className="text-sm text-white/50">
            {stats}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

// Named export for section headers within pages
export const SectionHeader = ({
  title,
  icon: Icon,
  module = 'default',
  action,
  onActionClick,
  className = '',
}) => {
  const colors = moduleColors[module] || moduleColors.default;

  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        {Icon && <Icon className={`w-5 h-5 ${colors.text}`} />}
        {title}
      </h3>
      {action && onActionClick && (
        <button
          onClick={onActionClick}
          className={`text-sm font-medium ${colors.text} hover:opacity-80 transition-opacity`}
        >
          {action}
        </button>
      )}
    </div>
  );
};
