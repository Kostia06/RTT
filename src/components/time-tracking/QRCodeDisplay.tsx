'use client';

import { useRef } from 'react';

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  displayUrl: string;
}

export default function QRCodeDisplay({ qrCodeUrl, displayUrl }: QRCodeDisplayProps) {
  const qrImageRef = useRef<HTMLImageElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrImageRef.current) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'employee-clock-in-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* QR Code Display */}
      <div className="bg-white border-2 border-gray-200 p-8 text-center">
        <div className="inline-block p-6 bg-white border-4 border-black">
          <img
            ref={qrImageRef}
            src={qrCodeUrl}
            alt="Employee Clock-In QR Code"
            className="w-full h-full max-w-md mx-auto"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-sm uppercase tracking-wider text-gray-600">Scan to clock in/out</p>
          <p className="text-xs text-gray-500 font-mono break-all px-4">
            {displayUrl}
          </p>
        </div>
      </div>

      {/* Action Buttons - Hidden on print */}
      <div className="flex gap-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 px-6 py-4 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-all border-2 border-black"
        >
          <svg
            className="w-5 h-5 inline-block mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print QR Code
        </button>

        <button
          onClick={handleDownload}
          className="flex-1 px-6 py-4 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-all border-2 border-black"
        >
          <svg
            className="w-5 h-5 inline-block mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download PNG
        </button>
      </div>

      {/* Print-only Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }

          .print\\:hidden {
            display: none !important;
          }

          img {
            max-width: 100%;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
