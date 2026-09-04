import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Upload,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  AlertCircle,
  Eye,
  Trash2,
  X
} from 'lucide-react';
import { useKioskSession } from '../context/KioskSessionContext';
import { useLanguage } from '../context/LanguageContext';
import { DocumentCard } from '../components/kiosk/DocumentCard';
import { CameraScannerModal } from '../components/common/CameraScannerModal';
import { AudioButton } from '../components/common/AudioButton';
import { ocrService } from '../services/ocrService';
import { ScannedDocument } from '../types';

export const DocumentConsentPage: React.FC = () => {
  const navigate = useNavigate();
  const { documents, addDocument, removeDocument, consent, setConsent, isConsentValid } = useKioskSession();
  const { t, language } = useLanguage();

  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [selectedDocType, setSelectedDocType] = useState<ScannedDocument['type']>('Prescription');
  const [previewDoc, setPreviewDoc] = useState<ScannedDocument | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  const handleCaptureCamera = async (imageDataUrl: string) => {
    const newDocId = `doc-${Date.now()}`;
    const newDoc: ScannedDocument = {
      id: newDocId,
      title: `${selectedDocType} (Scanned Camera)`,
      type: selectedDocType,
      date: new Date().toISOString().split('T')[0],
      fileUrl: imageDataUrl,
      previewUrl: imageDataUrl,
      ocrStatus: 'processing'
    };

    addDocument(newDoc);

    // Trigger background OCR extraction pipeline
    try {
      const extracted = await ocrService.extractDocumentData(newDoc.title, selectedDocType);
      newDoc.ocrStatus = 'completed';
      newDoc.extractedData = extracted;
      addDocument(newDoc); // Updates in context/storage
    } catch {
      newDoc.ocrStatus = 'failed';
      addDocument(newDoc);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      const newDoc: ScannedDocument = {
        id: `doc-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        type: selectedDocType,
        date: new Date().toISOString().split('T')[0],
        fileUrl: preview,
        previewUrl: preview,
        ocrStatus: 'processing'
      };

      addDocument(newDoc);

      const extracted = await ocrService.extractDocumentData(file.name, selectedDocType);
      newDoc.ocrStatus = 'completed';
      newDoc.extractedData = extracted;
      addDocument(newDoc);
    }
  };

  const handleProceed = () => {
    if (!isConsentValid) {
      setValidationError(t.mandatoryConsentWarning);
      return;
    }
    setValidationError('');
    navigate('/kiosk/questionnaire');
  };

  const spokenConsentText = language === 'hi'
    ? "मरीज़ सहमति: हम आपके द्वारा दर्ज किए गए विवरण और पुरानी पर्चियों को सुरक्षित रखते हैं और इसे केवल आपके डॉक्टर और अस्पताल प्रणाली के साथ साझा करते हैं। आगे बढ़ने के लिए कृपया सहमति दें।"
    : language === 'mr'
    ? "रुग्ण संमती: तुमची आरोग्य माहिती आणि जुनी कागदपत्रे तपासणीसाठी डॉक्टरांसोबत सुरक्षितपणे जोडली जातील. कृपया पुढे जाण्यासाठी संमती द्या."
    : language === 'gu'
    ? "દર્દીની સંમતિ: અમે તમારી માહિતી સુરક્ષિત રાખીને ડૉક્ટર સાથે શેર કરીશું. કૃપા કરીને સંમતિ આપો."
    : "Patient Consent Declaration: We securely process your clinical history and scanned documents to prepare your pre-consultation summary for hospital physicians and ABHA records. Please authorize mandatory points to proceed.";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-8 select-none">
      
      {/* Top Breadcrumb Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate('/kiosk/language')}
          className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
        >
          <span>← Back to Language Selection</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
          Step 2 of 5: Document Scanning & Consent
        </span>
      </div>

      <div className="max-w-5xl mx-auto w-full space-y-8 pb-10">
        
        {/* Section 1: Medical Document Digitization Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-kiosk">
                {t.documentsTitle}
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                {t.documentsSub}
              </p>
            </div>

            {/* Document Type Selector for Scanning */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {(['Prescription', 'Lab Report', 'Discharge Summary'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedDocType(type)}
                  className={`kiosk-btn px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedDocType === type
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Scan (Camera) & Upload (Device) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            
            {/* Scan with Camera Button */}
            <button
              type="button"
              onClick={() => setIsCameraModalOpen(true)}
              className="kiosk-btn p-5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center gap-3 shadow-lg shadow-primary-600/25 font-bold text-base"
            >
              <Camera className="w-6 h-6" />
              <span>Scan Physical {selectedDocType} (Camera)</span>
            </button>

            {/* Upload File Button */}
            <label className="kiosk-btn p-5 rounded-2xl bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-800 flex items-center justify-center gap-3 font-bold text-base cursor-pointer shadow-sm">
              <Upload className="w-6 h-6 text-primary-600" />
              <span>Upload Document from Device</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

          </div>

          {/* Uploaded Documents Thumbnail Gallery */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <span>Scanned Documents ({documents.length})</span>
                {documents.some(d => d.ocrStatus === 'processing') && (
                  <span className="text-xs text-amber-600 font-bold animate-pulse flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>OCR Extracting Diagnoses & Labs...</span>
                  </span>
                )}
              </h3>
            </div>

            {documents.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No documents scanned yet. You can scan or proceed directly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    onRemove={removeDocument}
                    onPreview={(d) => setPreviewDoc(d)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Section 2: Granular Consent & ABHA Authorization */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 font-kiosk">
                  {t.consentTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Select granular authorization preferences for this consultation
                </p>
              </div>
            </div>

            {/* Read Aloud Consent in Active Language */}
            <AudioButton
              textToSpeak={spokenConsentText}
              label={t.consentReadAloud}
              size="md"
            />
          </div>

          {/* Granular Checkbox Toggles */}
          <div className="space-y-3">
            
            {/* 1. Data Capture (Mandatory) */}
            <label className="flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.dataCapture}
                onChange={(e) => setConsent((prev) => ({ ...prev, dataCapture: e.target.checked }))}
                className="mt-1 w-5 h-5 rounded-lg text-primary-600 focus:ring-primary-500 border-slate-300"
              />
              <div className="flex-1">
                <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>1. Medical Data & Symptom History Capture</span>
                  <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Mandatory
                  </span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authorize MediKiosk to securely record your voice responses and touch selections for the attending doctor.
                </p>
              </div>
            </label>

            {/* 2. Document Intelligence / OCR (Mandatory) */}
            <label className="flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.documentProcessing}
                onChange={(e) => setConsent((prev) => ({ ...prev, documentProcessing: e.target.checked }))}
                className="mt-1 w-5 h-5 rounded-lg text-primary-600 focus:ring-primary-500 border-slate-300"
              />
              <div className="flex-1">
                <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>2. OCR & Clinical Entity Extraction</span>
                  <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Mandatory
                  </span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authorize optical character recognition to extract medication names, past diagnoses, and lab values from your scanned papers.
                </p>
              </div>
            </label>

            {/* 3. Hospital HIS Integration (Mandatory) */}
            <label className="flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.hisSharing}
                onChange={(e) => setConsent((prev) => ({ ...prev, hisSharing: e.target.checked }))}
                className="mt-1 w-5 h-5 rounded-lg text-primary-600 focus:ring-primary-500 border-slate-300"
              />
              <div className="flex-1">
                <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>3. Transmit Summary to Consulting Doctor & Hospital HIS</span>
                  <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Mandatory
                  </span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authorize sending the physician-ready summary directly to the doctor's OPD screen when your token is called.
                </p>
              </div>
            </label>

            {/* 4. ABHA Linking (Optional) */}
            <label className="flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.abhaLinking}
                onChange={(e) => setConsent((prev) => ({ ...prev, abhaLinking: e.target.checked }))}
                className="mt-1 w-5 h-5 rounded-lg text-primary-600 focus:ring-primary-500 border-slate-300"
              />
              <div className="flex-1">
                <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>4. Link Consultation Record to ABHA (Ayushman Bharat)</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Optional
                  </span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronize this OPD visit slip with your National Digital Health Mission (ABHA) health locker for future hospital visits.
                </p>
              </div>
            </label>

          </div>

          {/* Validation Error Notice if mandatory unchecked */}
          {validationError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Continue Button */}
          <div className="pt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate('/kiosk/language')}
              className="kiosk-btn px-6 py-3.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100"
            >
              {t.previous}
            </button>

            <button
              type="button"
              onClick={handleProceed}
              className="kiosk-btn px-10 py-4 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-base shadow-lg shadow-primary-600/30 flex items-center gap-2"
            >
              <span>Begin Health Questionnaire</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>

      {/* Camera Capture Modal */}
      <CameraScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        title={`Scan Medical Document (${selectedDocType})`}
        documentTypeLabel="Doctor prescription or lab paper"
        onCapture={(dataUrl) => handleCaptureCamera(dataUrl)}
      />

      {/* Full Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 text-white space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">{previewDoc.title}</h3>
              <button onClick={() => setPreviewDoc(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
              <img src={previewDoc.previewUrl} alt={previewDoc.title} className="max-h-full object-contain" />
            </div>
            <button
              type="button"
              onClick={() => setPreviewDoc(null)}
              className="kiosk-btn w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
