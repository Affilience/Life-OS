import React, { useState, lazy, Suspense, useEffect } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

// Lazy load NovaWidget - defer AI companion until after initial render
const NovaWidget = lazy(() => import('../nova/NovaWidget'));

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
  const [showNova, setShowNova] = useState(false);

  // Defer Nova widget load until after initial paint (2 second delay)
  useEffect(() => {
    const timer = setTimeout(() => setShowNova(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0a10] text-white">
      {/* Sidebar (drawer on mobile, fixed on desktop) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="md:ml-[250px] min-h-screen mb-20 md:mb-0 relative">
        {children}
      </main>

      {/* Bottom Navigation (mobile only) */}
      <BottomNav />

      {/* Nova AI Companion Widget - lazy loaded after initial render */}
      {showNova && (
        <Suspense fallback={null}>
          <NovaWidget userLevel={15} />
        </Suspense>
      )}
    </div>
  );
};

export default MainLayout;
