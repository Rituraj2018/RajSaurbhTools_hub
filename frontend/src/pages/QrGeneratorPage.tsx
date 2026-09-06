import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ArrowLeft } from 'lucide-react';
import {
  QrTypeTabs,
  QrPayloadForms,
  QrStyleControls,
  QrPreviewCard,
} from '../components/qrGenerator';
import {
  QrPayloadType,
  UpiPayload,
  WifiPayload,
  VCardPayload,
  WhatsAppPayload,
  EmailPayload,
  QrStylingOptions,
  DEFAULT_QR_STYLING,
  formatQrPayload,
} from '../utils/qrGeneratorProcessor';
import { Button } from '../components/common/Button';

export const QrGeneratorPage: React.FC = () => {
  const [activeType, setActiveType] = useState<QrPayloadType>('upi');

  // Payload states
  const [upiData, setUpiData] = useState<UpiPayload>({
    vpa: 'user@okhdfcbank',
    name: 'Raj Cyber Cafe & Print',
    amount: '',
    note: 'Document Services',
  });
  const [urlData, setUrlData] = useState<string>('https://');
  const [wifiData, setWifiData] = useState<WifiPayload>({
    ssid: 'CyberCafe_Fast_WiFi',
    password: '',
    authType: 'WPA',
    hidden: false,
  });
  const [vcardData, setVcardData] = useState<VCardPayload>({
    firstName: 'Rituraj',
    lastName: 'Singh',
    phone: '+91 ',
    email: '',
    organization: 'RajSaurbh Tools_Hub',
    website: '',
  });
  const [whatsappData, setWhatsappData] = useState<WhatsAppPayload>({
    countryCode: '+91',
    phoneNumber: '',
    message: 'Hello! I need document printing assistance.',
  });
  const [textData, setTextData] = useState<string>('');
  const [emailData, setEmailData] = useState<EmailPayload>({
    to: '',
    subject: '',
    body: '',
  });

  // Styling state
  const [stylingOptions, setStylingOptions] = useState<QrStylingOptions>(DEFAULT_QR_STYLING);

  // Computed raw payload text
  const payloadText = useMemo(() => {
    switch (activeType) {
      case 'upi':
        return formatQrPayload('upi', upiData);
      case 'url':
        return formatQrPayload('url', urlData);
      case 'wifi':
        return formatQrPayload('wifi', wifiData);
      case 'vcard':
        return formatQrPayload('vcard', vcardData);
      case 'whatsapp':
        return formatQrPayload('whatsapp', whatsappData);
      case 'email':
        return formatQrPayload('email', emailData);
      case 'text':
      default:
        return formatQrPayload('text', textData);
    }
  }, [activeType, upiData, urlData, wifiData, vcardData, whatsappData, emailData, textData]);

  const handleStylingChange = (partial: Partial<QrStylingOptions>) => {
    setStylingOptions((prev) => ({ ...prev, ...partial }));
  };

  const previewTitle = useMemo(() => {
    if (activeType === 'upi') return upiData.name || 'Scan to Pay with UPI';
    if (activeType === 'wifi') return `Connect to ${wifiData.ssid || 'Wi-Fi'}`;
    if (activeType === 'vcard') return `${vcardData.firstName} ${vcardData.lastName}`.trim() || 'Save Contact';
    return 'Scan with Phone';
  }, [activeType, upiData.name, wifiData.ssid, vcardData.firstName, vcardData.lastName]);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-blue-400 transition-colors">
              Tools Catalog
            </Link>
            <span>/</span>
            <Link to="/tools?category=Document" className="hover:text-blue-400 transition-colors">
              Utility Lab
            </Link>
            <span>/</span>
            <span className="text-blue-400">QR Code Studio</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                QR Code Studio Pro
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Generate high-resolution, branded QR codes for UPI payments, Wi-Fi, URLs, and contacts with SVG & PDF export.
              </p>
            </div>
          </div>
        </div>

        <Link to="/tools">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Tools
          </Button>
        </Link>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Configuration & Payload Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* QR Type Selector */}
          <QrTypeTabs activeType={activeType} onSelectType={setActiveType} />

          {/* Dynamic Payload Form */}
          <QrPayloadForms
            activeType={activeType}
            upiData={upiData}
            onUpiChange={(upd) => setUpiData((prev) => ({ ...prev, ...upd }))}
            urlData={urlData}
            onUrlChange={setUrlData}
            wifiData={wifiData}
            onWifiChange={(upd) => setWifiData((prev) => ({ ...prev, ...upd }))}
            vcardData={vcardData}
            onVcardChange={(upd) => setVcardData((prev) => ({ ...prev, ...upd }))}
            whatsappData={whatsappData}
            onWhatsappChange={(upd) => setWhatsappData((prev) => ({ ...prev, ...upd }))}
            textData={textData}
            onTextChange={setTextData}
            emailData={emailData}
            onEmailChange={(upd) => setEmailData((prev) => ({ ...prev, ...upd }))}
          />

          {/* Styling & Branding Controls */}
          <QrStyleControls options={stylingOptions} onChange={handleStylingChange} />
        </div>

        {/* Right Column (5 cols): Sticky Live Preview & Download Card */}
        <div className="lg:col-span-5 space-y-6 sticky top-6">
          <QrPreviewCard
            payloadText={payloadText}
            stylingOptions={stylingOptions}
            title={previewTitle}
            subtitle={activeType === 'upi' ? 'Scan & Pay with Any UPI App' : 'Point camera to scan'}
          />
        </div>
      </div>
    </div>
  );
};
