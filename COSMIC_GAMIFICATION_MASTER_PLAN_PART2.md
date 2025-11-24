# 🌌 COSMIC GAMIFICATION MASTER PLAN - PART 2

*Continuation of comprehensive implementation strategy*

---

## 7. DAILY JOURNAL & MOOD TRACKING: "STELLAR LOG"

### Concept
Transform daily journaling into **Stellar Log entries** - like captain's logs in Star Trek, documenting the journey through your personal universe.

### Why Mood Tracking Matters

**Research Findings:**
- Emotional awareness correlates with 35% better decision-making
- Mood patterns reveal productivity/health connections
- Journaling reduces stress by 23% (psychological studies)
- Consistent reflection improves goal achievement by 42%

### Stellar Log Structure

**Morning Check-In: "Launch Sequence"**
```typescript
interface LaunchSequence {
  userId: string;
  date: Date;
  timestamp: Date;

  // Emotional State
  mood: {
    primary: MoodType;      // 😊😐😔😟😡😰
    intensity: number;       // 1-10
    tags: string[];         // ['anxious', 'excited', 'focused']
  };

  // Physical State
  physicalState: {
    energy: number;          // 1-10
    sleepQuality: number;    // 1-10
    sleepHours: number;
    physicalPain?: string;   // Optional notes
  };

  // Mental State
  mentalState: {
    focus: number;           // 1-10
    clarity: number;         // 1-10
    stress: number;          // 1-10
  };

  // Day Setup
  intentions: {
    primaryFocus: string;    // Main goal for today
    secondaryGoals: string[];
    gratitude: string;       // What are you grateful for?
  };

  // Predictions
  predictions: {
    dayRating: number;       // Predict how good today will be (1-10)
    challenges: string[];    // What might be difficult?
  };
}
```

**Evening Check-In: "Mission Debrief"**
```typescript
interface MissionDebrief {
  userId: string;
  date: Date;
  timestamp: Date;

  // Day Rating
  dayRating: {
    overall: number;         // 1-10
    productivity: number;
    wellbeing: number;
    fulfillment: number;
  };

  // Reflections
  reflections: {
    wentWell: string[];      // What went well today?
    wentPoorly: string[];    // What didn't go well?
    learned: string;         // Key learning/insight
    proud: string;           // Something to be proud of
  };

  // Accomplishments
  accomplishments: {
    missionsCompleted: string[];
    unexpectedWins: string[];
    helpedOthers?: string;
  };

  // Tomorrow Prep
  tomorrowPrep: {
    priorities: string[];
    lessonsToApply: string;
    intentionForTomorrow: string;
  };

  // Gratitude
  gratitude: {
    grateful1: string;
    grateful2: string;
    grateful3: string;
  };
}
```

### Mood Tracking System

**Mood Types:**
```typescript
enum MoodType {
  Ecstatic = 'ecstatic',       // 😁 10/10
  Happy = 'happy',             // 😊 8-9/10
  Content = 'content',         // 🙂 6-7/10
  Neutral = 'neutral',         // 😐 5/10
  Melancholic = 'melancholic', // 😔 3-4/10
  Sad = 'sad',                 // 😢 2/10
  Distressed = 'distressed'    // 😰 1/10
}

// Mood attributes (can select multiple)
const MOOD_ATTRIBUTES = [
  'energized', 'tired', 'focused', 'scattered',
  'anxious', 'calm', 'motivated', 'unmotivated',
  'creative', 'blocked', 'social', 'withdrawn',
  'optimistic', 'pessimistic', 'grateful', 'resentful'
];
```

**Mood Constellation Visualization:**
```jsx
<MoodConstellation className="cosmic-card">
  <MoodTimeline>
    {last30Days.map(day => (
      <MoodNode
        key={day.date}
        mood={day.mood}
        position={day.date}
        size={calculateNodeSize(day.mood.intensity)}
        color={getMoodColor(day.mood.primary)}
        onHover={() => showDayDetail(day)}
      />
    ))}
  </MoodTimeline>

  <MoodLegend>
    <LegendItem color={getMoodColor('ecstatic')}>Ecstatic</LegendItem>
    <LegendItem color={getMoodColor('happy')}>Happy</LegendItem>
    <LegendItem color={getMoodColor('content')}>Content</LegendItem>
    <LegendItem color={getMoodColor('neutral')}>Neutral</LegendItem>
    <LegendItem color={getMoodColor('melancholic')}>Melancholic</LegendItem>
    <LegendItem color={getMoodColor('sad')}>Sad</LegendItem>
  </MoodLegend>
</MoodConstellation>
```

### Journal Entry Interface

