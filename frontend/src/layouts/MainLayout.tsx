import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '../components/common';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
