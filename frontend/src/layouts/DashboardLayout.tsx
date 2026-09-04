import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, Header } from '../components/dashboard';
import { Footer } from '../components/common';

export const DashboardLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-600 selection:text-white">
      {/* Sidebar (Desktop Persistent & Mobile Drawer) */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto flex flex-col justify-between">
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};