**Morning Launch Sequence UI:**
```jsx
<LaunchSequenceModal className="cosmic-panel">
  <ModalHeader>
    <Title>🚀 Morning Launch Sequence</Title>
    <Subtitle>Prepare for today's journey</Subtitle>
    <DateDisplay>{formatDate(today)}</DateDisplay>
  </ModalHeader>

  <SectionDivider />

  <MoodSelector>
    <Label>How are you feeling?</Label>
    <MoodGrid>
      {moodTypes.map(mood => (
        <MoodButton
          key={mood.type}
          icon={mood.icon}
          label={mood.label}
          selected={selectedMood === mood.type}
          onClick={() => setSelectedMood(mood.type)}
        />
      ))}
    </MoodGrid>

    <IntensitySlider>
      <Label>Intensity</Label>
      <Slider
        min={1}
        max={10}
        value={moodIntensity}
        onChange={setMoodIntensity}
      />
    </IntensitySlider>

    <MoodAttributes>
      <Label>More specifically... (optional)</Label>
      <AttributeChips>
        {moodAttributes.map(attr => (
          <AttributeChip
            key={attr}
            label={attr}
            selected={selectedAttributes.includes(attr)}
            onClick={() => toggleAttribute(attr)}
          />
        ))}
      </AttributeChips>
    </MoodAttributes>
  </MoodSelector>

  <SectionDivider />

  <PhysicalStateSection>
    <Label>Physical State</Label>

    <QuickRating label="Energy Level" value={energy} onChange={setEnergy} />
    <QuickRating label="Sleep Quality" value={sleepQuality} onChange={setSleepQuality} />

    <SleepHoursInput>
      <Label>Hours of Sleep</Label>
      <NumberInput value={sleepHours} onChange={setSleepHours} />
    </SleepHoursInput>
  </PhysicalStateSection>

  <SectionDivider />

  <IntentionsSection>
    <Label>Today's Primary Focus</Label>
    <TextInput
      placeholder="What's the ONE thing that would make today great?"
      value={primaryFocus}
      onChange={setPrimaryFocus}
      className="cosmic-input"
      maxLength={100}
    />

    <Label>I'm grateful for...</Label>
    <TextArea
      placeholder="Something you appreciate right now"
      value={gratitude}
      onChange={setGratitude}
      className="cosmic-input"
      rows={2}
    />
  </IntentionsSection>

  <ActionButtons>
    <Button variant="cosmic-primary" onClick={submitLaunchSequence}>
      Begin Day's Journey ⚡
    </Button>
  </ActionButtons>
</LaunchSequenceModal>
```

**Evening Mission Debrief UI:**
```jsx
<MissionDebriefModal className="cosmic-panel">
  <ModalHeader>
    <Title>🌙 Mission Debrief</Title>
    <Subtitle>Reflect on today's journey</Subtitle>
  </ModalHeader>

  <DayRating>
    <Label>How was your day overall?</Label>
    <StarRating
      value={overallRating}
      onChange={setOverallRating}
      max={10}
      size="large"
      animated
    />

    <QuickRatings>
      <QuickRating label="Productivity" value={productivity} onChange={setProductivity} />
      <QuickRating label="Wellbeing" value={wellbeing} onChange={setWellbeing} />
      <QuickRating label="Fulfillment" value={fulfillment} onChange={setFulfillment} />
    </QuickRatings>
  </DayRating>

  <SectionDivider />

  <ReflectionSection>
    <PromptCard>
      <PromptIcon>✅</PromptIcon>
      <PromptLabel>What went well today?</PromptLabel>
      <TextArea
        placeholder="Wins, accomplishments, moments of joy..."
        value={wentWell}
        onChange={setWentWell}
        className="cosmic-input"
        rows={3}
      />
    </PromptCard>

    <PromptCard>
      <PromptIcon>🔍</PromptIcon>
      <PromptLabel>What didn't go as planned?</PromptLabel>
      <TextArea
        placeholder="Challenges, frustrations, things to improve..."
        value={wentPoorly}
        onChange={setWentPoorly}
        className="cosmic-input"
        rows={3}
      />
    </PromptCard>

    <PromptCard>
      <PromptIcon>💡</PromptIcon>
      <PromptLabel>Key learning or insight</PromptLabel>
      <TextArea
        placeholder="What did you learn today?"
        value={learned}
        onChange={setLearned}
        className="cosmic-input"
        rows={2}
      />
    </PromptCard>
  </ReflectionSection>

  <SectionDivider />

  <GratitudeSection>
    <Label>Three things I'm grateful for today:</Label>

    <GratitudeInputs>
      <GratitudeInput
        number={1}
        value={grateful1}
        onChange={setGrateful1}
        placeholder="First gratitude..."
      />
      <GratitudeInput
        number={2}
        value={grateful2}
        onChange={setGrateful2}
        placeholder="Second gratitude..."
      />
      <GratitudeInput
        number={3}
        value={grateful3}
        onChange={setGrateful3}
        placeholder="Third gratitude..."
      />
    </GratitudeInputs>
  </GratitudeSection>

  <ActionButtons>
    <Button variant="cosmic-primary" onClick={submitDebrief}>
      Complete Debrief ⚡
    </Button>
  </ActionButtons>
</MissionDebriefModal>
```

### Analytics & Insights

