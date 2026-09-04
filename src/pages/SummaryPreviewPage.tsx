import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  UserCheck,
  Stethoscope,
  Volume2,
  Edit3,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  X
} from 'lucide-react';
import { useKioskSession } from '../context/KioskSessionContext';
import { useLanguage } from '../context/LanguageContext';
import { AudioButton } from '../components/common/AudioButton';
import { ClinicalSummary } from '../types';

export const SummaryPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { questionnaire, documents, updateQuestionnaire, generateSummary } = useKioskSession();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  const [currentSummary, setCurrentSummary] = useState<ClinicalSummary | null>(null);
  
  // In-place edit modal
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editChiefComplaint, setEditChiefComplaint] = useState<string>('');
  const [editSeverity, setEditSeverity] = useState<number>(5);

  useEffect(() => {
    // Generate draft summary preview
    const draft = generateSummary('DRAFT-PREVIEW');
    setCurrentSummary(draft);
    setEditChiefComplaint(questionnaire.chiefComplaint);
    setEditSeverity(questionnaire.severity);
  }, []);

  const handleSaveCorrection = () => {
    updateQuestionnaire({
      chiefComplaint: editChiefComplaint,
      severity: editSeverity
    });
    const updatedDraft = generateSummary('DRAFT-PREVIEW');
    setCurrentSummary(updatedDraft);
    setIsEditing(false);
  };

  const spokenPatientSummary = currentSummary?.patientFriendlySummary.summaryText || '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-8 select-none">
      
      {/* Top Breadcrumb */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate('/kiosk/questionnaire')}
          className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
        >
          <span>← Back to Questionnaire</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
          Step 4 of 5: Summary Review
        </span>
      </div>

      <div className="max-w-5xl mx-auto w-full space-y-6 pb-12">
        
        {/* Header Ribbon */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Clinical Synthesis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-kiosk">
              {t.summaryTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Verify your medical summary before it is sent to the OPD doctor
            </p>
          </div>

          {/* Action buttons: Edit & Listen */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="kiosk-btn px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 border border-slate-200"
            >
              <Edit3 className="w-4 h-4 text-primary-600" />
              <span>Edit / Correct</span>
            </button>

            <AudioButton
              textToSpeak={spokenPatientSummary}
              label="Listen to Full Summary"
              size="md"
            />
          </div>
        </div>

        {/* Dual View Tab Selector */}
        <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('patient')}
            className={`kiosk-btn flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'patient'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{t.patientFriendlyView}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('doctor')}
            className={`kiosk-btn flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'doctor'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{t.clinicalSoapView}</span>
          </button>
        </div>

        {/* VIEW 1: Patient-Friendly Plain Language Summary */}
        {activeTab === 'patient' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="p-6 rounded-2xl bg-gradient-to-r from-primary-50 to-sky-50 border border-primary-100 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-primary-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary-600" />
                <span>Recorded Case Summary ({language.toUpperCase()})</span>
              </span>
              <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-semibold">
                {currentSummary?.patientFriendlySummary.summaryText}
              </p>
              <div className="p-3 rounded-xl bg-white border border-primary-200 text-xs font-bold text-primary-900">
                📌 {currentSummary?.patientFriendlySummary.keyTakeaway}
              </div>
            </div>

            {/* Breakdown Cards for Patient Verification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Main Complaint & Pain
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {questionnaire.chiefComplaint} (Intensity: {questionnaire.severity}/10)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Nature: {questionnaire.character} • Duration: {questionnaire.duration}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Digitized Documents
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {documents.length} Medical Documents Attached
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Extracted {currentSummary?.investigationSummary.abnormalValues.length || 0} abnormal laboratory indicators
                </p>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: Structured Clinical SOAP Summary (Physician View) */}
        {activeTab === 'doctor' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-xl space-y-5 font-mono text-xs sm:text-sm">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                CLINICAL PRE-CONSULTATION NOTE (HL7 / ABDM SOAP FORMAT)
              </span>
              <span className="text-slate-500 text-xs">Generated by MediKiosk Clinical AI</span>
            </div>

            {currentSummary?.priority === 'emergency' && (
              <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-600 text-rose-200 font-sans">
                <span className="text-xs font-black uppercase text-rose-400 block mb-1">
                  🚨 TRIAGE RED-FLAG ALERT
                </span>
                <p className="text-sm font-bold">
                  {currentSummary.emergencyNotice}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <span className="text-sky-400 font-bold block mb-0.5 font-sans uppercase tracking-wider text-xs">
                  [CHIEF COMPLAINT]
                </span>
                <p className="text-slate-200">{currentSummary?.chiefComplaint}</p>
              </div>

              <div>
                <span className="text-sky-400 font-bold block mb-0.5 font-sans uppercase tracking-wider text-xs">
                  [HISTORY OF PRESENT ILLNESS (HPI)]
                </span>
                <p className="text-slate-300 leading-relaxed">{currentSummary?.hpiClinicalSummary}</p>
              </div>

              <div>
                <span className="text-sky-400 font-bold block mb-0.5 font-sans uppercase tracking-wider text-xs">
                  [PAST MEDICAL & SURGICAL HISTORY]
                </span>
                <p className="text-slate-300 leading-relaxed">{currentSummary?.pastMedicalSummary}</p>
              </div>

              <div>
                <span className="text-sky-400 font-bold block mb-0.5 font-sans uppercase tracking-wider text-xs">
                  [ALLERGIES & CURRENT MEDICATIONS]
                </span>
                <p className="text-slate-300 leading-relaxed">{currentSummary?.drugAllergySummary}</p>
              </div>

              <div>
                <span className="text-sky-400 font-bold block mb-0.5 font-sans uppercase tracking-wider text-xs">
                  [FAMILY & PERSONAL HISTORY]
                </span>
                <p className="text-slate-300 leading-relaxed">{currentSummary?.familyPersonalSummary}</p>
              </div>

              <div>
                <span className="text-sky-400 font-bold block mb-0.5 font-sans uppercase tracking-wider text-xs">
                  [REVIEW OF SYSTEMS]
                </span>
                <p className="text-slate-300 leading-relaxed">{currentSummary?.rosSummary}</p>
              </div>

              {currentSummary?.ayushSummary && (
                <div>
                  <span className="text-amber-400 font-bold block mb-0.5 font-sans uppercase tracking-wider text-xs">
                    [AYUSH DASHAVIDHA PARIKSHA]
                  </span>
                  <p className="text-amber-200/90 leading-relaxed">{currentSummary.ayushSummary}</p>
                </div>
              )}

              {/* Digitized Lab Highlights */}
              {currentSummary?.investigationSummary.abnormalValues && currentSummary.investigationSummary.abnormalValues.length > 0 && (
                <div>
                  <span className="text-rose-400 font-bold block mb-1 font-sans uppercase tracking-wider text-xs">
                    [DIGITIZED OCR ABNORMAL LABS]
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {currentSummary.investigationSummary.abnormalValues.map((lab, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs flex justify-between">
                        <span className="text-slate-300">{lab.test}</span>
                        <span className="font-bold text-rose-400">{lab.value} {lab.unit} [{lab.flag}]</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Footer Navigation: Proceed to Confirm & Token */}
        <div className="pt-4 flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate('/kiosk/questionnaire')}
            className="kiosk-btn px-6 py-3.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100"
          >
            {t.previous}
          </button>

          <button
            type="button"
            onClick={() => navigate('/kiosk/confirm')}
            className="kiosk-btn px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <span>Proceed to Token Generation</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* In-Place Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900 font-kiosk">Correct Symptoms</h3>
              <button onClick={() => setIsEditing(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Chief Complaint</label>
              <input
                type="text"
                value={editChiefComplaint}
                onChange={(e) => setEditChiefComplaint(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-semibold text-slate-900 focus:bg-white focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Severity Rating (1-10): {editSeverity}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={editSeverity}
                onChange={(e) => setEditSeverity(parseInt(e.target.value, 10))}
                className="w-full accent-primary-600"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="kiosk-btn flex-1 py-3 rounded-xl border border-slate-300 font-bold text-sm text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCorrection}
                className="kiosk-btn flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md"
              >
                Save & Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
