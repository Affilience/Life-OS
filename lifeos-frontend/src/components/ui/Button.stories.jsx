import React from 'react';
import Button from './Button';
import { Plus, ArrowRight, Trash2 } from 'lucide-react';

export default {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
  },
};

export const Primary = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'md',
  },
};

export const Ghost = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
    size: 'md',
  },
};

export const Danger = {
  args: {
    children: 'Delete Item',
    variant: 'danger',
    size: 'md',
  },
};

export const WithLeftIcon = {
  args: {
    children: 'Add Item',
    variant: 'primary',
    size: 'md',
    leftIcon: <Plus size={16} />,
  },
};

export const WithRightIcon = {
  args: {
    children: 'Continue',
    variant: 'primary',
    size: 'md',
    rightIcon: <ArrowRight size={16} />,
  },
};

export const Small = {
  args: {
    children: 'Small Button',
    variant: 'primary',
    size: 'sm',
  },
};

export const Large = {
  args: {
    children: 'Large Button',
    variant: 'primary',
    size: 'lg',
  },
};

export const Disabled = {
  args: {
    children: 'Disabled Button',
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
};

export const FullWidth = {
  args: {
    children: 'Full Width Button',
    variant: 'primary',
    size: 'md',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};