**Mood Patterns Dashboard:**
```jsx
<MoodAnalytics className="cosmic-panel">
  <Section title="Mood Trends">
    <MoodLineChart
      data={moodHistory}
      timeRange={timeRange}
      showPrediction
    />

    <Insights>
      <Insight>
        <Icon>📈</Icon>
        <Text>Your mood improves 23% on workout days</Text>
      </Insight>
      <Insight>
        <Icon>😴</Icon>
        <Text>Sleep &lt;7hrs correlates with 18% lower wellbeing</Text>
      </Insight>
      <Insight>
        <Icon>🎯</Icon>
        <Text>Highest productivity on Tuesdays (avg 8.2/10)</Text>
      </Insight>
    </Insights>
  </Section>

  <Section title="Correlations">
    <CorrelationMatrix>
      <Correlation
        variables={['Mood', 'Sleep']}
        strength={0.72}
        direction="positive"
      />
      <Correlation
        variables={['Productivity', 'Exercise']}
        strength={0.65}
        direction="positive"
      />
      <Correlation
        variables={['Stress', 'Screen Time']}
        strength={-0.58}
        direction="negative"
      />
    </CorrelationMatrix>
  </Section>

  <Section title="Best Days">
    <TopDaysList>
      {bestDays.map(day => (
        <DayCard
          key={day.date}
          date={day.date}
          rating={day.rating}
          mood={day.mood}
          highlights={day.highlights}
          onClick={() => viewDayDetail(day)}
        />
      ))}
    </TopDaysList>
  </Section>
</MoodAnalytics>
```

**Prompt Library:**
```typescript
// Rotating journal prompts to keep things fresh
const JOURNAL_PROMPTS = {
  morning: [
    "What would make today feel successful?",
    "What are you looking forward to today?",
    "What energy do you want to bring to today?",
    "If today were perfect, what would happen?",
    "What's one thing you're excited about right now?"
  ],
  evening: [
    "What surprised you today?",
    "What made you smile today?",
    "What challenged you today, and how did you respond?",
    "What would you do differently if you could redo today?",
    "What are you proud of accomplishing today?",
    "How did you show up for yourself today?",
    "What moment today will you remember a year from now?"
  ],
  deepReflection: [
    "What pattern have you noticed in your life recently?",
    "What's something you're avoiding? Why?",
    "What does your future self need from you right now?",
    "What would you tell your past self from a year ago?",
    "What belief is holding you back?"
  ]
};

// Select prompt based on day/history
function selectPrompt(user, type) {
  const usedPrompts = user.journalHistory.map(e => e.prompt);
  const availablePrompts = JOURNAL_PROMPTS[type].filter(
    p => !usedPrompts.includes(p)
  );

  if (availablePrompts.length === 0) {
    // Reset - they've seen all prompts
    return JOURNAL_PROMPTS[type][0];
  }

  return availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
}
```

### Integration with Other Features

**Mood-Based Recommendations:**
```javascript
function generateMoodRecommendations(todaysMood) {
  if (todaysMood.energy < 4) {
    return {
      message: "Low energy detected. Here are some restoring activities:",
      suggestions: [
        { type: 'mission', mission: 'Take a walk outside' },
        { type: 'mission', mission: 'Light stretching' },
        { type: 'reward', reward: 'Early bedtime tonight' }
      ]
    };
  }

  if (todaysMood.stress > 7) {
    return {
      message: "High stress detected. Consider these calming activities:",
      suggestions: [
        { type: 'mission', mission: '10-minute meditation' },
        { type: 'mission', mission: 'Journal your thoughts' },
        { type: 'reward', reward: 'Watch comfort show' }
      ]
    };
  }

  if (todaysMood.primary === 'ecstatic' && todaysMood.energy > 7) {
    return {
      message: "You're on fire today! Ride this momentum:",
      suggestions: [
        { type: 'mission', mission: 'Tackle your hardest task' },
        { type: 'mission', mission: 'Start that project you\'ve been putting off' },
        { type: 'challenge', challenge: 'Complete 3 missions today' }
      ]
    };
  }

  return null;
}
```

**Stellar Energy Rewards:**
```javascript
// Reward consistency
const JOURNAL_REWARDS = {
  morningCheckIn: { stellar: 10, credits: 2 },
  eveningDebrief: { stellar: 15, credits: 3 },
  bothInOneDay: { stellar: 30, credits: 7 },  // Bonus for complete day
  streak7Days: { stellar: 150, credits: 30 },
  streak30Days: { stellar: 750, credits: 150 }
};
```

---

## 8. LIFE FORCE SYSTEM: "VITAL ENERGY"

### Concept
**Life Force** is your character's health/energy that fluctuates based on daily habits - like HP in games, but tied to real-life wellbeing.

### Why It Works

**Psychological Principles:**
- **Immediate Consequences**: Bad habits show instant "damage"
- **Visual Feedback**: HP bar creates urgency when low
- **Recovery Mechanics**: Encourages self-care
- **Gamifies Wellness**: Makes health tangible

### Life Force Mechanics

**Base System:**
```typescript
interface LifeForce {
  current: number;        // 0-100
  max: number;            // Default 100, can be upgraded
  regenerationRate: number;  // HP per hour (base: 2/hr)
  status: 'Critical' | 'Low' | 'Moderate' | 'High' | 'Peak';
}

// Status thresholds
const LIFE_FORCE_STATUS = {
  Critical: 0-20,    // Red, warning, restricted actions
  Low: 21-40,        // Orange, needs attention
  Moderate: 41-60,   // Yellow, stable
  High: 61-85,       // Green, good
  Peak: 86-100       // Cyan, optimal
};
```

