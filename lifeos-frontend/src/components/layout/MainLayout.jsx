import React, { useState } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import NovaWidget from '../nova/NovaWidget';

/**
 * LifeOS MainLayout (AppShell)
 *
 * Mobile-first responsive layout:
 * - Desktop: Fixed sidebar (250px)
 * - Mobile: Bottom tab navigation + hamburger menu for sidebar
 * - Scrollable content area
 */

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar (drawer on mobile, fixed on desktop) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="md:ml-[250px] min-h-screen mb-20 md:mb-0 relative">
        {children}
      </main>

      {/* Bottom Navigation (mobile only) */}
      <BottomNav />

      {/* Nova AI Companion Widget */}
      <NovaWidget userLevel={15} />
    </div>
  );
};

export default MainLayout;