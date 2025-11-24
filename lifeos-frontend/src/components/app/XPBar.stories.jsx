import React from 'react';
import XPBar from './XPBar';

export default {
  title: 'App/XPBar',
  component: XPBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export const Default = {
  args: {
    currentXP: 2840,
    maxXP: 5000,
    level: 7,
    showLevel: true,
    showNumbers: true,
    animated: true,
    color: 'accent',
  },
};

export const AlmostComplete = {
  args: {
    currentXP: 4750,
    maxXP: 5000,
    level: 7,
    showLevel: true,
    showNumbers: true,
    animated: true,
    color: 'accent',
  },
};

export const JustStarted = {
  args: {
    currentXP: 500,
    maxXP: 5000,
    level: 1,
    showLevel: true,
    showNumbers: true,
    animated: true,
    color: 'accent',
  },
};

export const HealthDomain = {
  args: {
    currentXP: 1200,
    maxXP: 2000,
    level: 5,
    showLevel: true,
    showNumbers: true,
    animated: true,
    color: 'health',
  },
};

export const WithoutLevel = {
  args: {
    currentXP: 2840,
    maxXP: 5000,
    level: 7,
    showLevel: false,
    showNumbers: true,
    animated: true,
    color: 'accent',
  },
};

export const Minimal = {
  args: {
    currentXP: 2840,
    maxXP: 5000,
    level: 7,
    showLevel: false,
    showNumbers: false,
    animated: true,
    color: 'accent',
  },
};
