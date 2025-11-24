import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Video, FileText, CheckCircle, Clock, Star } from 'lucide-react';
import type { KnowledgeStar } from '../types/constellation';

interface CosmicKnowledgeCardProps {
  item: KnowledgeStar;
  onClick: () => void;
  index: number;
}

/**
 * Cosmic-themed knowledge card showing cover, title, author, and progress
 * Used in the card grid view after clicking a constellation
 */
export function CosmicKnowledgeCard({ item, onClick, index }: CosmicKnowledgeCardProps) {
  const getTypeIcon = () => {
    switch (item.type) {
      case 'book': return <BookOpen className="w-4 h-4" />;
      case 'media': return <Video className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getStatusIcon = () => {
    // You can extend this based on actual status in your data
    const isCompleted = item.importance && item.importance > 7;
    return isCompleted ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-yellow-400" />;
  };

  // Mock progress (you'll replace this with real data)
  const progress = item.importance ? (item.importance / 10) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring' }}
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={onClick}
      className="cosmic-card cosmic-border cosmic-glow rounded-xl overflow-hidden cursor-pointer group"
    >
      {/* Cover/Thumbnail */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-900/20 to-pink-900/20 overflow-hidden">
        {/* Placeholder cover - replace with actual image when available */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl opacity-30">
            {item.type === 'book' ? '📚' : item.type === 'media' ? '🎥' : '📝'}
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
          <div className="flex items-center gap-1 text-white">
            {getTypeIcon()}
            <span className="text-xs font-semibold capitalize">{item.type}</span>
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 backdrop-blur-sm">
          {getStatusIcon()}
        </div>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: index * 0.05 + 0.3, duration: 0.8 }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
          {item.title}
        </h3>

        {/* Author/Creator - using content field as placeholder */}
        <p className="text-gray-400 text-xs mb-3 line-clamp-1">
          {item.type === 'note' ? 'Personal note' : 'Unknown author'}
        </p>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{item.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            <span>{item.importance || 0}/10</span>
          </div>
          {progress > 0 && (
            <span className="text-purple-400">{Math.round(progress)}%</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
