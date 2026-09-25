import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Mail,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Cloud,
  AlertTriangle,
  Scale,
} from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Header */}
      <div className="border-b border-slate-800/80 bg-gradient-to-br from-amber-950/30 via-slate-900/60 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                Legal Document
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Terms of Service</h1>
            </div>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Please read these Terms of Service carefully before using{' '}
            <strong className="text-slate-200">Toolix</strong> (RajSaurabh Tools Hub). By
            accessing or using our services, you agree to be bound by these terms.
          </p>

          <p className="text-xs text-slate-500 mt-4">
            Last updated: September 2026 &nbsp;·&nbsp; Effective immediately
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Agreement Notice */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300 leading-relaxed">
            By using Toolix you agree to these Terms of Service. If you do not agree, please
            discontinue use of the platform immediately.
          </p>
        </div>

        {/* Section 1 — Personal Use */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-base font-bold text-white">1. Personal &amp; Non-Commercial Use</h2>
          </div>
          <div className="pl-9 text-sm text-slate-400 leading-relaxed space-y-2">
            <p>
              Toolix is provided as a free digital productivity platform intended for{' '}
              <strong className="text-slate-200">personal, non-commercial use</strong>. You may use
              our tools to process your own documents, images, and files for personal productivity
              purposes.
            </p>
            <p>
              Commercial redistribution, resale, or white-labelling of the Toolix platform or its
              output without prior written permission from the developer is prohibited.
            </p>
          </div>
        </section>

        {/* Section 2 — User Owns Files */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-base font-bold text-white">2. Ownership of Your Files</h2>
          </div>
          <div className="pl-9 text-sm text-slate-400 leading-relaxed space-y-2">
            <p>
              <strong className="text-slate-200">You own your files.</strong> All documents,
              images, and files you upload or process using Toolix remain your property. We do not
              claim any intellectual property rights over your content.
            </p>
            <p>
              By uploading files to Toolix for server-side processing features (e.g., PDF
              conversion, file password protection), you grant Toolix a temporary, limited,
              revocable licence to process those files solely for the purpose of delivering the
              requested output to you. This licence terminates upon delivery of the result.
            </p>
          </div>
        </section>

        {/* Section 3 — User Responsibility */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4 text-rose-400" />
            </div>
            <h2 className="text-base font-bold text-white">3. User Responsibility for Content</h2>
          </div>
          <div className="pl-9 text-sm text-slate-400 leading-relaxed space-y-3">
            <p>You are solely responsible for the files and content you upload or process. You agree that you will NOT upload or process content that:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>Infringes upon any third party's intellectual property rights.</li>
              <li>
                Contains malware, viruses, or other harmful code intended to damage systems or
                users.
              </li>
              <li>Involves the unauthorized replication, forgery, or misuse of government-issued identification documents.</li>
              <li>Violates any applicable local, national, or international law or regulation.</li>
              <li>Contains content that is defamatory, abusive, obscene, or otherwise objectionable.</li>
            </ul>
            <p>
              You must possess lawful ownership or authorization for all documents, photos, or ID
              cards processed through this platform. Toolix reserves the right to terminate access
              for users who violate these terms.
            </p>
          </div>
        </section>

        {/* Section 4 — Google Drive & OneDrive */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Cloud className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-base font-bold text-white">4. Google Drive &amp; OneDrive Integration</h2>
          </div>
          <div className="pl-9 text-sm text-slate-400 leading-relaxed space-y-3">
            <p>
              Toolix offers optional integrations with Google Drive and Microsoft OneDrive. When
              you use these cloud storage features:
            </p>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                Your use of Google Drive is subject to{' '}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Google's Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Google's Privacy Policy
                </a>
                .
              </li>
              <li>
                Your use of Microsoft OneDrive is subject to{' '}
                <a
                  href="https://www.microsoft.com/en-us/servicesagreement/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Microsoft's Services Agreement
                </a>{' '}
                and{' '}
                <a
                  href="https://privacy.microsoft.com/en-us/privacystatement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Microsoft's Privacy Statement
                </a>
                .
              </li>
              <li>
                Files saved to your cloud storage accounts are governed by the respective
                platform's terms — Toolix is not responsible for data stored in Google Drive or
                OneDrive.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5 — Platform Availability */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-700/60 border border-slate-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            </div>
            <h2 className="text-base font-bold text-white">5. Platform Availability</h2>
          </div>
          <div className="pl-9 text-sm text-slate-400 leading-relaxed">
            <p>
              Toolix is provided on an <strong className="text-slate-200">"as-available"</strong>{' '}
              basis. While we strive for high uptime and performance, we do not guarantee
              uninterrupted service. We reserve the right to modify, suspend, or discontinue any
              feature at any time without notice.
            </p>
          </div>
        </section>

        {/* Section 6 — Intellectual Property */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-700/60 border border-slate-700 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4 text-slate-400" />
            </div>
            <h2 className="text-base font-bold text-white">6. Intellectual Property</h2>
          </div>
          <div className="pl-9 text-sm text-slate-400 leading-relaxed">
            <p>
              The Toolix platform design, interface, source code, branding, and utilities are{' '}
              <strong className="text-slate-200">© 2026 Toolix (Rituraj Singh)</strong>. All rights
              reserved. You may not copy, reproduce, or distribute the platform's code or design
              without explicit written permission.
            </p>
          </div>
        </section>

        {/* Section 7 — Disclaimer */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-base font-bold text-white">7. Disclaimer of Warranties</h2>
          </div>
          <div className="pl-9 text-sm text-slate-400 leading-relaxed">
            <p>
              Toolix is provided "as is" without any warranties, express or implied, including
              merchantability, fitness for a particular purpose, or non-infringement. We are not
              liable for any loss of data, business interruption, or damages arising from the use
              or inability to use the platform.
            </p>
          </div>
        </section>

        {/* Section 8 — Changes */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-700/60 border border-slate-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            </div>
            <h2 className="text-base font-bold text-white">8. Changes to These Terms</h2>
          </div>
          <div className="pl-9 text-sm text-slate-400 leading-relaxed">
            <p>
              We may update these Terms of Service from time to time. When we do, we will revise
              the "Last updated" date at the top of this page. Continued use of Toolix after
              changes are posted constitutes your acceptance of the updated terms.
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
              For any questions regarding these Terms of Service, please reach out to the developer
              directly:
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
            <Link to="/privacy-policy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
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