**Actions That Affect Life Force:**

**Positive Actions (Restore HP):**
```typescript
const HP_RESTORATION = {
  // Sleep
  sleepQuality: {
    poor: -10,        // < 4 hours or quality < 3
    fair: +5,         // 4-6 hours or quality 3-5
    good: +15,        // 6-7 hours or quality 6-7
    excellent: +25    // 8+ hours or quality 8-10
  },

  // Exercise
  exercise: {
    light: +5,        // 15-30min light activity
    moderate: +10,    // 30-60min moderate
    intense: +15      // 60+ min or high intensity
  },

  // Nutrition
  nutrition: {
    trackMacros: +3,
    hitProteinGoal: +5,
    vegetables: +3,
    hydration: +5     // 2L+ water
  },

  // Mental Health
  mentalHealth: {
    meditation: +10,
    journaling: +8,
    timeOutdoors: +7,
    socialConnection: +10
  },

  // Rest & Recovery
  restDay: +20,       // Planned rest day
  spaDay: +30,        // Reward redemption
  vacation: +50       // Major recovery
};
```

**Negative Actions (Damage HP):**
```typescript
const HP_DAMAGE = {
  // Sleep
  sleepDeprivation: {
    mild: -5,         // 5-6 hours
    moderate: -15,    // 4-5 hours
    severe: -30       // < 4 hours
  },

  // Poor Habits
  badHabits: {
    skippedExercise: -5,      // Broke exercise streak
    junkFood: -8,             // Logged as poor nutrition day
    excessScreen: -10,        // 6+ hours screen time
    missedMorningRoutine: -5
  },

  // Stress & Burnout
  stress: {
    highStressDay: -10,       // User logs stress > 7/10
    noBreaks: -8,             // Work 8+ hours without breaks
    burnout: -25              // Multiple stress days in a row
  },

  // Neglect
  neglect: {
    ignoredGoals: -5,         // No mission progress
    brokenStreak: -10,        // Lost important streak
    missedJournal: -3         // Skipped daily debrief
  }
};
```

**Automatic Daily Regeneration:**
```javascript
// Passive HP regeneration
function regenerateLifeForce(user) {
  const hoursSinceLastUpdate = calculateHoursSince(user.lastLifeForceUpdate);

  let regenRate = user.lifeForce.regenerationRate;  // Base: 2 HP/hour

  // Bonuses to regen rate
  if (user.currentStreak >= 7) regenRate += 0.5;
  if (user.momentum > 80) regenRate += 1;
  if (user.totalLevel >= 25) regenRate += 0.5;

  const regenAmount = hoursSinceLastUpdate * regenRate;

  return Math.min(
    user.lifeForce.current + regenAmount,
    user.lifeForce.max
  );
}
```

### Visual Representation

**Life Force Bar:**
```jsx
<LifeForceBar className="cosmic-card">
  <BarHeader>
    <Label>❤️ Life Force</Label>
    <Value>{lifeForce.current}/{lifeForce.max}</Value>
    <Status status={lifeForce.status}>{lifeForce.status}</Status>
  </BarHeader>

  <ProgressBar>
    <Fill
      percentage={(lifeForce.current / lifeForce.max) * 100}
      color={getLifeForceColor(lifeForce.status)}
      animated
      glowing={lifeForce.status === 'Peak'}
    />

    <WarningIndicator visible={lifeForce.status === 'Critical'}>
      ⚠️
    </WarningIndicator>
  </ProgressBar>

  <RegenerationInfo>
    <Icon>🔄</Icon>
    <Text>Regenerating +{lifeForce.regenerationRate} HP/hour</Text>
  </RegenerationInfo>

  {lifeForce.status === 'Critical' && (
    <CriticalWarning>
      <Icon>🚨</Icon>
      <Message>Critical Life Force! Take a rest day to recover.</Message>
      <ActionButton onClick={planRestDay}>Plan Recovery</ActionButton>
    </CriticalWarning>
  )}
</LifeForceBar>
```

**HP Change Notifications:**
```jsx
<HPChangeNotification type={change.type}>
  {change.type === 'damage' ? (
    <>
      <DamageIcon>💔</DamageIcon>
      <Message>-{Math.abs(change.amount)} Life Force</Message>
      <Reason>{change.reason}</Reason>
    </>
  ) : (
    <>
      <RestoreIcon>❤️‍🩹</RestoreIcon>
      <Message>+{change.amount} Life Force</Message>
      <Reason>{change.reason}</Reason>
    </>
  )}
</HPChangeNotification>
```

### Life Force Restrictions

**Low HP Penalties:**
```javascript
// When Life Force is Critical (< 20%), impose restrictions
function checkLifeForceRestrictions(user) {
  if (user.lifeForce.status === 'Critical') {
    return {
      canAcceptMissions: false,
      message: "Life Force too low to accept new missions. Focus on recovery.",
      restrictions: [
        "Cannot accept Epic or Legendary missions",
        "Reduced XP gain (50%)",
        "Momentum chains don't break, but no bonuses"
      ],
      suggestedActions: [
        "Get 8+ hours sleep tonight",
        "Take a rest day",
        "Practice self-care",
        "Journal about what's draining you"
      ]
    };
  }

  if (user.lifeForce.status === 'Low') {
    return {
      canAcceptMissions: true,
      message: "Life Force is low. Consider taking it easy.",
      restrictions: [
        "Cannot accept Legendary missions",
        "Reduced XP gain (75%)"
      ],
      suggestedActions: [
        "Prioritize sleep",
        "Light exercise only",
        "Avoid overcommitting"
      ]
    };
  }

  return { canAcceptMissions: true, restrictions: [] };
}
```

