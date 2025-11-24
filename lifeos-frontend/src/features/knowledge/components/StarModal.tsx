import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Link as LinkIcon, Star, BookOpen, Video, Lightbulb } from 'lucide-react';
import type { KnowledgeStar } from '../types/constellation';

interface StarModalProps {
  star: KnowledgeStar | null;
  onClose: () => void;
}

export function StarModal({ star, onClose }: StarModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return <Lightbulb className="w-5 h-5" />;
      case 'book': return <BookOpen className="w-5 h-5" />;
      case 'media': return <Video className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <AnimatePresence>
      {star && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Animated cosmic particles background */}
          <div className="fixed inset-0 z-50 pointer-events-none">
            <CosmicParticles color={star.color} />
          </div>

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl cosmic-border cosmic-glow">
              {/* Gradient header with star info */}
              <div
                className="relative px-8 py-10 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${star.color}15 0%, ${star.color}05 50%, transparent 100%)`
                }}
              >
                {/* Floating glow orbs */}
                <motion.div
                  animate={{
                    x: [0, 30, 0],
                    y: [0, -20, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-0 right-20 w-64 h-64 rounded-full blur-3xl"
                  style={{ backgroundColor: star.color }}
                />
                <motion.div
                  animate={{
                    x: [0, -40, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-0 left-10 w-80 h-80 rounded-full blur-3xl"
                  style={{ backgroundColor: star.color }}
                />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all group"
                >
                  <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Star type badge */}
                <div className="relative flex items-center gap-3 mb-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="p-3 rounded-2xl cosmic-panel cosmic-border"
                    style={{ borderColor: star.color + '40' }}
                  >
                    <div style={{ color: star.color }}>
                      {getTypeIcon(star.type)}
                    </div>
                  </motion.div>
                  <div>
                    <p className="text-sm text-white/60">{getTypeLabel(star.type)}</p>
                    <p className="text-xs text-white/50">{star.collectionName}</p>
                  </div>
                </div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
                >
                  {star.title}
                </motion.h1>

                {/* Metadata row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="relative flex flex-wrap gap-4 text-sm"
                >
                  {star.createdAt && (
                    <div className="flex items-center gap-2 text-white/60">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(star.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {star.connections.length > 0 && (
                    <div className="flex items-center gap-2 text-white/60">
                      <LinkIcon className="w-4 h-4" />
                      <span>{star.connections.length} connections</span>
                    </div>
                  )}
                  {star.importance !== undefined && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" style={{ color: star.color }} />
                      <span className="text-white/60">Importance: {star.importance}/10</span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Content area with scroll */}
              <div className="relative cosmic-panel overflow-y-auto max-h-[calc(90vh-280px)] px-8 py-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="prose prose-invert prose-purple max-w-none"
                >
                  {/* Tags */}
                  {star.tags && star.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6 not-prose">
                      {star.tags.map((tag, index) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          className="px-3 py-1 rounded-full text-xs font-medium cosmic-border backdrop-blur-sm"
                          style={{
                            backgroundColor: star.color + '20',
                            color: star.color,
                            borderColor: star.color + '40'
                          }}
                        >
                          <Tag className="w-3 h-3 inline mr-1" />
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  )}

                  {/* Main content */}
                  <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {star.content}
                  </div>

                  {/* Connections preview */}
                  {star.connections.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" style={{ color: star.color }} />
                        Connected Knowledge
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 not-prose">
                        {star.connections.slice(0, 6).map((connId, index) => (
                          <motion.div
                            key={connId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            className="p-4 rounded-xl cosmic-border cosmic-panel hover:cosmic-lift transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: star.color }}
                              />
                              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                Connected item {connId.slice(0, 8)}...
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Footer with actions */}
              <div className="relative cosmic-panel cosmic-border-top px-8 py-6">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 rounded-xl font-semibold transition-all cosmic-border"
                      style={{
                        background: `linear-gradient(135deg, ${star.color}30, ${star.color}10)`,
                        color: star.color,
                        borderColor: star.color + '40'
                      }}
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 rounded-xl font-semibold transition-all bg-white/5 hover:bg-white/10 text-white"
                    >
                      Share
                    </motion.button>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    Press ESC to close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Floating cosmic particles in background
 */
function CosmicParticles({ color }: { color: string }) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
            opacity: 0.3
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.5, 0.1],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}
