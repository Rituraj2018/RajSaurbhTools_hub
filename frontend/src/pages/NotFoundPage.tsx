import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/common';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center shadow-lg">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white">404 - Page Not Found</h1>
        <p className="text-sm text-slate-400">
          The tool or page route you are looking for does not exist in RajSaurbh Tool Hub Pro.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Link to="/">
          <Button variant="outline" size="sm" leftIcon={<Home className="w-4 h-4" />}>
            Hub Home
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="gradient" size="sm" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
            Open Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
