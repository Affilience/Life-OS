# AI Companion - Quick Start Guide

## What We Built

I've implemented a **basic AI companion chat interface** for LifeOS that integrates directly with Claude API. This is **Phase 1 of 6** from the research document—the foundation for a fully personalized AI life coach.

## What's Working Now

✅ **Chat Interface** (`/ai` route)
- Clean, responsive chat UI
- Real-time streaming responses from Claude
- Message history
- Mobile-friendly design

✅ **Claude Integration**
- Direct integration with Claude 3.5 Sonnet API
- Streaming responses for better UX
- Custom system prompt with LifeOS knowledge

✅ **System Knowledge**
- AI knows about all 11 modules
- AI knows all routes and navigation
- AI can guide users to features
- AI understands the gamification system (XP, streaks, equipment)

✅ **Quick Access**
- Added "Ask AI" button to Dashboard quick actions
- Direct route at `/ai`

## How to Use

### 1. Access the AI Companion

**Option 1:** Click the "Ask AI" ✨ button on the Dashboard
**Option 2:** Navigate directly to `/ai` in your browser

### 2. Try These Questions

**Navigation Help:**
- "Where do I log workouts?"
- "How do I track my reading progress?"
- "Where can I see my character avatar?"
- "How do I join a guild?"

**System Questions:**
- "What is the Dashboard for?"
- "How does the XP system work?"
- "What are the different modules?"
- "Explain the Social tab"

**General Help:**
- "How do streaks work?"
- "What quick actions are available?"
- "Tell me about skill trees"

### 3. Expected Behavior

The AI will:
- Answer questions about LifeOS features
- Direct you to specific routes (e.g., "Go to /health to log workouts")
- Explain how modules work
- Provide motivational coaching

## What's NOT Implemented Yet

❌ **User Data Retrieval** (Phase 2)
- AI can't see your actual workout logs, tasks, journal entries, etc.
- No personalized insights based on your data
- No pattern recognition

❌ **Long-Term Memory** (Phase 3)
- AI doesn't remember past conversations after page refresh
- No persistent preferences

❌ **Proactive Suggestions** (Phase 4)
- No automated notifications
- No pattern-based recommendations

❌ **Vector Database** (Phase 2)
- Currently using inline system prompts
- Will add ChromaDB/Pinecone for better knowledge retrieval

## Current Costs

For you (single user):
- **Per conversation** (~10 messages): ~$0.045
- **30 conversations/month**: ~$1.35/month
- **Claude API key**: Your provided key will be billed by Anthropic

## File Structure

```
/src/services/ai/
  claudeService.js          # Claude API integration

/src/pages/
  AICompanion.jsx          # Chat interface component

/ai_knowledge_base/
  system_overview.md       # LifeOS overview
  modules/
    dashboard.md           # Dashboard documentation
    health.md              # Health module docs
    social.md              # Social module docs
  navigation/
    routes.md              # All routes and navigation

/.env.local
  VITE_ANTHROPIC_API_KEY   # Your Claude API key
```

## Next Steps (What We Can Build Next)

### Phase 2: User Data Integration (2-3 weeks)
1. Connect AI to Supabase to read your actual data
2. Implement RAG (Retrieval Augmented Generation) for personalized responses
3. AI can answer "How many workouts did I do this week?"
4. AI can analyze your patterns

### Phase 3: Memory & Persistence (2 weeks)
1. Save conversation history to database
2. AI remembers past conversations
3. AI learns your preferences over time

### Phase 4: Proactive Features (2 weeks)
1. Pattern recognition (workout times, productivity peaks)
2. Proactive suggestions
3. Habit interventions

### Phase 5: Advanced Insights (2 weeks)
1. Cross-module correlation analysis
2. Predictive insights
3. Goal progress tracking

### Phase 6: Privacy & On-Device (2 weeks)
1. Local AI model for sensitive data
2. Hybrid on-device + cloud architecture

## Testing the AI

Try asking:

```
"Where do I log workouts?"
→ AI should respond: "Go to /health or use the 'Log Workout' quick action on the Dashboard"

"How does the leaderboard work?"
→ AI should explain the Social module's leaderboard feature

"What's my XP?"
→ AI will explain it can't see your data yet (not implemented)
```

## Technical Details

**Model:** Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
**Context Window:** 200K tokens
**Streaming:** Yes (for better UX)
**API Cost:** $3/MTok input, $15/MTok output
**Average Response:** ~500 tokens = ~$0.0075

## Troubleshooting

**"Failed to get response from Claude"**
- Check that your API key is correct in `.env.local`
- Restart the dev server after changing `.env.local`

**AI gives wrong information**
- The system knowledge is limited to what's in `ai_knowledge_base/`
- Add more documentation to improve accuracy

**Slow responses**
- Claude API typically responds in 2-5 seconds
- Streaming makes it feel faster

## What You Can Customize

1. **System Prompt** (`/src/pages/AICompanion.jsx` line 75)
   - Change AI personality
   - Add/remove knowledge
   - Adjust tone and style

2. **Knowledge Base** (`/ai_knowledge_base/`)
   - Add more module documentation
   - Document specific features
   - Add user guides

3. **UI** (`/src/pages/AICompanion.jsx`)
   - Change colors
   - Add features (voice input, export chat, etc.)
   - Modify layout

## Ready to Continue?

This is a **solid foundation**. The AI understands LifeOS and can help users navigate.

**Want me to build Phase 2 next?** (User data integration + RAG system)
- AI will be able to see your actual data
- Answer personalized questions
- Analyze your patterns

Let me know what you'd like to tackle next!