**Peak Performance Bonuses:**
```javascript
// When Life Force is Peak (> 85%), grant bonuses
function checkPeakPerformance(user) {
  if (user.lifeForce.status === 'Peak') {
    return {
      bonuses: [
        "+25% XP gain on all activities",
        "+10% Credit earnings",
        "Momentum Shield regeneration 2x faster",
        "Access to Legendary missions"
      ],
      message: "You're operating at peak capacity! Make the most of it!",
      visualEffect: "Glowing aura on avatar"
    };
  }

  return { bonuses: [] };
}
```

### Recovery System

**Rest Day Mechanic:**
```typescript
interface RestDay {
  date: Date;
  type: 'Planned' | 'Emergency';
  hpRestored: number;
  activities: RestActivity[];
}

interface RestActivity {
  type: 'Sleep' | 'Spa' | 'Leisure' | 'Nature' | 'Social';
  duration: number;
  hpBonus: number;
}

// Plan a rest day
function planRestDay(user, date) {
  return {
    date: date,
    type: 'Planned',
    suggestedActivities: [
      { type: 'Sleep', recommendation: 'Sleep in, no alarm' },
      { type: 'Leisure', recommendation: 'Guilt-free entertainment' },
      { type: 'Nature', recommendation: 'Walk in park' },
      { type: 'Social', recommendation: 'Connect with loved ones' }
    ],
    expectedRecovery: 40,  // HP
    streakProtection: true  // Streaks don't break on rest days
  };
}
```

**Emergency Recovery Protocol:**
```jsx
<EmergencyRecoveryModal>
  <AlertIcon>🚨</AlertIcon>
  <Title>Critical Life Force Detected</Title>

  <Message>
    Your Life Force has dropped to {lifeForce.current}%.
    You need immediate recovery to avoid burnout.
  </Message>

  <RecoveryOptions>
    <RecoveryOption onClick={initiateRestDay}>
      <Icon>😴</Icon>
      <Title>Emergency Rest Day</Title>
      <Description>Clear your schedule, focus on recovery</Description>
      <HPBonus>+40 Life Force</HPBonus>
    </RecoveryOption>

    <RecoveryOption onClick={redeemSpaReward}>
      <Icon>💆</Icon>
      <Title>Redeem Spa Reward</Title>
      <Description>Use credits for wellness reward</Description>
      <HPBonus>+30 Life Force</HPBonus>
      <Cost>5000 Credits</Cost>
    </RecoveryOption>

    <RecoveryOption onClick={lightDayActivation}>
      <Icon>🌤️</Icon>
      <Title>Light Day Protocol</Title>
      <Description>Reduce goals, easy missions only</Description>
      <HPBonus>+20 Life Force</HPBonus>
    </RecoveryOption>
  </RecoveryOptions>
</EmergencyRecoveryModal>
```

### HP Analytics

**Life Force History:**
```jsx
<LifeForceAnalytics className="cosmic-panel">
  <LineChart
    data={lifeForceHistory}
    xAxis="date"
    yAxis="lifeForce"
    thresholds={[
      { value: 20, label: 'Critical', color: 'red' },
      { value: 40, label: 'Low', color: 'orange' },
      { value: 85, label: 'Peak', color: 'cyan' }
    ]}
  />

  <Insights>
    <Insight>
      <Icon>📉</Icon>
      <Text>Life Force drops 15% average after poor sleep</Text>
    </Insight>
    <Insight>
      <Icon>📈</Icon>
      <Text>Exercise consistently boosts Life Force by 8-12%</Text>
    </Insight>
    <Insight>
      <Icon>⚠️</Icon>
      <Text>You've hit Critical 3 times this month - need better balance</Text>
    </Insight>
  </Insights>
</LifeForceAnalytics>
```

---

## 9. SOCIAL FEATURES: "SPACE STATION" (Optional/Future)

### Concept
**Space Station** - An optional social hub where users can connect, compete, and collaborate without pressure.

### Why Optional is Better

**Research Shows:**
- Social features boost engagement 30-40% BUT
- Can create anxiety/comparison issues
- Privacy concerns deter some users
- Works best when opt-in

**Our Approach:**
- Default: Fully private
- Opt-in: Friends only OR anonymous leaderboards
- No forced social interaction
- Can disable at any time

### Friend System

**Connection Types:**
```typescript
interface CosmicFriend {
  userId: string;
  friendId: string;
  status: 'Pending' | 'Active';
  shareLevel: 'Minimal' | 'Moderate' | 'Full';
  addedDate: Date;
}

// Share levels
const SHARE_LEVELS = {
  Minimal: {
    visible: ['Level', 'Active modules', 'Achievements'],
    hidden: ['Specific activities', 'Journal entries', 'Mood data']
  },
  Moderate: {
    visible: ['Level', 'Modules', 'Achievements', 'Streaks', 'Missions'],
    hidden: ['Journal entries', 'Mood data', 'Specific times']
  },
  Full: {
    visible: ['Everything except journal content'],
    hidden: ['Journal text content']
  }
};
```

