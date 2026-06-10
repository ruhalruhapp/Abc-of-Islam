import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { Download, FileText, BookOpen, Printer, X, Loader2 } from 'lucide-react';
import type { Topic } from '@/types';

interface ExportModalProps {
  content: Topic[];
  currentTopicId?: string;
}

export default function ExportModal({ content, currentTopicId }: ExportModalProps) {
  const { locale, ageLevel } = useAppStore();
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handlePrint = () => {
    window.print();
    setOpen(false);
  };

  const handleExportPDF = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, ageLevel, topicId: currentTopicId }),
      });
      if (!res.ok) throw new Error('PDF render failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abc-of-islam-${locale}${currentTopicId ? `-${currentTopicId}` : ''}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF export failed:', e);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
      setOpen(false);
    }
  };

  const handleExportEPUB = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/epub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, ageLevel }),
      });
      if (!res.ok) throw new Error('EPUB packaging failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abc-of-islam-${locale}.epub`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('EPUB export failed:', e);
      alert('Failed to generate ePub eBook. Please try again.');
    } finally {
      setGenerating(false);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        id="btn-trigger-export"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl font-bold text-sm shadow-sm transition-all text-center cursor-pointer"
      >
        <Download className="w-4 h-4" />
        <span>{t(locale, 'exportTitle')}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            id="export-modal-panel"
            className="bg-white rounded-3xl p-6 w-full max-w-sm border border-gray-100 shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-teal-800">{t(locale, 'exportTitle')}</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-gray-100 active:scale-95 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-5 leading-normal">
              {t(locale, 'exportDesc')}
            </p>

            <div className="space-y-3">
              <button
                id="btn-export-pdf"
                onClick={handleExportPDF}
                disabled={generating}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 hover:bg-rose-100/50 transition-colors text-left cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-6 h-6 text-rose-500" />
                <div>
                  <div className="font-bold text-sm text-rose-950">{t(locale, 'exportPdf')}</div>
                  <div className="text-[10px] text-rose-700/80 font-semibold tracking-wide mt-0.5">High-Quality Vector Document</div>
                </div>
              </button>

              <button
                id="btn-export-epub"
                onClick={handleExportEPUB}
                disabled={generating}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-100 hover:bg-amber-100/50 transition-colors text-left cursor-pointer disabled:opacity-50"
              >
                <BookOpen className="w-6 h-6 text-amber-500" />
                <div>
                  <div className="font-bold text-sm text-amber-950">{t(locale, 'exportEpub')}</div>
                  <div className="text-[10px] text-amber-700/85 font-semibold tracking-wide mt-0.5">Reflowable eBook Reader package</div>
                </div>
              </button>

              <button
                id="btn-export-print"
                onClick={handlePrint}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-teal-50 border border-teal-100 hover:bg-teal-100/50 transition-colors text-left cursor-pointer"
              >
                <Printer className="w-6 h-6 text-teal-500" />
                <div>
                  <div className="font-bold text-sm text-teal-950">{t(locale, 'exportPrint')}</div>
                  <div className="text-[10px] text-teal-700/80 font-semibold tracking-wide mt-0.5">Send directly to local network printer</div>
                </div>
              </button>
            </div>

            {generating && (
              <div className="flex items-center justify-center gap-2 mt-4 text-teal-600 bg-teal-50/50 border border-teal-100 p-2.5 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                <span className="text-xs font-bold">Packaging download packages...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
