import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Gamepad2,
  Coffee,
  Book,
  Sofa,
  Users,
  Zap,
  Dumbbell,
  Briefcase,
  Sparkles,
  CheckCircle,
  Lock,
  TrendingUp,
  Target,
  Star,
  Clock,
  Filter,
  Search,
  Plus
} from 'lucide-react';

// Reward categories
const CATEGORIES = [
  { id: 'all', label: 'All Rewards', icon: Sparkles },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: '#8a5cff' },
  { id: 'food', label: 'Food & Treats', icon: Coffee, color: '#facc6b' },
  { id: 'content', label: 'Content', icon: Book, color: '#4de8e4' },
  { id: 'rest', label: 'Rest', icon: Sofa, color: '#5af29c' },
  { id: 'social', label: 'Social', icon: Users, color: '#ff6584' },
  { id: 'tools', label: 'Tools', icon: Zap, color: '#288cfa' },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: '#d97757' },
  { id: 'business', label: 'Business', icon: Briefcase, color: '#7b68d9' },
];

// Mock rewards data
const MOCK_REWARDS = [
  // Gaming (Starter tier)
  { id: 1, name: '15-min Gaming Break', description: 'Quick gaming session to recharge', cost: 50, category: 'gaming', icon: '🎮', tier: 'starter' },
  { id: 2, name: '30-min Gaming Session', description: 'Half-hour of your favorite game', cost: 100, category: 'gaming', icon: '🎮', tier: 'starter' },
  { id: 3, name: '1-Hour Gaming Session', description: 'Full gaming hour to yourself', cost: 175, category: 'gaming', icon: '🎮', tier: 'mid' },
  { id: 4, name: 'Gaming Marathon (4hr)', description: 'Epic gaming session weekend treat', cost: 600, category: 'gaming', icon: '🎮', tier: 'aspirational' },
  { id: 5, name: 'New Game Purchase', description: 'Fund for that new game you want', cost: 2000, category: 'gaming', icon: '🎯', tier: 'premium' },

  // Food & Treats
  { id: 6, name: 'Favorite Snack', description: 'Your go-to treat', cost: 50, category: 'food', icon: '🍿', tier: 'starter' },
  { id: 7, name: 'Premium Coffee', description: 'Coffee shop trip', cost: 100, category: 'food', icon: '☕', tier: 'starter' },
  { id: 8, name: 'Fast Food Meal', description: 'Quick satisfying meal', cost: 150, category: 'food', icon: '🍔', tier: 'mid' },
  { id: 9, name: 'Restaurant Meal', description: 'Nice dinner out', cost: 400, category: 'food', icon: '🍽️', tier: 'mid' },
  { id: 10, name: 'Premium Sushi/Steak', description: 'Top-tier meal experience', cost: 800, category: 'food', icon: '🥩', tier: 'aspirational' },

  // Content & Entertainment
  { id: 11, name: 'YouTube Video Time', description: '30 minutes of videos', cost: 40, category: 'content', icon: '📺', tier: 'starter' },
  { id: 12, name: 'TV Episode', description: 'One episode of your show', cost: 100, category: 'content', icon: '📺', tier: 'starter' },
  { id: 13, name: 'Movie Night', description: 'Full movie experience', cost: 250, category: 'content', icon: '🎬', tier: 'mid' },
  { id: 14, name: 'New Book/Audiobook', description: 'Latest read or listen', cost: 500, category: 'content', icon: '📚', tier: 'mid' },
  { id: 15, name: 'Online Course', description: 'Invest in learning', cost: 3000, category: 'content', icon: '🎓', tier: 'premium' },

  // Rest & Recovery
  { id: 16, name: '20-min Power Nap', description: 'Quick energy recharge', cost: 60, category: 'rest', icon: '😴', tier: 'starter' },
  { id: 17, name: 'Sleep In (+30min)', description: 'Extra morning sleep', cost: 100, category: 'rest', icon: '🛏️', tier: 'starter' },
  { id: 18, name: 'Lazy Afternoon', description: 'Guilt-free relaxation', cost: 500, category: 'rest', icon: '🛋️', tier: 'mid' },
  { id: 19, name: 'Full Day Off', description: 'Complete rest day', cost: 1500, category: 'rest', icon: '🌴', tier: 'aspirational' },
  { id: 20, name: 'Weekend Retreat', description: 'Multi-day break planning', cost: 4000, category: 'rest', icon: '🏖️', tier: 'premium' },

  // Social
  { id: 21, name: 'Coffee with Friend', description: 'Social coffee meetup', cost: 200, category: 'social', icon: '☕', tier: 'mid' },
  { id: 22, name: 'Movie with Friends', description: 'Theater trip', cost: 350, category: 'social', icon: '🎬', tier: 'mid' },
  { id: 23, name: 'Concert/Event Ticket', description: 'Live entertainment', cost: 2000, category: 'social', icon: '🎵', tier: 'aspirational' },
  { id: 24, name: 'Weekend Trip', description: 'Getaway with friends', cost: 8000, category: 'social', icon: '✈️', tier: 'premium' },

  // Productivity Tools
  { id: 25, name: 'Premium App (1 month)', description: 'Tool subscription', cost: 300, category: 'tools', icon: '⚡', tier: 'mid' },
  { id: 26, name: 'Software Upgrade', description: 'Better tools', cost: 800, category: 'tools', icon: '💻', tier: 'aspirational' },
  { id: 27, name: 'Tech Gadget Fund', description: 'New device saving', cost: 5000, category: 'tools', icon: '🎧', tier: 'premium' },

  // Fitness
  { id: 28, name: 'Protein Shake', description: 'Post-workout fuel', cost: 75, category: 'fitness', icon: '🥤', tier: 'starter' },
  { id: 29, name: 'Massage Session', description: 'Recovery treatment', cost: 500, category: 'fitness', icon: '💆', tier: 'mid' },
  { id: 30, name: 'Athletic Wear', description: 'New workout gear', cost: 800, category: 'fitness', icon: '👟', tier: 'aspirational' },

  // Business
  { id: 31, name: 'Business Book', description: 'Learning investment', cost: 400, category: 'business', icon: '📖', tier: 'mid' },
  { id: 32, name: 'Networking Event', description: 'Professional connection', cost: 600, category: 'business', icon: '🤝', tier: 'aspirational' },
  { id: 33, name: 'Conference Ticket', description: 'Industry event', cost: 5000, category: 'business', icon: '🎟️', tier: 'premium' },
];