**Friend Feed:**
```jsx
<FriendFeed className="cosmic-panel">
  <FeedHeader>
    <Title>🛰️ Space Station Feed</Title>
    <PrivacyButton onClick={openPrivacySettings}>
      Privacy Settings
    </PrivacyButton>
  </FeedHeader>

  <FeedItems>
    {friendActivities.map(activity => (
      <FeedItem key={activity.id}>
        <UserAvatar user={activity.user} size="small" />

        <ActivityContent>
          {activity.type === 'levelUp' && (
            <Text>
              {activity.user.name} reached <strong>Level {activity.level}</strong>!
            </Text>
          )}

          {activity.type === 'achievement' && (
            <Text>
              {activity.user.name} discovered <strong>{activity.achievement}</strong>
            </Text>
          )}

          {activity.type === 'streak' && (
            <Text>
              {activity.user.name} hit a <strong>{activity.streak}-day streak</strong> in {activity.activity}!
            </Text>
          )}
        </ActivityContent>

        <ActionButtons>
          <Button size="small" variant="ghost" onClick={() => sendEncouragement(activity.user)}>
            ⚡ Encourage
          </Button>
        </ActionButtons>
      </FeedItem>
    ))}
  </FeedItems>
</FriendFeed>
```

### Leaderboards

**Anonymous Leaderboards:**
```jsx
<CosmicLeaderboard className="cosmic-panel">
  <LeaderboardTabs>
    <Tab active={tab === 'global'}>🌌 Global</Tab>
    <Tab active={tab === 'friends'}>👥 Friends</Tab>
  </LeaderboardTabs>

  <TimeRangeSelector>
    <Option selected={range === 'week'}>This Week</Option>
    <Option selected={range === 'month'}>This Month</Option>
    <Option selected={range === 'allTime'}>All Time</Option>
  </TimeRangeSelector>

  <LeaderboardList>
    {leaderboardData.map((entry, index) => (
      <LeaderboardEntry
        key={entry.id}
        rank={index + 1}
        entry={entry}
        isCurrentUser={entry.userId === user.id}
      >
        <Rank className={getRankClass(index)}>#{index + 1}</Rank>

        <UserInfo>
          {tab === 'global' ? (
            <Username>Cosmic Explorer #{entry.anonymousId}</Username>
          ) : (
            <Username>{entry.name}</Username>
          )}
          <Stats>
            {entry.stellarEnergy.toLocaleString()} SE | Level {entry.level}
          </Stats>
        </UserInfo>

        {isCurrentUser && (
          <Badge>You</Badge>
        )}
      </LeaderboardEntry>
    ))}
  </LeaderboardList>

  {user.rank > 10 && (
    <YourRank>
      <Text>Your Rank: #{user.rank}</Text>
      <Text>{leaderboardData[9].stellarEnergy - user.stellarEnergy} SE behind Top 10</Text>
    </YourRank>
  )}
</CosmicLeaderboard>
```

### Group Challenges

**Collaborative Missions:**
```typescript
interface GroupChallenge {
  id: string;
  title: string;
  description: string;
  type: 'Collaborative' | 'Competitive';
  participants: string[];  // User IDs
  startDate: Date;
  endDate: Date;
  goal: {
    type: 'TotalXP' | 'Completions' | 'Streaks';
    target: number;
    current: number;
  };
  rewards: {
    individual: { stellar: number; credits: number; };
    group: string;  // Special reward if group succeeds
  };
}

// Example: Collaborative Challenge
{
  title: "The Productivity Nebula Expedition",
  description: "Team up to collectively earn 50,000 Stellar Energy",
  type: 'Collaborative',
  goal: {
    type: 'TotalXP',
    target: 50000,
    current: 32450
  },
  rewards: {
    individual: { stellar: 500, credits: 100 },
    group: "Exclusive 'Team Explorer' badge + Group photo in Hall of Fame"
  }
}
```

**Challenge UI:**
```jsx
<GroupChallengeCard className="cosmic-card cosmic-lift">
  <ChallengeHeader>
    <ChallengeIcon type={challenge.type} />
    <ChallengeTitle>{challenge.title}</ChallengeTitle>
  </ChallengeHeader>

  <ChallengeDescription>
    {challenge.description}
  </ChallengeDescription>

  <ProgressSection>
    <ProgressBar
      current={challenge.goal.current}
      target={challenge.goal.target}
      showPercentage
      color="plasma-teal"
    />

    <ProgressStats>
      <Stat>
        {challenge.goal.current.toLocaleString()} / {challenge.goal.target.toLocaleString()}
      </Stat>
      <Stat>
        {Math.round((challenge.goal.current / challenge.goal.target) * 100)}% Complete
      </Stat>
    </ProgressStats>
  </ProgressSection>

  <Participants>
    <Label>{challenge.participants.length} Explorers</Label>
    <AvatarGroup users={challenge.participants} max={5} />
  </Participants>

  <TimeRemaining>
    <Icon>⏰</Icon>
    <Text>{calculateTimeRemaining(challenge.endDate)}</Text>
  </TimeRemaining>

  {!isParticipant && (
    <ActionButton variant="cosmic-primary" onClick={joinChallenge}>
      Join Expedition
    </ActionButton>
  )}
</GroupChallengeCard>
```

