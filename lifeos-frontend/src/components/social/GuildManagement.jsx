/**
 * Guild Management Panel
 * UI for officers/owners to manage their guild
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Crown,
  UserPlus,
  UserMinus,
  Settings,
  Users,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Send,
  Edit2,
  Save,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { useSocialStore } from '../../stores/socialStore';

export default function GuildManagement() {
  const {
    currentGuild,
    guildMembers,
    guildApplications,
    friends,
    updateGuild,
    kickMember,
    promoteToOfficer,
    demoteFromOfficer,
    transferOwnership,
    fetchGuildApplications,
    reviewApplication,
    sendGuildInvite,
  } = useSocialStore();

  const [activeTab, setActiveTab] = useState('members');
  const [editingGuild, setEditingGuild] = useState(false);
  const [guildForm, setGuildForm] = useState({
    name: '',
    description: '',
    privacy: 'open',
  });
  const [searchInvite, setSearchInvite] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (currentGuild) {
      setGuildForm({
        name: currentGuild.name || '',
        description: currentGuild.description || '',
        privacy: currentGuild.privacy || 'open',
      });
      fetchGuildApplications();
    }
  }, [currentGuild]);

  if (!currentGuild) {
    return (
      <div className="text-center py-8 text-white/60">
        You are not a member of any guild
      </div>
    );
  }

  const isOwner = currentGuild.myRole === 'owner';
  const isOfficer = currentGuild.myRole === 'officer' || isOwner;

  if (!isOfficer) {
    return (
      <div className="text-center py-8 text-white/60">
        <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Only officers and owners can access guild management</p>
      </div>
    );
  }

  const handleSaveGuild = async () => {
    await updateGuild(guildForm);
    setEditingGuild(false);
  };

  const handleKick = async (memberId) => {
    await kickMember(memberId);
    setConfirmAction(null);
  };

  const handlePromote = async (memberId) => {
    await promoteToOfficer(memberId);
    setConfirmAction(null);
  };

  const handleDemote = async (memberId) => {
    await demoteFromOfficer(memberId);
    setConfirmAction(null);
  };

  const handleTransfer = async (memberId) => {
    await transferOwnership(memberId);
    setConfirmAction(null);
  };

  const handleInvite = async (friendId) => {
    const result = await sendGuildInvite(friendId);
    if (!result.error) {
      setSearchInvite('');
    }
  };

  const filteredFriends = friends.filter(f =>
    f.display_name?.toLowerCase().includes(searchInvite.toLowerCase()) &&
    !guildMembers.find(m => m.user?.user_id === f.user_id)
  );

  const tabs = [
    { id: 'members', label: 'Members', icon: Users },
    { id: 'applications', label: 'Applications', icon: UserPlus, count: guildApplications.length },
    { id: 'invite', label: 'Invite', icon: Send },
    ...(isOwner ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
  ];

  return (
    <div className="bg-white/5 rounded-xl border border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{currentGuild.name}</h3>
            <p className="text-sm text-white/60">
              {currentGuild.member_count || guildMembers.length} members •{' '}
              {isOwner ? 'Owner' : 'Officer'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-500/30 text-purple-300 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-2">
            {guildMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    {member.user?.avatar_url ? (
                      <img
                        src={member.user.avatar_url}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium">
                        {member.user?.display_name?.[0] || '?'}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {member.user?.display_name || 'Unknown'}
                      </span>
                      {member.role === 'owner' && (
                        <Crown className="w-4 h-4 text-yellow-400" />
                      )}
                      {member.role === 'officer' && (
                        <Shield className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <p className="text-xs text-white/60">
                      {member.xp_contributed?.toLocaleString() || 0} XP contributed
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {member.role !== 'owner' && isOfficer && (
                  <div className="flex items-center gap-1">
                    {confirmAction?.id === member.id ? (
                      <div className="flex items-center gap-2 bg-red-500/20 rounded-lg px-3 py-1">
                        <span className="text-xs text-red-300">
                          {confirmAction.action === 'kick' && 'Kick member?'}
                          {confirmAction.action === 'promote' && 'Promote to officer?'}
                          {confirmAction.action === 'demote' && 'Remove officer?'}
                          {confirmAction.action === 'transfer' && 'Transfer ownership?'}
                        </span>
                        <button
                          onClick={() => {
                            if (confirmAction.action === 'kick') handleKick(member.user.user_id);
                            if (confirmAction.action === 'promote') handlePromote(member.user.user_id);
                            if (confirmAction.action === 'demote') handleDemote(member.user.user_id);
                            if (confirmAction.action === 'transfer') handleTransfer(member.user.user_id);
                          }}
                          className="p-1 rounded bg-red-500/30 hover:bg-red-500/50"
                        >
                          <Check className="w-3 h-3 text-red-300" />
                        </button>
                        <button
                          onClick={() => setConfirmAction(null)}
                          className="p-1 rounded bg-white/10 hover:bg-white/20"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Promote/Demote */}
                        {isOwner && member.role === 'member' && (
                          <button
                            onClick={() => setConfirmAction({ id: member.id, action: 'promote' })}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-green-400"
                            title="Promote to Officer"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                        )}
                        {isOwner && member.role === 'officer' && (
                          <button
                            onClick={() => setConfirmAction({ id: member.id, action: 'demote' })}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-yellow-400"
                            title="Remove Officer"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        )}
                        {/* Transfer ownership */}
                        {isOwner && (
                          <button
                            onClick={() => setConfirmAction({ id: member.id, action: 'transfer' })}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-yellow-400"
                            title="Transfer Ownership"
                          >
                            <Crown className="w-4 h-4" />
                          </button>
                        )}
                        {/* Kick (officers can kick members, owners can kick anyone) */}
                        {(isOwner || (isOfficer && member.role === 'member')) && (
                          <button
                            onClick={() => setConfirmAction({ id: member.id, action: 'kick' })}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-red-400"
                            title="Kick Member"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-2">
            {guildApplications.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pending applications</p>
              </div>
            ) : (
              guildApplications.map(app => (
                <div
                  key={app.id}
                  className="p-4 bg-white/5 rounded-lg space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      {app.user?.avatar_url ? (
                        <img
                          src={app.user.avatar_url}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {app.user?.display_name?.[0] || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {app.user?.display_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-white/60">
                        Level {app.user?.current_level || 1} •{' '}
                        {app.user?.total_xp?.toLocaleString() || 0} XP
                      </p>
                    </div>
                  </div>

                  {app.message && (
                    <p className="text-sm text-white/80 bg-white/5 rounded-lg p-3">
                      "{app.message}"
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => reviewApplication(app.id, true)}
                      className="flex-1 py-2 px-4 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => reviewApplication(app.id, false)}
                      className="flex-1 py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Invite Tab */}
        {activeTab === 'invite' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchInvite}
                onChange={(e) => setSearchInvite(e.target.value)}
                placeholder="Search friends to invite..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div className="space-y-2">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No friends available to invite</p>
                </div>
              ) : (
                filteredFriends.map(friend => (
                  <div
                    key={friend.user_id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        {friend.avatar_url ? (
                          <img
                            src={friend.avatar_url}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-medium">
                            {friend.display_name?.[0] || '?'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">{friend.display_name}</p>
                        <p className="text-xs text-white/60">Level {friend.current_level || 1}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInvite(friend.user_id)}
                      className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg flex items-center gap-2 text-sm font-medium"
                    >
                      <Send className="w-4 h-4" />
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Settings Tab (Owner only) */}
        {activeTab === 'settings' && isOwner && (
          <div className="space-y-4">
            {editingGuild ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Guild Name
                  </label>
                  <input
                    type="text"
                    value={guildForm.name}
                    onChange={(e) => setGuildForm({ ...guildForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Description
                  </label>
                  <textarea
                    value={guildForm.description}
                    onChange={(e) => setGuildForm({ ...guildForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Privacy
                  </label>
                  <select
                    value={guildForm.privacy}
                    onChange={(e) => setGuildForm({ ...guildForm, privacy: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="open">Open - Anyone can join</option>
                    <option value="apply">Apply - Requires approval</option>
                    <option value="invite_only">Invite Only</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveGuild}
                    className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingGuild(false)}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-white/5 rounded-lg space-y-3">
                  <div>
                    <label className="text-xs text-white/50">Name</label>
                    <p className="text-white">{currentGuild.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-white/50">Description</label>
                    <p className="text-white/80">{currentGuild.description || 'No description'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-white/50">Privacy</label>
                    <p className="text-white capitalize">{currentGuild.privacy || 'Open'}</p>
                  </div>
                </div>

                <button
                  onClick={() => setEditingGuild(true)}
                  className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center gap-2 font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Guild Settings
                </button>

                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Danger Zone</p>
                      <p className="text-xs text-white/60 mt-1">
                        Transfer ownership to another officer or delete the guild. These actions cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
