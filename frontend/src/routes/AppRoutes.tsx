import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout, DashboardLayout } from '../layouts';
import { HomePage, DashboardPage, ToolsPage, NotFoundPage } from '../pages';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public / Landing Routes wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Dashboard App Routes wrapped in DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/:category" element={<ToolsPage />} />
        <Route path="/files" element={<DashboardPage />} />
        <Route path="/history" element={<DashboardPage />} />
        <Route path="/favorites" element={<ToolsPage />} />
        <Route path="/settings" element={<DashboardPage />} />
      </Route>

      {/* 404 Fallback Route */}
      <Route element={<MainLayout />}>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
};
