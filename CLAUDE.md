- # Quanta - Personal Operating System

## Core Vision
Quanta is an integrated personal operating system for tracking productivity, fitness, learning, finances, journaling, calendar, and skills. All modules feed into a central timeline and analytics dashboard that reveals patterns and optimizes life.

## Architecture
- **Frontend:** React + Tailwind CSS (clean, fast, responsive)
- **Backend:** Express.js REST API
- **Database:** PostgreSQL (relational + JSONB for flexibility)
- **Design:** Dark mode default, minimal UI, function over form

## 8 Core Modules
1. **Dashboard** - Unified view, quick stats, correlations, insights
2. **Productivity & Business** - Deep work tracking, projects, tasks, income
3. **Health & Fitness** - Workouts, nutrition, sleep, recovery
4. **Knowledge Management** - Books, podcasts, notes, ideas, implementation
5. **Journal & Diary** - Free-form entries, mood tracking, reflection prompts
6. **Calendar & Time** - Time blocking, planned vs actual, energy mapping
7. **Skills Learning** - Skill cards, practice logs, progression, real-world usage
8. **Financial Tracking** - Income, expenses, net worth, goals, business finances

## Key Principles
- **Interconnected:** All modules write to central timeline. Data flows between modules.
- **Actionable:** Every feature answers "what should I do with this?" Focus on insights that drive behavior.
- **Fast Entry:** If logging is painful, it won't happen. Optimize for speed.
- **Privacy First:** All data local/self-hosted. User owns everything.
- **Iterative:** Build one module well, then add next. Don't build everything at once.

## Development Priority
1. Core infrastructure (routing, database, basic UI)
2. First module fully functional (choose: Productivity, Fitness, or Knowledge)
3. Dashboard with cross-module summary
4. Add modules one at a time
5. Correlation engine and advanced analytics (later)

## Database Design
- Central `timeline` table (timestamp, user_id, module, entry_type, data)
- Module-specific tables with foreign keys to timeline
- JSONB fields for flexible metadata
- Everything timestamped for temporal analysis

## UI Guidelines
- Sidebar navigation (8 modules)
- Top bar (date, quick-add, settings)
- Main content area (module views)
- Clean, readable, fast
- Components reusable across modules
- Consistent color-coding by module

## Current Phase
**Phase 1: Foundation** - Setting up infrastructure and building first module completely.

## Quick Reference
- User is 18, wants to optimize everything, avoid university, build business
- This is personal use (not a product) - can be opinionated and customized
- Data quality over quantity - consistent logging beats perfect logging
- The longer it's used, the more valuable it becomes (compound data)

## Technical Notes
- Use modern React practices (hooks, functional components)
- Keep components small and focused
- Write clean, maintainable code (long-term project)
- Comment complex logic
- Database migrations for schema changes
- API endpoints RESTful and consistent

---
*Keep building. Keep iterating. This is a marathon, not a sprint.*