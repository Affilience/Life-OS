import React, { useState } from 'react';
import { Briefcase, Clock, FolderKanban } from 'lucide-react';
import Card from '../components/ui/Card';
import PageHeader from '../components/shared/PageHeader';
import WorkSessionsTab from '../components/productivity/WorkSessionsTab';
import ProjectsTab from '../components/productivity/ProjectsTab';

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
    projectsActive: 3
  };

  const tabs = [
    { id: 'sessions', label: 'Work Sessions', icon: Clock },
    { id: 'projects', label: 'Projects', icon: FolderKanban }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Supernova"
        stats={`${stats.todayFocus}h today · ${stats.projectsActive} projects`}
        icon={Briefcase}
        module="productivity"
        variant="icon"
      />

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
        </div>
      </Card>
    </div>
  );
};

export default ProductivityNew;
