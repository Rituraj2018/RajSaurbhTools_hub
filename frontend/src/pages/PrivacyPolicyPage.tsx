import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Cloud,
  Eye,
  Database,
} from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Header */}
      <div className="border-b border-slate-800/80 bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                Legal Document
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Privacy Policy</h1>
            </div>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            This Privacy Policy explains how <strong className="text-slate-200">Toolix</strong>{' '}
            (RajSaurabh Tools Hub) collects, uses, and protects your information when you use our
            digital tools and services.
          </p>

          <p className="text-xs text-slate-500 mt-4">
            Last updated: September 2026 &nbsp;·&nbsp; Effective immediately
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Privacy-First Notice */}
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-300 leading-relaxed">
            <strong className="font-semibold">Privacy-First Architecture:</strong> Many Toolix tools
            process your files entirely within your browser. Your files are never uploaded to our
            servers unless you explicitly choose a cloud storage feature.
          </p>
        </div>

        {/* Section 1 — File Processing */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-base font-bold text-white">1. How We Process Your Files</h2>
          </div>
          <div className="pl-9 space-y-3 text-sm text-slate-400 leading-relaxed">
            <p>
              Toolix is a browser-based document and image processing platform. The majority of our
              tools — including Passport Photo Studio, Aadhaar Print Studio, Image Compressor, PDF
              Merge, and Image to PDF — perform all computations locally on your device using HTML5
              Canvas, WebAssembly, and JavaScript.{' '}
              <strong className="text-slate-200">Your files never leave your browser</strong> when
              using these client-side tools.
            </p>
            <p>
              Certain features that involve server-side processing (such as PDF-to-Word conversion,
              Word-to-PDF conversion, or File Password Protection) transmit your file to our secure
              backend server solely to perform the requested operation. Once the output file is
              delivered to you,{' '}
              <strong className="text-slate-200">
                we do not retain or permanently store these files.
              </strong>
            </p>
          </div>
        </section>

        {/* Section 2 — Google Drive */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Cloud className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-base font-bold text-white">2. Google Drive Integration</h2>
          </div>
          <div className="pl-9 space-y-3 text-sm text-slate-400 leading-relaxed">
            <p>
              Toolix offers an optional Google Drive integration that allows you to save processed
              files directly to{' '}
              <strong className="text-slate-200">your own Google Drive account</strong>. When you
              use this feature:
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                Files are uploaded exclusively to your personal Google Drive — not to any
                Toolix-owned or developer-controlled storage.
              </li>
              <li>
                We request only the minimum Google OAuth scopes necessary to perform the file
                upload action on your behalf.
              </li>
              <li>
                The developer (Rituraj Singh) does{' '}
                <strong className="text-slate-200">not</strong> permanently store, access, inspect,
                or retain your Google Drive files or cloud documents.
              </li>
              <li>
                Your Google account credentials are never stored by Toolix. Authentication is
                handled via secure OAuth 2.0 tokens issued and managed by Google.
              </li>
            </ul>
            <p>
              Your use of Google Drive through Toolix is also governed by{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Google's Privacy Policy
              </a>{' '}
              and{' '}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Google Terms of Service
              </a>
              .
            </p>
          </div>
        </section>

        {/* Section 3 — Data We Collect */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-base font-bold text-white">3. Information We Collect</h2>
          </div>
          <div className="pl-9 space-y-3 text-sm text-slate-400 leading-relaxed">
            <p>When you create a Toolix account, we may collect:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong className="text-slate-200">Account Information:</strong> Your name, email
                address, and password (stored as a secure hashed value — we never store plain-text
                passwords).
              </li>
              <li>
                <strong className="text-slate-200">Usage Data:</strong> Anonymized tool usage
                statistics (e.g., which tools were used and how often) to improve the platform and
                surface popular tools. This data is not linked to personally identifiable
                information.
              </li>
              <li>
                <strong className="text-slate-200">My Files Library:</strong> If you explicitly
                save a processed file to your Toolix "My Files" library, that file is stored
                securely on our servers and is accessible only to your account.
              </li>
            </ul>
            <p>
              We do <strong className="text-slate-200">not</strong> sell, rent, or share your
              personal information with third parties for marketing purposes.
            </p>
          </div>
        </section>

        {/* Section 4 — Security */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-rose-400" />
            </div>
            <h2 className="text-base font-bold text-white">4. Security</h2>
          </div>
          <div className="pl-9 space-y-3 text-sm text-slate-400 leading-relaxed">
            <p>We implement industry-standard security practices to protect your data:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                All communication between your browser and our servers is encrypted via HTTPS/TLS.
              </li>
              <li>
                User authentication tokens are signed using JWT (JSON Web Tokens) with secure
                secrets.
              </li>
              <li>
                Passwords are hashed using bcrypt — we never store or transmit plain-text
                passwords.
              </li>
              <li>
                File Password Protector uses AES-256 encryption, performed in a secure
                server-side environment.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5 — Cookies */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-700/60 border border-slate-700 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4 text-slate-400" />
            </div>
            <h2 className="text-base font-bold text-white">5. Cookies &amp; Local Storage</h2>
          </div>
          <div className="pl-9 text-sm text-slate-400 leading-relaxed">
            <p>
              Toolix uses browser local storage and session cookies solely for essential
              functionality — such as maintaining your login session and saving your preferences
              (e.g., theme, tool history). We do not use third-party advertising cookies or
              cross-site tracking.
            </p>
          </div>
        </section>

        {/* Section 6 — Children */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-700/60 border border-slate-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
            </div>
            <h2 className="text-base font-bold text-white">6. Children's Privacy</h2>
          </div>
          <div className="pl-9 text-sm text-slate-400 leading-relaxed">
            <p>
              Toolix is not directed at children under 13 years of age. We do not knowingly collect
              personal information from children. If you believe a child has provided us with
              personal data, please contact us and we will delete it promptly.
            </p>
          </div>
        </section>

        {/* Section 7 — Changes */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-700/60 border border-slate-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            </div>
            <h2 className="text-base font-bold text-white">7. Changes to This Policy</h2>
          </div>
          <div className="pl-9 text-sm text-slate-400 leading-relaxed">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the
              "Last updated" date at the top of this page. Continued use of Toolix after changes
              are posted constitutes your acceptance of the updated policy.
            </p>
          </div>
        </section>

        {/* Contact */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Contact Us</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              For any privacy-related questions, concerns, or data requests, please reach out to
              the developer directly:
            </p>
            <a
              href="mailto:riturajsingh8543@gmail.com"
              className="text-sm text-blue-400 hover:underline font-medium"
            >
              riturajsingh8543@gmail.com
            </a>
          </div>
        </div>

        {/* Footer nav */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 Toolix (RajSaurabh Tools Hub). All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms-of-service" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <Link to="/" className="hover:text-slate-300 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
