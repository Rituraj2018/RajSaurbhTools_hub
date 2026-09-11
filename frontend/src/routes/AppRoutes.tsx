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
  AdminWebsitesPage,
  CloudCallbackPage,
  PdfSplitPage,
  QrGeneratorPage,
  PanPrintStudioPage,
  SignatureCropperPage,
  PngToJpgPage,
  JpgToPngPage,
  PdfToWordPage,
  WordToPdfPage,
  ImageResizerPage,
  FileProtectorPage,
  FeedbackPage,
  UnauthorizedPage,
  IdCardMakerPage,
  IdCardPrintStudioPage,
  IdCardPhotoMakerPage,
  IdCardResizePage,
  IdCardPdfGeneratorPage,
  IdCardSheetMakerPage,
  IdCardQrGeneratorPage,
  IdCardBarcodeGeneratorPage,
  IdCardTemplateMakerPage,
  IdCardPrintPreviewPage,
  IdCardFormGeneratorPage,
  ImageCropperPage,
  ImageToSvgPage,
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
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/tools/passport-photo-studio" element={<PassportPhotoStudioPage />} />
        <Route path="/passport-photo-studio" element={<PassportPhotoStudioPage />} />
        <Route path="/tools/image-to-pdf" element={<ImageToPdfPage />} />
        <Route path="/image-to-pdf" element={<ImageToPdfPage />} />
        <Route path="/tools/pdf-merge" element={<PdfMergePage />} />
        <Route path="/pdf-merge" element={<PdfMergePage />} />
        <Route path="/tools/pdf-split" element={<PdfSplitPage />} />
        <Route path="/pdf-split" element={<PdfSplitPage />} />
        <Route path="/tools/aadhaar-print-studio" element={<AadhaarPrintStudioPage />} />
        <Route path="/aadhaar-print-studio" element={<AadhaarPrintStudioPage />} />
        <Route path="/tools/ayushman-print-tool" element={<AyushmanPrintStudioPage />} />
        <Route path="/ayushman-print-tool" element={<AyushmanPrintStudioPage />} />
        <Route path="/tools/pan-print-studio" element={<PanPrintStudioPage />} />
        <Route path="/pan-print-studio" element={<PanPrintStudioPage />} />
        <Route path="/tools/image-compressor" element={<ImageCompressorPage />} />
        <Route path="/image-compressor" element={<ImageCompressorPage />} />
        <Route path="/tools/qr-generator" element={<QrGeneratorPage />} />
        <Route path="/qr-generator" element={<QrGeneratorPage />} />
        <Route path="/tools/signature-cropper" element={<SignatureCropperPage />} />
        <Route path="/signature-cropper" element={<SignatureCropperPage />} />
        <Route path="/tools/png-to-jpg" element={<PngToJpgPage />} />
        <Route path="/png-to-jpg" element={<PngToJpgPage />} />
        <Route path="/tools/jpg-to-png" element={<JpgToPngPage />} />
        <Route path="/jpg-to-png" element={<JpgToPngPage />} />
        <Route path="/tools/pdf-to-word" element={<PdfToWordPage />} />
        <Route path="/pdf-to-word" element={<PdfToWordPage />} />
        <Route path="/tools/word-to-pdf" element={<WordToPdfPage />} />
        <Route path="/word-to-pdf" element={<WordToPdfPage />} />
        <Route path="/tools/image-resizer" element={<ImageResizerPage />} />
        <Route path="/image-resizer" element={<ImageResizerPage />} />
        <Route path="/tools/file-password-protector" element={<FileProtectorPage />} />
        <Route path="/file-password-protector" element={<FileProtectorPage />} />
        {/* ID Card Tools Public Routes */}
        <Route path="/tools/id-card-maker" element={<IdCardMakerPage />} />
        <Route path="/id-card-maker" element={<IdCardMakerPage />} />
        <Route path="/tools/id-card-print-studio" element={<IdCardPrintStudioPage />} />
        <Route path="/id-card-print-studio" element={<IdCardPrintStudioPage />} />
        <Route path="/tools/id-card-photo-maker" element={<IdCardPhotoMakerPage />} />
        <Route path="/id-card-photo-maker" element={<IdCardPhotoMakerPage />} />
        <Route path="/tools/id-card-resize" element={<IdCardResizePage />} />
        <Route path="/id-card-resize" element={<IdCardResizePage />} />
        <Route path="/tools/id-card-pdf-generator" element={<IdCardPdfGeneratorPage />} />
        <Route path="/id-card-pdf-generator" element={<IdCardPdfGeneratorPage />} />
        <Route path="/tools/id-card-sheet-maker" element={<IdCardSheetMakerPage />} />
        <Route path="/id-card-sheet-maker" element={<IdCardSheetMakerPage />} />
        <Route path="/tools/id-card-qr-generator" element={<IdCardQrGeneratorPage />} />
        <Route path="/id-card-qr-generator" element={<IdCardQrGeneratorPage />} />
        <Route path="/tools/id-card-barcode-generator" element={<IdCardBarcodeGeneratorPage />} />
        <Route path="/id-card-barcode-generator" element={<IdCardBarcodeGeneratorPage />} />
        <Route path="/tools/id-card-template-maker" element={<IdCardTemplateMakerPage />} />
        <Route path="/id-card-template-maker" element={<IdCardTemplateMakerPage />} />
        <Route path="/tools/id-card-print-preview" element={<IdCardPrintPreviewPage />} />
        <Route path="/id-card-print-preview" element={<IdCardPrintPreviewPage />} />
        <Route path="/tools/id-card-form-generator" element={<IdCardFormGeneratorPage />} />
        <Route path="/id-card-form-generator" element={<IdCardFormGeneratorPage />} />
        {/* Crop Tools — public routes */}
        <Route path="/tools/image-cropper" element={<ImageCropperPage />} />
        <Route path="/image-cropper" element={<ImageCropperPage />} />
        {/* Image to SVG Converter — public routes */}
        <Route path="/tools/image-to-svg" element={<ImageToSvgPage />} />
        <Route path="/image-to-svg" element={<ImageToSvgPage />} />
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
          <Route path="/tools/pdf-split" element={<PdfSplitPage />} />
          <Route path="/tools/pdf/pdf-split" element={<PdfSplitPage />} />
          <Route path="/pdf-split" element={<PdfSplitPage />} />
          <Route path="/tools/aadhaar-print-studio" element={<AadhaarPrintStudioPage />} />
          <Route path="/tools/photo/aadhaar-print-studio" element={<AadhaarPrintStudioPage />} />
          <Route path="/aadhaar-print-studio" element={<AadhaarPrintStudioPage />} />
          <Route path="/tools/ayushman-print-tool" element={<AyushmanPrintStudioPage />} />
          <Route path="/tools/photo/ayushman-print-tool" element={<AyushmanPrintStudioPage />} />
          <Route path="/ayushman-print-tool" element={<AyushmanPrintStudioPage />} />
          <Route path="/tools/pan-print-studio" element={<PanPrintStudioPage />} />
          <Route path="/tools/document/pan-print-studio" element={<PanPrintStudioPage />} />
          <Route path="/pan-print-studio" element={<PanPrintStudioPage />} />
          <Route path="/tools/image-compressor" element={<ImageCompressorPage />} />
          <Route path="/tools/photo/image-compressor" element={<ImageCompressorPage />} />
          <Route path="/image-compressor" element={<ImageCompressorPage />} />
          <Route path="/tools/qr-generator" element={<QrGeneratorPage />} />
          <Route path="/tools/utility/qr-generator" element={<QrGeneratorPage />} />
          <Route path="/qr-generator" element={<QrGeneratorPage />} />
          <Route path="/tools/signature-cropper" element={<SignatureCropperPage />} />
          <Route path="/tools/photo/signature-cropper" element={<SignatureCropperPage />} />
          <Route path="/signature-cropper" element={<SignatureCropperPage />} />
          <Route path="/tools/png-to-jpg" element={<PngToJpgPage />} />
          <Route path="/tools/image/png-to-jpg" element={<PngToJpgPage />} />
          <Route path="/png-to-jpg" element={<PngToJpgPage />} />
          <Route path="/tools/jpg-to-png" element={<JpgToPngPage />} />
          <Route path="/tools/image/jpg-to-png" element={<JpgToPngPage />} />
          <Route path="/jpg-to-png" element={<JpgToPngPage />} />
          <Route path="/tools/pdf-to-word" element={<PdfToWordPage />} />
          <Route path="/tools/pdf/pdf-to-word" element={<PdfToWordPage />} />
          <Route path="/pdf-to-word" element={<PdfToWordPage />} />
          <Route path="/tools/word-to-pdf" element={<WordToPdfPage />} />
          <Route path="/tools/document/word-to-pdf" element={<WordToPdfPage />} />
          <Route path="/tools/pdf/word-to-pdf" element={<WordToPdfPage />} />
          <Route path="/word-to-pdf" element={<WordToPdfPage />} />
          <Route path="/tools/image-resizer" element={<ImageResizerPage />} />
          <Route path="/tools/image/image-resizer" element={<ImageResizerPage />} />
          <Route path="/image-resizer" element={<ImageResizerPage />} />
          <Route path="/tools/file-password-protector" element={<FileProtectorPage />} />
          <Route path="/tools/security/file-password-protector" element={<FileProtectorPage />} />
          <Route path="/file-password-protector" element={<FileProtectorPage />} />
          {/* ID Card Tools Protected Routes */}
          <Route path="/tools/id-card-maker" element={<IdCardMakerPage />} />
          <Route path="/tools/id-card/id-card-maker" element={<IdCardMakerPage />} />
          <Route path="/id-card-maker" element={<IdCardMakerPage />} />
          <Route path="/tools/id-card-print-studio" element={<IdCardPrintStudioPage />} />
          <Route path="/tools/id-card/id-card-print-studio" element={<IdCardPrintStudioPage />} />
          <Route path="/id-card-print-studio" element={<IdCardPrintStudioPage />} />
          <Route path="/tools/id-card-photo-maker" element={<IdCardPhotoMakerPage />} />
          <Route path="/tools/id-card/id-card-photo-maker" element={<IdCardPhotoMakerPage />} />
          <Route path="/id-card-photo-maker" element={<IdCardPhotoMakerPage />} />
          <Route path="/tools/id-card-resize" element={<IdCardResizePage />} />
          <Route path="/tools/id-card/id-card-resize" element={<IdCardResizePage />} />
          <Route path="/id-card-resize" element={<IdCardResizePage />} />
          <Route path="/tools/id-card-pdf-generator" element={<IdCardPdfGeneratorPage />} />
          <Route path="/tools/id-card/id-card-pdf-generator" element={<IdCardPdfGeneratorPage />} />
          <Route path="/id-card-pdf-generator" element={<IdCardPdfGeneratorPage />} />
          <Route path="/tools/id-card-sheet-maker" element={<IdCardSheetMakerPage />} />
          <Route path="/tools/id-card/id-card-sheet-maker" element={<IdCardSheetMakerPage />} />
          <Route path="/id-card-sheet-maker" element={<IdCardSheetMakerPage />} />
          <Route path="/tools/id-card-qr-generator" element={<IdCardQrGeneratorPage />} />
          <Route path="/tools/id-card/id-card-qr-generator" element={<IdCardQrGeneratorPage />} />
          <Route path="/id-card-qr-generator" element={<IdCardQrGeneratorPage />} />
          <Route path="/tools/id-card-barcode-generator" element={<IdCardBarcodeGeneratorPage />} />
          <Route path="/tools/id-card/id-card-barcode-generator" element={<IdCardBarcodeGeneratorPage />} />
          <Route path="/id-card-barcode-generator" element={<IdCardBarcodeGeneratorPage />} />
          <Route path="/tools/id-card-template-maker" element={<IdCardTemplateMakerPage />} />
          <Route path="/tools/id-card/id-card-template-maker" element={<IdCardTemplateMakerPage />} />
          <Route path="/id-card-template-maker" element={<IdCardTemplateMakerPage />} />
          <Route path="/tools/id-card-print-preview" element={<IdCardPrintPreviewPage />} />
          <Route path="/tools/id-card/id-card-print-preview" element={<IdCardPrintPreviewPage />} />
          <Route path="/id-card-print-preview" element={<IdCardPrintPreviewPage />} />
          <Route path="/tools/id-card-form-generator" element={<IdCardFormGeneratorPage />} />
          <Route path="/tools/id-card/id-card-form-generator" element={<IdCardFormGeneratorPage />} />
          <Route path="/id-card-form-generator" element={<IdCardFormGeneratorPage />} />
          {/* Crop Tools — protected routes */}
          <Route path="/tools/image-cropper" element={<ImageCropperPage />} />
          <Route path="/tools/crop/image-cropper" element={<ImageCropperPage />} />
          <Route path="/image-cropper" element={<ImageCropperPage />} />
          {/* Image to SVG Converter — protected routes */}
          <Route path="/tools/image-to-svg" element={<ImageToSvgPage />} />
          <Route path="/tools/image/image-to-svg" element={<ImageToSvgPage />} />
          <Route path="/image-to-svg" element={<ImageToSvgPage />} />
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
          <Route path="/admin/websites" element={<AdminWebsitesPage />} />
          <Route path="/admin/files" element={<AdminFilesPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        </Route>
      </Route>

      {/* Error & Fallback Routes */}
      <Route element={<MainLayout />}>
        <Route path="/401" element={<UnauthorizedPage />} />
        <Route path="/403" element={<UnauthorizedPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
};
