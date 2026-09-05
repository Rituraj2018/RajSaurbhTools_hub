import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout, DashboardLayout, AdminLayout } from '../layouts';
import {
  HomePage,
  DashboardPage,
  ToolsPage,
  PassportPhotoStudioPage,
  ImageToPdfPage,
  PdfMergePage,
  AadhaarPrintStudioPage,
  AyushmanPrintStudioPage,
  ImageCompressorPage,
  MyFilesPage,
  HistoryPage,
  FavoritesPage,
  NotFoundPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AdminDashboardPage,
  AdminUsersPage,
  AdminToolsPage,
  AdminFilesPage,
  AdminAnalyticsPage,
  CloudCallbackPage,
} from '../pages';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';
import { AdminRoute } from './AdminRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing & Tools Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tools/passport-photo-studio" element={<PassportPhotoStudioPage />} />
        <Route path="/passport-photo-studio" element={<PassportPhotoStudioPage />} />
        <Route path="/tools/image-to-pdf" element={<ImageToPdfPage />} />
        <Route path="/image-to-pdf" element={<ImageToPdfPage />} />
        <Route path="/tools/pdf-merge" element={<PdfMergePage />} />
        <Route path="/pdf-merge" element={<PdfMergePage />} />
        <Route path="/tools/aadhaar-print-studio" element={<AadhaarPrintStudioPage />} />
        <Route path="/aadhaar-print-studio" element={<AadhaarPrintStudioPage />} />
        <Route path="/tools/ayushman-print-tool" element={<AyushmanPrintStudioPage />} />
        <Route path="/ayushman-print-tool" element={<AyushmanPrintStudioPage />} />
        <Route path="/tools/image-compressor" element={<ImageCompressorPage />} />
        <Route path="/image-compressor" element={<ImageCompressorPage />} />
        {/* Cloud OAuth callback — public route used inside OAuth popup */}
        <Route path="/cloud/callback" element={<CloudCallbackPage />} />
      </Route>

      {/* Guest / Auth Routes (Redirects authenticated users to /dashboard) */}
      <Route element={<GuestRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* Protected Dashboard & Tool Routes (Requires authentication, redirects guests to /login) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/passport-photo-studio" element={<PassportPhotoStudioPage />} />
          <Route path="/tools/photo/passport-photo-studio" element={<PassportPhotoStudioPage />} />
          <Route path="/passport-photo-studio" element={<PassportPhotoStudioPage />} />
          <Route path="/tools/image-to-pdf" element={<ImageToPdfPage />} />
          <Route path="/tools/pdf/image-to-pdf" element={<ImageToPdfPage />} />
          <Route path="/image-to-pdf" element={<ImageToPdfPage />} />
          <Route path="/tools/pdf-merge" element={<PdfMergePage />} />
          <Route path="/tools/pdf/pdf-merge" element={<PdfMergePage />} />
          <Route path="/pdf-merge" element={<PdfMergePage />} />
          <Route path="/tools/aadhaar-print-studio" element={<AadhaarPrintStudioPage />} />
          <Route path="/tools/photo/aadhaar-print-studio" element={<AadhaarPrintStudioPage />} />
          <Route path="/aadhaar-print-studio" element={<AadhaarPrintStudioPage />} />
          <Route path="/tools/ayushman-print-tool" element={<AyushmanPrintStudioPage />} />
          <Route path="/tools/photo/ayushman-print-tool" element={<AyushmanPrintStudioPage />} />
          <Route path="/ayushman-print-tool" element={<AyushmanPrintStudioPage />} />
          <Route path="/tools/image-compressor" element={<ImageCompressorPage />} />
          <Route path="/tools/photo/image-compressor" element={<ImageCompressorPage />} />
          <Route path="/image-compressor" element={<ImageCompressorPage />} />
          <Route path="/tools/:category" element={<ToolsPage />} />
          <Route path="/files" element={<MyFilesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/settings" element={<DashboardPage />} />
        </Route>
      </Route>

      {/* Admin Panel Routes (Requires role=admin) */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/tools" element={<AdminToolsPage />} />
          <Route path="/admin/files" element={<AdminFilesPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        </Route>
      </Route>

      {/* 404 Fallback Route */}
      <Route element={<MainLayout />}>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
};
