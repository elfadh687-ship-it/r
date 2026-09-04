import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Star,
  Layers,
  Palette,
  Eye
} from 'lucide-react';
import QRCode from 'qrcode';
import { Shortlink } from '../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortlink: Shortlink | null;
  baseUrl: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  shortlink,
  baseUrl,
}) => {
  const [qrPngUrl, setQrPngUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [colorTheme, setColorTheme] = useState<'marine' | 'black' | 'sage'>('marine');
  const [showPrintView, setShowPrintView] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fullShortUrl = shortlink ? `${baseUrl}/r/${shortlink.short_slug}` : '';

  // Get hex color for QR based on theme
  const getQrColor = () => {
    switch (colorTheme) {
      case 'marine':
        return '#005C53';
      case 'sage':
        return '#70A9A1';
      case 'black':
      default:
        return '#0F172A';
    }
  };

  useEffect(() => {
    if (!shortlink || !fullShortUrl) return;

    const qrColor = getQrColor();

    // Generate PNG Data URL
    QRCode.toDataURL(fullShortUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: qrColor,
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrPngUrl(url))
      .catch((err) => console.error('Error generating PNG QR:', err));

    // Generate SVG string
    QRCode.toString(fullShortUrl, {
      type: 'svg',
      margin: 2,
      color: {
        dark: qrColor,
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((svg) => setQrSvgString(svg))
      .catch((err) => console.error('Error generating SVG QR:', err));
  }, [shortlink, fullShortUrl, colorTheme]);

  if (!isOpen || !shortlink) return null;

  // Download PNG file
  const handleDownloadPng = () => {
    if (!qrPngUrl) return;
    const a = document.createElement('a');
    a.href = qrPngUrl;
    a.download = `QR-GoogleReview-${shortlink.short_slug}-${shortlink.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download SVG file
  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR-GoogleReview-${shortlink.short_slug}-${shortlink.title.replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div 
        className="glass-modal w-full max-w-xl rounded-3xl p-5 sm:p-7 relative border border-white/80 shadow-2xl my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#005C53]/10 text-[#005C53] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#005C53]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                QR Code Google Review
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                {shortlink.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center justify-between gap-3 mb-4 bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setShowPrintView(false)}
            className={`flex-1 py-1.5 rounded-lg transition text-center ${
              !showPrintView ? 'bg-white text-[#005C53] shadow-sm' : 'text-slate-600'
            }`}
          >
            QR Code Standar
          </button>
          <button
            onClick={() => setShowPrintView(true)}
            className={`flex-1 py-1.5 rounded-lg transition text-center flex items-center justify-center gap-1.5 ${
              showPrintView ? 'bg-white text-[#005C53] shadow-sm' : 'text-slate-600'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Format Cetak (Table Tent / Flyer)</span>
          </button>
        </div>

        {!showPrintView ? (
          /* Standard QR Code View */
          <div className="space-y-4">
            {/* QR Card Container */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col items-center justify-center">
              {qrPngUrl ? (
                <div className="p-3 bg-white rounded-2xl shadow-inner border border-slate-100">
                  <img
                    src={qrPngUrl}
                    alt={`QR Code untuk ${shortlink.title}`}
                    className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400">
                  Menyiapkan QR Code...
                </div>
              )}

              {/* URL under QR */}
              <div className="mt-3 text-center">
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {fullShortUrl}
                </span>
              </div>
            </div>

            {/* Color Theme Selector */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-slate-500" />
                <span>Pilihan Warna QR:</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setColorTheme('marine')}
                  className={`w-6 h-6 rounded-full bg-[#005C53] transition-transform ${
                    colorTheme === 'marine' ? 'ring-2 ring-offset-2 ring-[#005C53] scale-110' : ''
                  }`}
                  title="Marine Blue (Signature)"
                />
                <button
                  onClick={() => setColorTheme('sage')}
                  className={`w-6 h-6 rounded-full bg-[#70A9A1] transition-transform ${
                    colorTheme === 'sage' ? 'ring-2 ring-offset-2 ring-[#70A9A1] scale-110' : ''
                  }`}
                  title="Sage Green"
                />
                <button
                  onClick={() => setColorTheme('black')}
                  className={`w-6 h-6 rounded-full bg-[#0F172A] transition-transform ${
                    colorTheme === 'black' ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''
                  }`}
                  title="Classic Dark"
                />
              </div>
            </div>

            {/* Direct Action Buttons: Download PNG & SVG */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                id="btn-download-png"
                onClick={handleDownloadPng}
                className="inline-flex items-center justify-center gap-1.5 gradient-btn text-white text-xs font-semibold py-2.5 px-3 rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PNG</span>
              </button>

              <button
                id="btn-download-svg"
                onClick={handleDownloadSvg}
                className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-[#005C53] text-xs font-semibold py-2.5 px-3 rounded-xl border border-[#005C53]/30 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh SVG</span>
              </button>

              <button
                id="btn-copy-short-url"
                onClick={handleCopyLink}
                className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-3 rounded-xl transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Print Ready Flyer / Table Tent Preview */
          <div className="space-y-4">
            <div 
              ref={printRef}
              className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-dashed border-[#005C53]/30 text-center shadow-md relative overflow-hidden"
            >
              {/* Decorative top accent */}
              <div className="absolute top-0 left-0 right-0 h-3 gradient-marine-sage" />

              <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold mb-3">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span className="ml-1">Ulas Kami di Google</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1">
                {shortlink.title}
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Pendapat Anda sangat berarti bagi perkembangan layanan kami.
              </p>

              {/* QR display */}
              <div className="inline-block p-4 bg-white rounded-2xl shadow-md border border-slate-200 mb-4">
                <img
                  src={qrPngUrl}
                  alt={`QR Code ${shortlink.title}`}
                  className="w-44 h-44 sm:w-52 sm:h-52 object-contain mx-auto"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Scan QR di atas dengan kamera smartphone Anda
                </p>
                <p className="text-[11px] font-mono text-slate-500">
                  atau buka: <strong>{fullShortUrl}</strong>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                Terima kasih atas ulasan bintang 5 Anda di Google Maps! ⭐
              </div>
            </div>

            {/* Print action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 gradient-btn text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Ulasan (Print)</span>
              </button>

              <button
                onClick={handleDownloadPng}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Gambar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
