import React, { useState } from 'react';
import { Briefcase, Clock, FolderKanban, CheckSquare, DollarSign, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Stat from '../components/ui/Stat';
import Badge from '../components/ui/Badge';
import XPBar from '../components/app/XPBar';
import WorkSessionsTab from '../components/productivity/WorkSessionsTab';
import ProjectsTab from '../components/productivity/ProjectsTab';
import TasksTab from '../components/productivity/TasksTab';
import IncomeTab from '../components/productivity/IncomeTab';

/**
 * Supernova - Productivity & Business
 *
 * Track work sessions, projects, tasks, and income
 */

const ProductivityNew = () => {
  const [activeTab, setActiveTab] = useState('sessions');

  // Mock stats
  const stats = {
    todayFocus: 2.5,
    weeklyFocus: 18.5,
    weeklyIncome: 1200,
    activeTasks: 12,
    projectsActive: 3
  };

  const tabs = [
    { id: 'sessions', label: 'Work Sessions', icon: Clock },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'income', label: 'Income', icon: DollarSign }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Simplified Header - removed icon box, kept essential info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-high mb-1">
            Supernova
          </h1>
          <p className="text-sm text-text-dim">
            {stats.todayFocus}h today · {stats.activeTasks} active tasks
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card padding="none">
        <div className="flex border-b border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium
                  border-b-2 -mb-px transition-all duration-fast
                  ${isActive
                    ? 'border-accent text-text-high bg-muted'
                    : 'border-transparent text-text-med hover:text-text-high hover:bg-muted/50'
                  }
                `}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'sessions' && <WorkSessionsTab />}
          {activeTab === 'projects' && <ProjectsTab />}
          {activeTab === 'tasks' && <TasksTab />}
          {activeTab === 'income' && <IncomeTab />}
        </div>
      </Card>
    </div>
  );
};

export default ProductivityNew;
