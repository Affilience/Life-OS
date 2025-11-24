import React from 'react';
import QuestCard from './QuestCard';

export default {
  title: 'App/QuestCard',
  component: QuestCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export const EasyQuest = {
  args: {
    title: 'Read 30 pages',
    description: 'Continue reading your current book',
    xp: 50,
    difficulty: 'easy',
    identityTag: 'Curious',
    completed: false,
  },
};

export const NormalQuest = {
  args: {
    title: 'Morning workout',
    description: 'Complete strength training routine',
    xp: 100,
    difficulty: 'normal',
    identityTag: 'Strong',
    completed: false,
  },
};

export const HardQuest = {
  args: {
    title: 'Deep work session (2 hours)',
    description: 'Focus on high-priority project work without distractions',
    xp: 150,
    difficulty: 'hard',
    identityTag: 'Disciplined',
    completed: false,
  },
};

export const CompletedQuest = {
  args: {
    title: 'Morning meditation',
    description: '10 minutes of focused breathing',
    xp: 75,
    difficulty: 'normal',
    identityTag: 'Centered',
    completed: true,
  },
};

export const NoDescription = {
  args: {
    title: 'Quick task',
    xp: 25,
    difficulty: 'easy',
    identityTag: 'Productive',
    completed: false,
  },
};
