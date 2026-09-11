import React from 'react';
import { Download, FileImage, FileText } from 'lucide-react';
import { Button } from '../common/Button';

interface IdCardExportPanelProps {
  onDownloadPng: () => void;
  onDownloadJpg: () => void;
  onDownloadPdf: () => void;
  disabled?: boolean;
  loading?: boolean;
  showPdf?: boolean;
  className?: string;
}

export const IdCardExportPanel: React.FC<IdCardExportPanelProps> = ({
  onDownloadPng,
  onDownloadJpg,
  onDownloadPdf,
  disabled = false,
  loading = false,
  showPdf = true,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Download className="w-4 h-4 text-teal-400" />
        Export & Download
      </h3>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onDownloadPng}
          disabled={disabled || loading}
          isLoading={loading}
          leftIcon={<FileImage className="w-3.5 h-3.5 text-emerald-400" />}
        >
          Download PNG
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onDownloadJpg}
          disabled={disabled || loading}
          leftIcon={<FileImage className="w-3.5 h-3.5 text-amber-400" />}
        >
          Download JPG
        </Button>

        {showPdf && (
          <Button
            variant="gradient"
            size="sm"
            onClick={onDownloadPdf}
            disabled={disabled || loading}
            leftIcon={<FileText className="w-3.5 h-3.5" />}
          >
            Download PDF
          </Button>
        )}
      </div>
    </div>
  );
};
