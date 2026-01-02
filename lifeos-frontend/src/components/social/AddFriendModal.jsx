/**
 * Add Friend Modal
 * Search for and send friend requests to other users
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Search,
  UserPlus,
  User,
  Check,
  Loader2,
  Users,
} from 'lucide-react';
import { useSocialStore } from '../../stores/socialStore';

export default function AddFriendModal({ isOpen, onClose }) {
  const sendFriendRequest = useSocialStore((state) => state.sendFriendRequest);
  const sentRequests = useSocialStore((state) => state.sentRequests);

  // Use ref to get stable reference to searchUsers (avoid re-triggering searches on store updates)
  const searchUsersRef = useRef(useSocialStore.getState().searchUsers);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState(null);
  const [sentTo, setSentTo] = useState([]);

  // Debounced search with race condition protection
  // Only depends on searchQuery - NOT on store functions (to prevent re-searches when store updates)
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    // Track which request this is to prevent stale results
    let isCancelled = false;

    const timeoutId = setTimeout(async () => {
      setSearching(true);
      // Use the ref to avoid dependency on store function reference
      const results = await searchUsersRef.current(searchQuery);

      // Only update results if this request wasn't cancelled
      // This prevents older requests from overwriting newer results
      if (!isCancelled) {
        setSearchResults(results);
        setSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      isCancelled = true; // Mark this request as stale
    };
  }, [searchQuery]); // Only re-run when searchQuery changes

  const handleSendRequest = async (userId) => {
    setSendingTo(userId);
    const result = await sendFriendRequest(userId);
    if (!result.error) {
      setSentTo(prev => [...prev, userId]);
    }
    setSendingTo(null);
  };

  const handleClose = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSentTo([]);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center pt-8 sm:pt-4 px-4 pb-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[85vh] sm:max-h-[90vh] bg-gray-900 border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            Add Friend
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or display name..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              autoFocus
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 animate-spin" />
            )}
          </div>
          <p className="text-xs text-white/40 mt-2">
            Type at least 2 characters to search
          </p>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-white/30" />
              <p className="text-white/60">No users found</p>
              <p className="text-sm text-white/40 mt-1">
                Try a different search term
              </p>
            </div>
          )}

          {searchResults.length === 0 && searchQuery.length < 2 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto mb-3 text-white/30" />
              <p className="text-white/60">Search for friends</p>
              <p className="text-sm text-white/40 mt-1">
                Find people by their display name
              </p>
            </div>
          )}

          {searchResults.map((user) => {
            const isSent = sentTo.includes(user.id) ||
                          sentRequests.some(r => r.addressee?.id === user.id);
            const isSending = sendingTo === user.id;

            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-white/60" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.display_name}</p>
                    {user.username && (
                      <p className="text-sm text-blue-400">@{user.username}</p>
                    )}
                    <p className="text-sm text-white/50">
                      Level {user.current_level || 1} · {(user.total_xp || 0).toLocaleString()} XP
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSendRequest(user.id)}
                  disabled={isSent || isSending}
                  className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
                    isSent
                      ? 'bg-green-500/20 text-green-400 cursor-default'
                      : isSending
                      ? 'bg-blue-500/20 text-blue-400 cursor-wait'
                      : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                  }`}
                >
                  {isSent ? (
                    <>
                      <Check className="w-4 h-4" />
                      Sent
                    </>
                  ) : isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Add
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Sent Requests Info */}
        {sentRequests.length > 0 && (
          <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-white/5 border-t border-white/10 flex-shrink-0">
            <p className="text-sm text-white/60">
              <span className="text-blue-400 font-medium">{sentRequests.length}</span> pending sent request{sentRequests.length !== 1 && 's'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
