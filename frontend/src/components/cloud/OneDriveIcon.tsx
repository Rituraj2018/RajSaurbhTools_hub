import React from 'react';

/**
 * Official Microsoft OneDrive brand icon SVG
 */
export const OneDriveIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.5 15.5h5.25a3.25 3.25 0 0 0 .58-6.45 5.5 5.5 0 0 0-10.6-1.3A4.5 4.5 0 0 0 4.5 12a4.48 4.48 0 0 0 1.38 3.24"
      fill="#0364B8"
      opacity="0.8"
    />
    <path
      d="M9.73 7.75a5.49 5.49 0 0 1 4.1-1.87 5.5 5.5 0 0 1 5.44 4.67 3.25 3.25 0 0 1 .58 6.45H14.5l-4.77-9.25z"
      fill="#0078D4"
    />
    <path
      d="M5.88 15.24A4.48 4.48 0 0 1 4.5 12a4.5 4.5 0 0 1 5.23-4.25L14.5 15.5H5.88z"
      fill="#1490DF"
    />
    <path
      d="M5.88 15.24l4.04.26H14.5L9.73 7.75 5.88 15.24z"
      fill="#28A8EA"
    />
  </svg>
);