export default function Bazaar() {
  // Mock user credits (would come from store/API)
  const [userCredits, setUserCredits] = useState(850);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('price-asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Get affordability state
  const getAffordabilityState = (cost) => {
    const percentage = (userCredits / cost) * 100;

    if (percentage >= 100) {
      return {
        state: 'affordable',
        color: '#5af29c',
        icon: CheckCircle,
        message: 'Ready to claim!',
        buttonText: 'Purchase Now'
      };
    } else if (percentage >= 75) {
      return {
        state: 'almost',
        color: '#4de8e4',
        icon: TrendingUp,
        message: 'Almost there!',
        buttonText: `Need ${cost - userCredits} more`
      };
    } else if (percentage >= 50) {
      return {
        state: 'halfway',
        color: '#facc6b',
        icon: Target,
        message: 'Keep going!',
        buttonText: `Save ${cost - userCredits} more`
      };
    } else {
      return {
        state: 'locked',
        color: '#666',
        icon: Lock,
        message: 'Long-term goal',
        buttonText: `${cost} credits needed`
      };
    }
  };

  // Filter and sort rewards
  const getFilteredRewards = () => {
    let filtered = MOCK_REWARDS;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.cost - b.cost);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.cost - a.cost);
    } else if (sortBy === 'affordable') {
      filtered.sort((a, b) => {
        const aAfford = userCredits >= a.cost ? 1 : 0;
        const bAfford = userCredits >= b.cost ? 1 : 0;
        return bAfford - aAfford;
      });
    }

    return filtered;
  };

  const handlePurchase = (reward) => {
    setSelectedReward(reward);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    if (selectedReward && userCredits >= selectedReward.cost) {
      setUserCredits(prev => prev - selectedReward.cost);
      setShowPurchaseModal(false);
      // TODO: Show success animation/confetti
      // TODO: Log to timeline
      // TODO: Save to database
    }
  };

  const filteredRewards = getFilteredRewards();

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-yellow-400" />
            Reward Bazaar
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Spend your hard-earned credits on rewards
          </p>
        </div>

        {/* Credit Balance */}
        <div className="px-6 pb-4">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Available Credits</div>
                <div className="text-3xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  {userCredits.toLocaleString()}
                </div>
              </div>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
                Earn More →
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="px-6 pb-3 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search rewards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSortBy('affordable')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                sortBy === 'affordable'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-[#1a1a1a] text-gray-400 border border-white/10 hover:border-white/20'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Affordable Now
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-[#1a1a1a] text-gray-400 border border-white/10 hover:border-white/20 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Sort
            </button>
          </div>

          {/* Sort Options (Collapsible) */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="flex gap-2 overflow-x-auto scrollbar-hide"
            >
              {[
                { id: 'price-asc', label: 'Price: Low to High' },
                { id: 'price-desc', label: 'Price: High to Low' },
                { id: 'affordable', label: 'Affordable First' },
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    sortBy === option.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-[#1a1a1a] text-gray-400 border border-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                  whitespace-nowrap transition-all duration-200
                  ${isActive
                    ? 'bg-white/10 text-white shadow-lg border border-white/20'
                    : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#222] border border-white/10'
                  }
                `}
                style={isActive ? { borderColor: cat.color + '40', backgroundColor: cat.color + '20' } : {}}
              >
                <Icon className="w-4 h-4" style={isActive ? { color: cat.color } : {}} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRewards.map((reward) => {
            const affordability = getAffordabilityState(reward.cost);
            const AffordIcon = affordability.icon;
            const canAfford = userCredits >= reward.cost;
            const progress = Math.min((userCredits / reward.cost) * 100, 100);

            return (
              <motion.div
                key={reward.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 cursor-pointer transition-all hover:border-white/20"
                style={{
                  boxShadow: canAfford ? `0 0 20px ${affordability.color}20` : 'none'
                }}
                onClick={() => handlePurchase(reward)}
              >
                {/* Reward Icon */}
                <div className="text-5xl mb-3 text-center">{reward.icon}</div>

                {/* Reward Details */}
                <h3 className="text-base font-semibold text-white mb-1">{reward.name}</h3>
                <p className="text-xs text-gray-400 mb-4 line-clamp-2">{reward.description}</p>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">{affordability.message}</span>
                    <span className="text-gray-400">{Math.floor(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: affordability.color
                      }}
                    />
                  </div>
                </div>

                {/* Cost & Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-lg font-bold text-white">{reward.cost}</span>
                  </div>
                  <button
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${canAfford
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                        : 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed'
                      }
                    `}
                    disabled={!canAfford}
                  >
                    <AffordIcon className="w-3.5 h-3.5" />
                    {canAfford ? 'Buy' : 'Locked'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredRewards.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">No rewards found</p>
            <p className="text-sm text-gray-600 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPurchaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Reward Preview */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">{selectedReward.icon}</div>
                <h2 className="text-xl font-bold text-white mb-2">{selectedReward.name}</h2>
                <p className="text-sm text-gray-400">{selectedReward.description}</p>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Current Balance:</span>
                  <span className="text-white font-medium">{userCredits} credits</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Reward Cost:</span>
                  <span className="text-red-400 font-medium">-{selectedReward.cost} credits</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">After Purchase:</span>
                  <span className="text-xl font-bold text-white">
                    {userCredits - selectedReward.cost} credits
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPurchase}
                  disabled={userCredits < selectedReward.cost}
                  className={`
                    flex-1 px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2
                    ${userCredits >= selectedReward.cost
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-white'
                      : 'bg-white/5 text-gray-600 cursor-not-allowed'
                    }
                  `}
                >
                  <Sparkles className="w-4 h-4" />
                  Confirm Purchase
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
