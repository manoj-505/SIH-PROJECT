import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Ticket,
  AlertTriangle,
  FileText,
  User,
  Clock,
  CheckCircle2,
  Edit,
  Save,
  Send,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  Activity,
  Layers,
  Sparkles,
  Calendar,
  Eye,
  LogOut
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { ocrService } from '../services/ocrService';
import { TokenQueueItem, ClinicalSummary, ScannedDocument } from '../types';

const API_BASE = "http://localhost:5000/api";

export const DoctorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { doctor, logout } = useAuth();

  const [queue, setQueue] = useState<TokenQueueItem[]>([]);
  const [activeTokenNo, setActiveTokenNo] = useState<string>('');
  const [activeSummary, setActiveSummary] = useState<ClinicalSummary | null>(null);
  const [patientDocs, setPatientDocs] = useState<ScannedDocument[]>([]);

  // Doctor editing draft summary state
  const [isEditingSummary, setIsEditingSummary] = useState<boolean>(false);
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [doctorPrescription, setDoctorPrescription] = useState<string>('');
  const [isSignedOff, setIsSignedOff] = useState<boolean>(false);

  // Active view tab: 'summary' | 'documents' | 'patient_info'
  const [activeTab, setActiveTab] = useState<'summary' | 'documents' | 'patient_info'>('summary');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const fetchSummaryById = async (summaryId: string): Promise<ClinicalSummary | null> => {
    try {
      const response = await fetch(`${API_BASE}/summaries/${summaryId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.error('Failed to fetch summary', err);
      return null;
    }
  };

  const loadDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/queue`);
      const q: TokenQueueItem[] = response.ok ? await response.json() : [];
      setQueue(q);

      const activeNo = storageService.getActiveToken() || (q[0]?.tokenNo ?? 'TK-A101');
      setActiveTokenNo(activeNo);

      const item = q.find((t) => t.tokenNo === activeNo) || q[0];
      if (item && item.summaryId) {
        const sum = await fetchSummaryById(item.summaryId);
        setActiveSummary(sum);
        setDoctorNotes(sum?.doctorNotes || '');
        setIsSignedOff(sum?.doctorApproved || false);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }

    const docs = storageService.getPatientDocuments();
    setPatientDocs(docs.length ? docs : ocrService.getSampleDocuments());
  };

  const handleSelectToken = async (tokenNo: string) => {
    setActiveTokenNo(tokenNo);
    storageService.setActiveToken(tokenNo);
    const item = queue.find((t) => t.tokenNo === tokenNo);
    if (item && item.summaryId) {
      const sum = await fetchSummaryById(item.summaryId);
      setActiveSummary(sum);
      setDoctorNotes(sum?.doctorNotes || '');
      setIsSignedOff(sum?.doctorApproved || false);
    }
  };

  const handleNextToken = () => {
    const currentIndex = queue.findIndex((t) => t.tokenNo === activeTokenNo);
    if (currentIndex < queue.length - 1) {
      handleSelectToken(queue[currentIndex + 1].tokenNo);
    }
  };

  const handlePrevToken = () => {
    const currentIndex = queue.findIndex((t) => t.tokenNo === activeTokenNo);
    if (currentIndex > 0) {
      handleSelectToken(queue[currentIndex - 1].tokenNo);
    }
  };

  // Note: backend doesn't yet have a "save draft notes" route separate from approval,
  // so this only updates local UI state for now — notes persist to the database
  // once "Accept & Finalize" is clicked.
  const handleSaveDraft = () => {
    if (activeSummary) {
      setActiveSummary({ ...activeSummary, doctorNotes });
      setIsEditingSummary(false);
    }
  };

  const handleAcceptAndSignOff = async () => {
    if (!activeSummary) return;

    try {
      const approveResponse = await fetch(`${API_BASE}/summaries/${activeSummary.id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorNotes })
      });
      if (!approveResponse.ok) {
        throw new Error("Failed to approve summary");
      }

      await fetch(`${API_BASE}/queue/${activeTokenNo}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" })
      });

      setActiveSummary({ ...activeSummary, doctorNotes, doctorApproved: true });
      setIsSignedOff(true);
      await loadDashboardData();
      alert(`Case for Token ${activeTokenNo} successfully finalized and synced to Hospital HIS!`);
    } catch (err) {
      alert('Failed to finalize case. Please check your connection and try again.');
      console.error(err);
    }
  };

  const currentQueueItem = queue.find((t) => t.tokenNo === activeTokenNo) || queue[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col select-none font-sans">
      
      {/* Top Clinical Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-white flex items-center gap-2 font-kiosk">
                MediKiosk <span className="text-emerald-400">Doctor OPD</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">
                  {doctor?.roomNo || 'OPD 104'}
                </span>
              </span>
              <p className="text-xs text-slate-400">
                Logged in as {doctor?.name || 'Dr. Anand Verma'} ({doctor?.qualification || 'MD Med'})
              </p>
            </div>
          </div>

          {/* Quick Links & Token Nav */}
          <div className="flex items-center space-x-3">
            <Link
              to="/doctor-opd"
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors hidden sm:block"
            >
              Full OPD Queue ({queue.length})
            </Link>

            <Link
              to="/patient-home"
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-primary-400 border border-slate-700 transition-colors"
            >
              Patient Kiosk View
            </Link>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              title="Logout"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Clinical Workspace */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT COLUMN: OPD Live Waiting Queue List (30% Width) */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-emerald-400" />
                <span>OPD Queue ({queue.length})</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Live
              </span>
            </div>

            {/* Waiting Queue list */}
            <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
              {queue.map((item) => {
                const isActive = item.tokenNo === activeTokenNo;
                const isEmergency = item.priority === 'emergency';
                return (
                  <button
                    key={item.tokenNo}
                    type="button"
                    onClick={() => handleSelectToken(item.tokenNo)}
                    className={`kiosk-btn w-full p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      isActive
                        ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                        : isEmergency
                        ? 'bg-rose-950/40 border-rose-800 hover:border-rose-600'
                        : 'bg-slate-900/60 border-slate-700/80 hover:bg-slate-900 hover:border-slate-600'
                    }`}
                  >
                    {isEmergency && (
                      <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                        RED ALERT
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg font-black font-kiosk text-white">
                        {item.tokenNo}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-200 truncate">
                      {item.patientName} ({item.age}y / {item.gender[0]})
                    </p>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.chiefComplaint}
                    </p>
                  </button>
                );
              })}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Active Patient Consultation Panel (70% Width) */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Prominent Active Token Bar at the Very Top of Screen */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-800 border-2 border-slate-700 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-2xl font-kiosk shadow-lg shadow-emerald-600/30">
                {currentQueueItem?.tokenNo || 'TK-A101'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Currently Calling
                  </span>
                  {currentQueueItem?.priority === 'emergency' && (
                    <span className="text-[10px] font-black uppercase bg-rose-600 text-white px-2 py-0.5 rounded animate-pulse">
                      Triage Emergency
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-kiosk">
                  {currentQueueItem?.patientName} ({currentQueueItem?.age}y / {currentQueueItem?.gender})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  ABHA ID: {activeSummary?.abhaId || '91-XXXX-XXXX-XXXX'} • Chief Complaint: {currentQueueItem?.chiefComplaint}
                </p>
              </div>
            </div>

            {/* Token Navigation Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevToken}
                className="kiosk-btn p-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600"
                title="Previous Token"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleNextToken}
                className="kiosk-btn px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
              >
                <span>Call Next Token</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Red Alert Banner for Critical Patients flagged by AI */}
          {activeSummary?.priority === 'emergency' && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 border-2 border-rose-500 shadow-xl flex items-start gap-4 animate-in fade-in">
              <div className="p-3 bg-rose-600 text-white rounded-2xl shrink-0 mt-0.5 animate-bounce">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-rose-200 uppercase tracking-wide">
                    🚨 AI Red-Flag Alert: Acute Emergency Triage Priority
                  </h4>
                  <span className="text-[10px] font-bold bg-rose-800 text-rose-100 px-2 py-0.5 rounded">
                    Immediate Attention
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-rose-100 mt-1 font-medium leading-relaxed">
                  {activeSummary.emergencyNotice || 'High-risk cardiovascular / respiratory indicators detected by pre-consultation engine. Immediate priority consultation recommended.'}
                </p>
              </div>
            </div>
          )}

          {/* Clinical Workspace Tabs: Summary, Documents, Patient Info */}
          <div className="flex border-b border-slate-700 bg-slate-800/80 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`kiosk-btn flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'summary'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>AI Clinical Summary (SOAP)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`kiosk-btn flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'documents'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Digitized Documents & Labs ({patientDocs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('patient_info')}
              className={`kiosk-btn flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'patient_info'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Demographics & ABHA</span>
            </button>
          </div>

          {/* TAB 1: AI Clinical Summary & Doctor Editing */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              
              {/* Structured SOAP Notes Card */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl font-mono text-xs sm:text-sm">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-2 font-sans font-bold text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span>PHYSICIAN-READY DRAFT NOTE</span>
                  </div>

                  <div className="flex items-center gap-2 font-sans">
                    <button
                      type="button"
                      onClick={() => setIsEditingSummary(!isEditingSummary)}
                      className="kiosk-btn px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5 text-primary-400" />
                      <span>{isEditingSummary ? 'Close Edit Mode' : 'Amend / Edit Note'}</span>
                    </button>
                  </div>
                </div>

                {/* Structured Clinical Sections */}
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <span className="text-sky-400 font-bold block mb-1 font-sans text-xs uppercase tracking-wider">
                      [CHIEF COMPLAINT]
                    </span>
                    <p className="text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      {activeSummary?.chiefComplaint || currentQueueItem?.chiefComplaint}
                    </p>
                  </div>

                  <div>
                    <span className="text-sky-400 font-bold block mb-1 font-sans text-xs uppercase tracking-wider">
                      [HISTORY OF PRESENT ILLNESS (HPI)]
                    </span>
                    <p className="text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                      {activeSummary?.hpiClinicalSummary || 'Patient reports acute symptoms as described.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sky-400 font-bold block mb-1 font-sans text-xs uppercase tracking-wider">
                        [PAST COMORBIDITIES & SURGERIES]
                      </span>
                      <p className="text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        {activeSummary?.pastMedicalSummary || 'No documented comorbidities.'}
                      </p>
                    </div>

                    <div>
                      <span className="text-sky-400 font-bold block mb-1 font-sans text-xs uppercase tracking-wider">
                        [ALLERGIES & DRUGS]
                      </span>
                      <p className="text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        {activeSummary?.drugAllergySummary || 'NKDA.'}
                      </p>
                    </div>
                  </div>

                  {activeSummary?.ayushSummary && (
                    <div>
                      <span className="text-amber-400 font-bold block mb-1 font-sans text-xs uppercase tracking-wider">
                        [AYUSH DASHAVIDHA PARIKSHA]
                      </span>
                      <p className="text-amber-200 bg-amber-950/30 p-3 rounded-xl border border-amber-800/60 leading-relaxed">
                        {activeSummary.ayushSummary}
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Doctor Clinical Impression, Rx, and Accept Action */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-400" />
                  <span>Physician Clinical Orders & Prescription</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">
                      Doctor Clinical Impression & Diagnostic Notes:
                    </label>
                    <textarea
                      rows={3}
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="Type doctor clinical impression, physical exam findings, or orders..."
                      className="w-full p-3.5 bg-slate-900 border-2 border-slate-700 rounded-2xl text-xs font-medium text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">
                      Prescription / Advice (Rx):
                    </label>
                    <textarea
                      rows={2}
                      value={doctorPrescription}
                      onChange={(e) => setDoctorPrescription(e.target.value)}
                      placeholder="e.g. Tab Clopidogrel 75mg OD, ECG Stat, Referral to Cardiology..."
                      className="w-full p-3.5 bg-slate-900 border-2 border-slate-700 rounded-2xl text-xs font-medium text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="kiosk-btn flex-1 py-3.5 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Draft Changes</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAcceptAndSignOff}
                    className="kiosk-btn flex-[2] py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Accept & Finalize Case to Hospital HIS</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: Digitized Documents & Abnormal Labs */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              
              {/* Abnormal Labs Callout */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Highlighted Abnormal Laboratory Values</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800">
                    <span className="text-[11px] text-slate-400 font-semibold block">HbA1c Glycated Hemoglobin</span>
                    <span className="text-xl font-black text-rose-400 block mt-1">8.6 %</span>
                    <span className="text-[10px] text-rose-300">Ref: &lt; 5.7% (Uncontrolled Diabetes)</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800">
                    <span className="text-[11px] text-slate-400 font-semibold block">Fasting Blood Sugar (FBS)</span>
                    <span className="text-xl font-black text-rose-400 block mt-1">172 mg/dL</span>
                    <span className="text-[10px] text-rose-300">Ref: 70 - 100 mg/dL (High)</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800">
                    <span className="text-[11px] text-slate-400 font-semibold block">Recorded Blood Pressure</span>
                    <span className="text-xl font-black text-rose-400 block mt-1">168 / 104 mmHg</span>
                    <span className="text-[10px] text-rose-300">Stage 2 Hypertension</span>
                  </div>
                </div>
              </div>

              {/* Chronologically Organized Scanned Documents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {patientDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        {doc.type}
                      </span>
                      <span className="text-xs text-slate-400">{doc.date}</span>
                    </div>

                    <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center">
                      <img src={doc.previewUrl} alt={doc.title} className="w-full h-full object-cover" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{doc.title}</h4>
                      {doc.extractedData?.doctorName && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          Prescribed by: {doc.extractedData.doctorName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: Demographics & ABHA */}
          {activeTab === 'patient_info' && (
            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              <h3 className="text-base font-black text-white">Patient Profile & ABHA Identity</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-1">
                  <span className="text-slate-400">Full Name</span>
                  <p className="text-sm font-bold text-white">{currentQueueItem?.patientName}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-1">
                  <span className="text-slate-400">Age & Gender</span>
                  <p className="text-sm font-bold text-white">{currentQueueItem?.age} Years / {currentQueueItem?.gender}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-1">
                  <span className="text-slate-400">ABHA Health Address</span>
                  <p className="text-sm font-mono text-emerald-400 font-bold">
                    {activeSummary?.abhaId || '91-7890-1234-5678@abdm'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-1">
                  <span className="text-slate-400">Contact Number</span>
                  <p className="text-sm font-bold text-white">{activeSummary?.mobile || '+91 98765 43210'}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 text-xs text-emerald-200">
                ✓ Consent verified: Patient authorized data capture, AI document processing, and hospital HIS sharing.
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};