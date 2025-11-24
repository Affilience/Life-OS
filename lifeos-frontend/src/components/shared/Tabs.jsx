import React, { useState } from 'react';

const Tabs = ({ tabs, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div>
      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
              px-4 py-2 text-sm font-medium transition-all duration-fast
              border-b-2 -mb-px
              ${activeTab === index
                ? 'border-accent text-text-high'
                : 'border-transparent text-text-med hover:text-text-high'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;
