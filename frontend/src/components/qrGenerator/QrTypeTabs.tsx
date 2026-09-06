import React from 'react';
import { IndianRupee, Globe, Wifi, User, MessageCircle, FileText, Mail } from 'lucide-react';
import { QrPayloadType } from '../../utils/qrGeneratorProcessor';

interface QrTypeTabsProps {
  activeType: QrPayloadType;
  onSelectType: (type: QrPayloadType) => void;
}

export const QrTypeTabs: React.FC<QrTypeTabsProps> = ({ activeType, onSelectType }) => {
  const tabs: { type: QrPayloadType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { type: 'upi', label: 'UPI Payment', icon: IndianRupee, badge: 'Popular' },
    { type: 'url', label: 'Website Link', icon: Globe },
    { type: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
    { type: 'vcard', label: 'Contact (vCard)', icon: User },
    { type: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { type: 'text', label: 'Plain Text', icon: FileText },
    { type: 'email', label: 'Email Address', icon: Mail },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeType === tab.type;
        return (
          <button
            key={tab.type}
            onClick={() => onSelectType(tab.type)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                isActive ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
