import React, { useState } from 'react';
import { BarChart3, Library, FileText } from 'lucide-react';
import KnowledgeDashboard from '../components/knowledge/KnowledgeDashboard';
import KnowledgeNew from './KnowledgeNew';
import NotesTab from '../components/knowledge/NotesTab';

export default function Knowledge() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'library', name: 'Library', icon: Library },
    { id: 'notes', name: 'Notes', icon: FileText },
  ];

  return (
    <div className="knowledge-page min-h-screen bg-[#0c0a10]">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-[#0c0a10] border-b border-slate-800" data-tour="knowledge-tabs">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-tour={`knowledge-tab-${tab.id}`}
                className={`flex-1 min-w-[120px] px-4 py-4 flex flex-col items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1724]/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="tab-content">
        {activeTab === 'dashboard' && <KnowledgeDashboard />}
        {activeTab === 'library' && <KnowledgeNew />}
        {activeTab === 'notes' && <NotesTab />}
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .tab-content {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