### Encouragement System

**Send Encouragement:**
```jsx
<EncouragementModal>
  <ModalHeader>
    <Title>⚡ Send Encouragement to {friend.name}</Title>
  </ModalHeader>

  <QuickMessages>
    {ENCOURAGEMENT_MESSAGES.map(msg => (
      <MessageButton
        key={msg.id}
        onClick={() => sendMessage(friend.id, msg.text)}
      >
        {msg.icon} {msg.text}
      </MessageButton>
    ))}
  </QuickMessages>

  <CustomMessage>
    <Label>Or write your own:</Label>
    <TextArea
      placeholder="Write an encouraging message..."
      value={customMessage}
      onChange={setCustomMessage}
      maxLength={200}
    />
    <SendButton onClick={() => sendCustomMessage(friend.id, customMessage)}>
      Send ⚡
    </SendButton>
  </CustomMessage>
</EncouragementModal>

// Predefined messages
const ENCOURAGEMENT_MESSAGES = [
  { id: 1, icon: '🚀', text: 'Keep up the momentum!' },
  { id: 2, icon: '💪', text: 'You\'re crushing it!' },
  { id: 3, icon: '🌟', text: 'Impressive progress!' },
  { id: 4, icon: '🔥', text: 'That streak is fire!' },
  { id: 5, icon: '✨', text: 'Legendary achievement!' }
];
```

---

## 10. TECHNICAL ARCHITECTURE

### Database Schema

**Core Tables:**
```sql
-- Users & Avatar
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cosmic_avatar (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  total_level INT DEFAULT 1,
  stellar_energy BIGINT DEFAULT 0,
  cosmic_credits INT DEFAULT 0,
  archetype VARCHAR(50),
  current_tier VARCHAR(50),
  life_force INT DEFAULT 100,
  life_force_max INT DEFAULT 100,
  customization JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE life_dimensions (
  user_id UUID REFERENCES users(id),
  dimension_name VARCHAR(50),
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  PRIMARY KEY (user_id, dimension_name)
);

-- Missions
CREATE TABLE missions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(200),
  cosmic_narrative TEXT,
  type VARCHAR(50), -- 'Daily', 'Weekly', 'Monthly', 'Challenge'
  difficulty VARCHAR(50),
  objectives JSONB,
  stellar_reward INT,
  credit_reward INT,
  special_reward VARCHAR(255),
  status VARCHAR(50), -- 'Available', 'Active', 'Completed', 'Failed'
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Streaks/Momentum
CREATE TABLE momentum_chains (
  user_id UUID REFERENCES users(id),
  activity_id VARCHAR(100),
  activity_name VARCHAR(200),
  current_chain INT DEFAULT 0,
  longest_chain INT DEFAULT 0,
  total_days INT DEFAULT 0,
  last_activity_date DATE,
  PRIMARY KEY (user_id, activity_id)
);

CREATE TABLE momentum_shields (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  count INT DEFAULT 0,
  max_count INT DEFAULT 3
);

-- Achievements/Discoveries
CREATE TABLE discoveries (
  id UUID PRIMARY KEY,
  name VARCHAR(200),
  scientific_name VARCHAR(200),
  description TEXT,
  category VARCHAR(50),
  rarity VARCHAR(50),
  unlock_condition JSONB,
  rewards JSONB
);

CREATE TABLE user_discoveries (
  user_id UUID REFERENCES users(id),
  discovery_id UUID REFERENCES discoveries(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, discovery_id)
);

-- Rewards
CREATE TABLE rewards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(200),
  description TEXT,
  cost INT, -- Cosmic Credits
  category VARCHAR(50),
  icon VARCHAR(10),
  user_defined BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reward_purchases (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  reward_id UUID REFERENCES rewards(id),
  purchased_at TIMESTAMP DEFAULT NOW(),
  redeemed_at TIMESTAMP,
  rating INT,
  notes TEXT
);

-- Journal/Stellar Log
CREATE TABLE stellar_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  log_date DATE,
  log_type VARCHAR(50), -- 'Launch', 'Debrief'
  entry_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mood_tracking (
  user_id UUID REFERENCES users(id),
  date DATE,
  mood_type VARCHAR(50),
  intensity INT,
  attributes TEXT[],
  energy INT,
  sleep_quality INT,
  sleep_hours DECIMAL,
  PRIMARY KEY (user_id, date)
);

-- Activity Timeline (Central table for all actions)
CREATE TABLE activity_timeline (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMP DEFAULT NOW(),
  activity_type VARCHAR(100),
  module VARCHAR(50),
  data JSONB,
  stellar_energy_gained INT DEFAULT 0,
  credits_gained INT DEFAULT 0,
  life_force_change INT DEFAULT 0
);

-- Constellations (Already have this structure)
-- Re-use existing constellation tables

-- Social (Optional/Future)
CREATE TABLE friendships (
  user_id UUID REFERENCES users(id),
  friend_id UUID REFERENCES users(id),
  status VARCHAR(50),
  share_level VARCHAR(50),
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_id)
);

CREATE TABLE group_challenges (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  description TEXT,
  type VARCHAR(50),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  goal JSONB,
  rewards JSONB,
  created_by UUID REFERENCES users(id)
);

CREATE TABLE challenge_participants (
  challenge_id UUID REFERENCES group_challenges(id),
  user_id UUID REFERENCES users(id),
  contribution INT DEFAULT 0,
  PRIMARY KEY (challenge_id, user_id)
);
```

