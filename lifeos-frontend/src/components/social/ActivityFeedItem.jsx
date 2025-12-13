/**
 * ActivityFeedItem Component
 * Displays a single activity with like and comment functionality
 */

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useSocialStore } from '../../stores/socialStore';

export default function ActivityFeedItem({ activity, getEventTypeLabel, getModuleColor, formatTimeAgo }) {
  const { likeActivity, commentOnActivity, socialProfile } = useSocialStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    await likeActivity(activity.id);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await commentOnActivity(activity.id, commentText.trim());
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1a1724] border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all duration-150">
      {/* Main Activity */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
          {activity.user?.avatar_url ? (
            <img src={activity.user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>{activity.user?.display_name?.[0] || '?'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white">
            <span className="font-semibold">{activity.user?.display_name || 'User'}</span>
            {' '}
            <span className="text-white/60">{getEventTypeLabel(activity.event_type)}</span>
          </p>
          {activity.event_data?.details && (
            <p className="text-sm text-white/50 mt-1">{activity.event_data.details}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs ${getModuleColor(activity.event_type)}`}>
              {activity.event_type.replace('_', ' ')}
            </span>
            <span className="text-xs text-white/50">•</span>
            <span className="text-xs text-white/50">{formatTimeAgo(activity.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            isLiked ? 'text-pink-400' : 'text-white/50 hover:text-pink-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{(activity.like_count || 0) + (isLiked ? 1 : 0)}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-blue-400 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{activity.comment_count || 0}</span>
          {showComments ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-3">
          {/* Existing Comments */}
          {activity.comments?.length > 0 ? (
            <div className="space-y-2">
              {activity.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs flex-shrink-0 overflow-hidden">
                    {comment.user?.avatar_url ? (
                      <img src={comment.user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{comment.user?.display_name?.[0] || '?'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-white">{comment.user?.display_name || 'User'}</span>
                    <span className="text-white/70 ml-2">{comment.content}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40 text-center py-2">No comments yet. Be the first!</p>
          )}

          {/* Add Comment Input */}
          <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs flex-shrink-0 overflow-hidden">
              {socialProfile?.avatar_url ? (
                <img src={socialProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{socialProfile?.display_name?.[0] || '?'}</span>
              )}
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50"
              maxLength={280}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
