import React from 'react';
import {
  QrPayloadType,
  UpiPayload,
  WifiPayload,
  VCardPayload,
  WhatsAppPayload,
  EmailPayload,
} from '../../utils/qrGeneratorProcessor';

interface QrPayloadFormsProps {
  activeType: QrPayloadType;
  upiData: UpiPayload;
  onUpiChange: (data: Partial<UpiPayload>) => void;
  urlData: string;
  onUrlChange: (data: string) => void;
  wifiData: WifiPayload;
  onWifiChange: (data: Partial<WifiPayload>) => void;
  vcardData: VCardPayload;
  onVcardChange: (data: Partial<VCardPayload>) => void;
  whatsappData: WhatsAppPayload;
  onWhatsappChange: (data: Partial<WhatsAppPayload>) => void;
  textData: string;
  onTextChange: (data: string) => void;
  emailData: EmailPayload;
  onEmailChange: (data: Partial<EmailPayload>) => void;
}

export const QrPayloadForms: React.FC<QrPayloadFormsProps> = ({
  activeType,
  upiData,
  onUpiChange,
  urlData,
  onUrlChange,
  wifiData,
  onWifiChange,
  vcardData,
  onVcardChange,
  whatsappData,
  onWhatsappChange,
  textData,
  onTextChange,
  emailData,
  onEmailChange,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
      {/* UPI Payment Form */}
      {activeType === 'upi' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">UPI Payment Details</h4>
            <p className="text-xs text-slate-400">
              Generates a standard BHIM / NPCI UPI QR code compatible with Google Pay, PhonePe, Paytm, and all Indian banking apps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                UPI ID (VPA) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={upiData.vpa}
                onChange={(e) => onUpiChange({ vpa: e.target.value })}
                placeholder="e.g. yourname@okhdfcbank"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Payee Name / Shop Name</label>
              <input
                type="text"
                value={upiData.name}
                onChange={(e) => onUpiChange({ name: e.target.value })}
                placeholder="e.g. Raj Cyber Cafe"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Default Amount (INR)</label>
              <input
                type="number"
                step="0.01"
                value={upiData.amount}
                onChange={(e) => onUpiChange({ amount: e.target.value })}
                placeholder="Leave blank for any amount"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Transaction Note</label>
              <input
                type="text"
                value={upiData.note}
                onChange={(e) => onUpiChange({ note: e.target.value })}
                placeholder="e.g. Printing services"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* URL Form */}
      {activeType === 'url' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Website URL</h4>
            <p className="text-xs text-slate-400">
              Users scanning this QR code will automatically open your link in their default browser.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Target URL <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={urlData}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://yourwebsite.com/services"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Wi-Fi Form */}
      {activeType === 'wifi' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Wi-Fi Network Configuration</h4>
            <p className="text-xs text-slate-400">
              Customers can join your shop or office Wi-Fi network instantly without manually typing passwords.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Network Name (SSID) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={wifiData.ssid}
                onChange={(e) => onWifiChange({ ssid: e.target.value })}
                placeholder="e.g. Office_WiFi_5G"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Wi-Fi Password</label>
              <input
                type="text"
                value={wifiData.password}
                onChange={(e) => onWifiChange({ password: e.target.value })}
                placeholder="Network password"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Security Encryption</label>
              <select
                value={wifiData.authType}
                onChange={(e) => onWifiChange({ authType: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="WPA">WPA / WPA2 / WPA3 (Default)</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (Open Network)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="wifi-hidden"
                checked={wifiData.hidden}
                onChange={(e) => onWifiChange({ hidden: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
              />
              <label htmlFor="wifi-hidden" className="text-xs text-slate-300 cursor-pointer">
                Hidden SSID Network
              </label>
            </div>
          </div>
        </div>
      )}

      {/* vCard Form */}
      {activeType === 'vcard' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Contact Details (vCard)</h4>
            <p className="text-xs text-slate-400">
              Scanners can immediately save your complete contact profile into their phonebook.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">First Name</label>
              <input
                type="text"
                value={vcardData.firstName}
                onChange={(e) => onVcardChange({ firstName: e.target.value })}
                placeholder="Rituraj"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Last Name</label>
              <input
                type="text"
                value={vcardData.lastName}
                onChange={(e) => onVcardChange({ lastName: e.target.value })}
                placeholder="Singh"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Phone Number</label>
              <input
                type="tel"
                value={vcardData.phone}
                onChange={(e) => onVcardChange({ phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Email Address</label>
              <input
                type="email"
                value={vcardData.email}
                onChange={(e) => onVcardChange({ email: e.target.value })}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Organization / Company</label>
              <input
                type="text"
                value={vcardData.organization}
                onChange={(e) => onVcardChange({ organization: e.target.value })}
                placeholder="RajSaurbh Digital Services"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Website</label>
              <input
                type="url"
                value={vcardData.website}
                onChange={(e) => onVcardChange({ website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Form */}
      {activeType === 'whatsapp' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">WhatsApp Direct Chat</h4>
            <p className="text-xs text-slate-400">
              Users scanning this QR code will open a direct WhatsApp chat window with you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Country Code</label>
              <input
                type="text"
                value={whatsappData.countryCode}
                onChange={(e) => onWhatsappChange({ countryCode: e.target.value })}
                placeholder="+91"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">WhatsApp Mobile Number</label>
              <input
                type="tel"
                value={whatsappData.phoneNumber}
                onChange={(e) => onWhatsappChange({ phoneNumber: e.target.value })}
                placeholder="9876543210"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Pre-filled Greeting Message</label>
              <input
                type="text"
                value={whatsappData.message}
                onChange={(e) => onWhatsappChange({ message: e.target.value })}
                placeholder="Hello! I need assistance with printing documents."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Plain Text Form */}
      {activeType === 'text' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Plain Text / Notes</h4>
            <p className="text-xs text-slate-400">
              Encodes raw text, serial numbers, codes, or instructions.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Message / Text Content</label>
            <textarea
              rows={4}
              value={textData}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Enter any text, notice, serial number or instructions..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>
      )}

      {/* Email Form */}
      {activeType === 'email' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Email Draft</h4>
            <p className="text-xs text-slate-400">
              Opens the user's default email client with recipient and subject pre-filled.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Recipient Email</label>
              <input
                type="email"
                value={emailData.to}
                onChange={(e) => onEmailChange({ to: e.target.value })}
                placeholder="support@example.com"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Subject Line</label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => onEmailChange({ subject: e.target.value })}
                placeholder="Inquiry regarding services"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Body</label>
              <textarea
                rows={3}
                value={emailData.body}
                onChange={(e) => onEmailChange({ body: e.target.value })}
                placeholder="Write your email body here..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