### API Endpoints

**Core Endpoints:**
```typescript
// Avatar & Stats
GET    /api/avatar/:userId
PUT    /api/avatar/:userId/customize
GET    /api/avatar/:userId/dimensions
POST   /api/avatar/:userId/xp
GET    /api/avatar/:userId/stats

// Missions
GET    /api/missions/:userId/active
GET    /api/missions/:userId/available
POST   /api/missions/:userId/accept
PUT    /api/missions/:missionId/progress
POST   /api/missions/:missionId/complete

// Streaks/Momentum
GET    /api/momentum/:userId/chains
POST   /api/momentum/:userId/activity
GET    /api/momentum/:userId/shields
POST   /api/momentum/:userId/shields/use

// Discoveries
GET    /api/discoveries
GET    /api/discoveries/:userId/unlocked
POST   /api/discoveries/:userId/check-unlock

// Rewards
GET    /api/rewards/:userId
POST   /api/rewards/:userId/create
POST   /api/rewards/:rewardId/purchase
GET    /api/rewards/:userId/history

// Journal
GET    /api/journal/:userId/entries
POST   /api/journal/:userId/launch-sequence
POST   /api/journal/:userId/debrief
GET    /api/journal/:userId/analytics

// Life Force
GET    /api/life-force/:userId
POST   /api/life-force/:userId/update
GET    /api/life-force/:userId/history

// Timeline
GET    /api/timeline/:userId
POST   /api/timeline/:userId/activity

// Analytics
GET    /api/analytics/:userId/overview
GET    /api/analytics/:userId/trends
GET    /api/analytics/:userId/insights

// Social (Future)
GET    /api/social/:userId/friends
POST   /api/social/:userId/friends/add
GET    /api/social/:userId/feed
GET    /api/leaderboard
POST   /api/challenges/:challengeId/join
```

### State Management

**Redux Structure:**
```typescript
interface AppState {
  user: {
    profile: User;
    avatar: CosmicAvatar;
    lifeDimensions: LifeDimension[];
    lifeForce: LifeForce;
  };

  missions: {
    active: Mission[];
    available: Mission[];
    completed: Mission[];
    loading: boolean;
  };

  momentum: {
    chains: MomentumChain[];
    shields: MomentumShields;
    loading: boolean;
  };

  discoveries: {
    all: Discovery[];
    unlocked: string[];
    inProgress: DiscoveryProgress[];
  };

  rewards: {
    marketplace: Reward[];
    purchased: RewardPurchase[];
    wishlist: string[];
  };

  journal: {
    todaysEntry: StellarLog | null;
    recentEntries: StellarLog[];
    analytics: JournalAnalytics;
  };

  constellations: {
    // Existing constellation state
    userProgress: ConstellationProgress[];
    unlockedStars: string[];
  };

  ui: {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    modals: {
      achievementUnlock: Discovery | null;
      missionComplete: Mission | null;
      levelUp: number | null;
    };
  };

  social: {
    friends: CosmicFriend[];
    feed: FeedItem[];
    challenges: GroupChallenge[];
  };
}
```

### Performance Optimizations

**Caching Strategy:**
```javascript
// Cache frequently accessed data
const CACHE_STRATEGY = {
  avatar: 'redis', // 5min TTL
  missions: 'redis', // 1min TTL
  discoveries: 'memory', // 1hr TTL, rarely changes
  leaderboard: 'redis', // 5min TTL
  analytics: 'redis' // 30min TTL, expensive queries
};

// Implement pagination for large datasets
function paginateMissions(userId, page = 1, limit = 10) {
  return db.missions
    .where('user_id', userId)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset((page - 1) * limit);
}
```

**Lazy Loading:**
```jsx
// Lazy load heavy components
const MissionControl = lazy(() => import('./features/missions/MissionControl'));
const CosmicObservatory = lazy(() => import('./features/dashboard/Observatory'));
const DiscoveryGallery = lazy(() => import('./features/discoveries/Gallery'));
```

**Optimistic Updates:**
```javascript
// Update UI immediately, sync with server in background
function completeHabit(habitId) {
  // 1. Update Redux immediately
  dispatch(habitCompleted(habitId));

  // 2. Update UI
  showSuccessToast('Habit completed! +10 Stellar Energy');

  // 3. Sync with server
  api.habits.complete(habitId)
    .catch(error => {
      // Rollback on error
      dispatch(habitCompletedFailed(habitId));
      showErrorToast('Failed to sync. Retrying...');
    });
}
```

---

*Continued in Part 3: Implementation Roadmap, Innovation Strategy, and Success Metrics*
