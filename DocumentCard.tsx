import React from 'react';
import { FileText, Trash2, Eye, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { ScannedDocument } from '../../types';

interface DocumentCardProps {
  doc: ScannedDocument;
  onRemove: (id: string) => void;
  onPreview?: (doc: ScannedDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  onRemove,
  onPreview
}) => {
  return (
    <div className="group relative bg-white border border-slate-200 hover:border-primary-400 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
      
      {/* Thumbnail + status */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 mb-3 flex items-center justify-center">
        {doc.previewUrl ? (
          <img
            src={doc.previewUrl}
            alt={doc.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <FileText className="w-12 h-12 text-slate-400" />
        )}

        {/* OCR Status Badge */}
        <div className="absolute top-2 left-2">
          {doc.ocrStatus === 'processing' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-md animate-pulse">
              <Clock className="w-3 h-3 animate-spin" />
              <span>OCR Analyzing...</span>
            </span>
          ) : doc.ocrStatus === 'completed' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-md">
              <CheckCircle2 className="w-3 h-3" />
              <span>Digitized</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-700 text-white shadow-md">
              <span>Uploaded</span>
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {onPreview && (
            <button
              type="button"
              onClick={() => onPreview(doc)}
              title="Preview Document"
              className="p-1.5 rounded-xl bg-black/60 hover:bg-black text-white transition-colors backdrop-blur-sm"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(doc.id)}
            title="Remove Document"
            className="p-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-colors backdrop-blur-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
            {doc.type}
          </span>
          <span className="text-[11px] text-slate-400">{doc.date}</span>
        </div>
        <h4 className="text-sm font-bold text-slate-900 truncate" title={doc.title}>
          {doc.title}
        </h4>

        {/* Extracted Entities preview */}
        {doc.extractedData && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
            {doc.extractedData.diagnoses.length > 0 && (
              <p className="text-xs text-slate-600 flex items-center gap-1">
                <span className="font-semibold text-slate-700">Diagnosis:</span>
                <span className="truncate">{doc.extractedData.diagnoses.join(', ')}</span>
              </p>
            )}

            {/* Abnormal lab flags callout */}
            {doc.extractedData.investigationHighlights?.some((h) => h.isAbnormal) && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  Abnormal findings: {doc.extractedData.investigationHighlights.filter(h => h.isAbnormal).map(h => `${h.test} (${h.value})`).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
