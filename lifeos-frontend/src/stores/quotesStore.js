/**
 * Quotes Store - Collection of inspirational quotes
 * Used for loading screens and random displays
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { DEV_USER_ID } from '../lib/dev-auth';

// Supabase sync helpers
const syncQuoteToSupabase = async (quote, action = 'upsert') => {
  try {
    if (action === 'delete') {
      await supabase.from('user_quotes').delete().eq('id', quote.id);
      return;
    }

    const dbQuote = {
      id: quote.id,
      user_id: DEV_USER_ID,
      text: quote.text,
      author: quote.author || 'Unknown',
      category: quote.category || 'custom',
      is_favorite: quote.isFavorite || false,
    };

    await supabase.from('user_quotes').upsert(dbQuote, { onConflict: 'id' });
  } catch (error) {
    console.error('Error syncing quote to Supabase:', error);
  }
};

// Default quotes collection
const DEFAULT_QUOTES = [
  // Productivity & Work
  { id: 1, text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "productivity" },
  { id: 2, text: "Focus on being productive instead of busy.", author: "Tim Ferriss", category: "productivity" },
  { id: 3, text: "Until we can manage time, we can manage nothing else.", author: "Peter Drucker", category: "productivity" },
  { id: 4, text: "Deep work is the ability to focus without distraction on a cognitively demanding task.", author: "Cal Newport", category: "productivity" },
  { id: 5, text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey", category: "productivity" },

  // Success & Achievement
  { id: 6, text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "success" },
  { id: 7, text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "success" },
  { id: 8, text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau", category: "success" },
  { id: 9, text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller", category: "success" },
  { id: 10, text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee", category: "success" },

  // Learning & Growth
  { id: 11, text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi", category: "learning" },
  { id: 12, text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss", category: "learning" },
  { id: 13, text: "Anyone who stops learning is old, whether at twenty or eighty.", author: "Henry Ford", category: "learning" },
  { id: 14, text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King", category: "learning" },
  { id: 15, text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats", category: "learning" },

  // Mindset & Philosophy
  { id: 16, text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford", category: "mindset" },
  { id: 17, text: "The mind is everything. What you think you become.", author: "Buddha", category: "mindset" },
  { id: 18, text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", category: "mindset" },
  { id: 19, text: "The obstacle is the way.", author: "Marcus Aurelius", category: "mindset" },
  { id: 20, text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", category: "mindset" },

  // Health & Fitness
  { id: 21, text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn", category: "health" },
  { id: 22, text: "The greatest wealth is health.", author: "Virgil", category: "health" },
  { id: 23, text: "Physical fitness is the first requisite of happiness.", author: "Joseph Pilates", category: "health" },
  { id: 24, text: "To keep the body in good health is a duty, otherwise we shall not be able to keep our mind strong and clear.", author: "Buddha", category: "health" },
  { id: 25, text: "The body achieves what the mind believes.", author: "Napoleon Hill", category: "health" },

  // Time & Life
  { id: 26, text: "Time is what we want most, but what we use worst.", author: "William Penn", category: "time" },
  { id: 27, text: "The two most powerful warriors are patience and time.", author: "Leo Tolstoy", category: "time" },
  { id: 28, text: "Lost time is never found again.", author: "Benjamin Franklin", category: "time" },
  { id: 29, text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs", category: "time" },
  { id: 30, text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca", category: "time" },

  // Business & Entrepreneurship
  { id: 31, text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "business" },
  { id: 32, text: "Your most unhappy customers are your greatest source of learning.", author: "Bill Gates", category: "business" },
  { id: 33, text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt", category: "business" },
  { id: 34, text: "Price is what you pay. Value is what you get.", author: "Warren Buffett", category: "business" },
  { id: 35, text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "business" },

  // Discipline & Habits
  { id: 36, text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn", category: "discipline" },
  { id: 37, text: "We don't rise to the level of our goals, we fall to the level of our systems.", author: "James Clear", category: "discipline" },
  { id: 38, text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma", category: "discipline" },
  { id: 39, text: "Motivation gets you going, but discipline keeps you growing.", author: "John C. Maxwell", category: "discipline" },
  { id: 40, text: "You will never change your life until you change something you do daily.", author: "John C. Maxwell", category: "discipline" },

  // Creativity & Innovation
  { id: 41, text: "Creativity is intelligence having fun.", author: "Albert Einstein", category: "creativity" },
  { id: 42, text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "creativity" },
  { id: 43, text: "The chief enemy of creativity is good sense.", author: "Pablo Picasso", category: "creativity" },
  { id: 44, text: "Creativity takes courage.", author: "Henri Matisse", category: "creativity" },
  { id: 45, text: "To live a creative life, we must lose our fear of being wrong.", author: "Joseph Chilton Pearce", category: "creativity" },

  // Stoicism
  { id: 46, text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", category: "stoicism" },
  { id: 47, text: "It is not the man who has too little, but the man who craves more, that is poor.", author: "Seneca", category: "stoicism" },
  { id: 48, text: "No man is free who is not master of himself.", author: "Epictetus", category: "stoicism" },
  { id: 49, text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius", category: "stoicism" },
  { id: 50, text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus", category: "stoicism" },
];

export const useQuotesStore = create(
  persist(
    (set, get) => ({
      quotes: DEFAULT_QUOTES,
      customQuotes: [],
      favoriteIds: [],
      lastShownId: null,

      // Initialize from Supabase
      initializeFromSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('user_quotes')
            .select('*')
            .eq('user_id', DEV_USER_ID)
            .order('created_at', { ascending: false })
            .limit(200);

          if (error) throw error;

          if (data && data.length > 0) {
            const customQuotes = data.map(q => ({
              id: q.id,
              text: q.text,
              author: q.author || 'Unknown',
              category: q.category || 'custom',
              isCustom: true,
              isFavorite: q.is_favorite,
              createdAt: q.created_at,
            }));

            // Extract favorite IDs
            const favoriteIds = data.filter(q => q.is_favorite).map(q => q.id);

            set({ customQuotes, favoriteIds });
          }
        } catch (error) {
          console.error('Error initializing quotes from Supabase:', error);
        }
      },

      // Get a random quote
      getRandomQuote: () => {
        const { quotes, customQuotes, lastShownId } = get();
        const allQuotes = [...quotes, ...customQuotes];

        if (allQuotes.length === 0) return null;
        if (allQuotes.length === 1) return allQuotes[0];

        // Avoid showing the same quote twice in a row
        let randomQuote;
        do {
          const randomIndex = Math.floor(Math.random() * allQuotes.length);
          randomQuote = allQuotes[randomIndex];
        } while (randomQuote.id === lastShownId && allQuotes.length > 1);

        set({ lastShownId: randomQuote.id });
        return randomQuote;
      },

      // Get a random quote from a specific category
      getRandomQuoteByCategory: (category) => {
        const { quotes, customQuotes } = get();
        const allQuotes = [...quotes, ...customQuotes];
        const categoryQuotes = allQuotes.filter(q => q.category === category);

        if (categoryQuotes.length === 0) return get().getRandomQuote();

        const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
        return categoryQuotes[randomIndex];
      },

      // Add a custom quote
      addQuote: (quote) => {
        const newQuote = {
          id: crypto.randomUUID(),
          text: quote.text,
          author: quote.author || 'Unknown',
          category: quote.category || 'custom',
          isCustom: true,
          isFavorite: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          customQuotes: [...state.customQuotes, newQuote],
        }));

        // Sync to Supabase
        syncQuoteToSupabase(newQuote);

        return newQuote.id;
      },

      // Remove a custom quote
      removeQuote: (quoteId) => {
        const quoteToDelete = get().customQuotes.find(q => q.id === quoteId);

        set((state) => ({
          customQuotes: state.customQuotes.filter(q => q.id !== quoteId),
          favoriteIds: state.favoriteIds.filter(id => id !== quoteId),
        }));

        // Sync to Supabase
        if (quoteToDelete) {
          syncQuoteToSupabase(quoteToDelete, 'delete');
        }
      },

      // Toggle favorite
      toggleFavorite: (quoteId) => {
        const isFavorite = get().favoriteIds.includes(quoteId);

        set((state) => ({
          favoriteIds: isFavorite
            ? state.favoriteIds.filter(id => id !== quoteId)
            : [...state.favoriteIds, quoteId],
        }));

        // Update custom quote's favorite status and sync
        const customQuote = get().customQuotes.find(q => q.id === quoteId);
        if (customQuote) {
          const updatedQuote = { ...customQuote, isFavorite: !isFavorite };
          set((state) => ({
            customQuotes: state.customQuotes.map(q =>
              q.id === quoteId ? updatedQuote : q
            ),
          }));
          syncQuoteToSupabase(updatedQuote);
        }
      },

      // Get all favorites
      getFavorites: () => {
        const { quotes, customQuotes, favoriteIds } = get();
        const allQuotes = [...quotes, ...customQuotes];
        return allQuotes.filter(q => favoriteIds.includes(q.id));
      },

      // Get all categories
      getCategories: () => {
        const { quotes, customQuotes } = get();
        const allQuotes = [...quotes, ...customQuotes];
        const categories = [...new Set(allQuotes.map(q => q.category))];
        return categories.sort();
      },

      // Get quotes by category
      getQuotesByCategory: (category) => {
        const { quotes, customQuotes } = get();
        const allQuotes = [...quotes, ...customQuotes];
        return allQuotes.filter(q => q.category === category);
      },
    }),
    {
      name: 'lifeos-quotes',
      partialize: (state) => ({
        customQuotes: state.customQuotes,
        favoriteIds: state.favoriteIds,
      }),
    }
  )
);

// Initialize quotes store from Supabase
export const initializeQuotesStore = async () => {
  const store = useQuotesStore.getState();
  await store.initializeFromSupabase();
};
