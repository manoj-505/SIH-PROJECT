import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  FolderClock,
  Info,
  PhoneCall,
  Activity,
  FileText,
  Calendar,
  AlertCircle,
  X,
  Stethoscope,
  HeartPulse
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { storageService } from '../services/storageService';
import { ocrService } from '../services/ocrService';
import { AudioButton } from '../components/common/AudioButton';

export const PatientHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { patient } = useAuth();
  const { t } = useLanguage();

  // Drawer / modal states for the 3 top-right stack items
  const [activeModal, setActiveModal] = useState<'none' | 'about' | 'previous_data' | 'contact'>('none');

  const sampleDocs = ocrService.getSampleDocuments();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col select-none">
      
      {/* Top navigation bar (single row, left to right: Home, Patient Kiosk, Doctor OPD List, About Us) */}
      <Navbar />

      {/* Main Container below Nav bar */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        
        {/* Layout with Strict Geometry:
            Right side, top 30% of page height, right 30% of width: Vertical Stack (About Us, Patient Previous Data, Contact Us)
            Left/middle main area (remaining 70% space): MediKiosk heading, 1.5-2 line description, Consult Now button
        */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch pt-4">
          
          {/* LEFT / MIDDLE MAIN AREA (Remaining 70% Width) */}
          <div className="lg:w-[70%] flex flex-col justify-center pr-0 lg:pr-8 space-y-6">
            
            {/* Patient Greeting Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary-50 border border-primary-200 text-primary-900 text-xs sm:text-sm font-bold w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Namaste, {patient?.name || 'Valued Patient'} (ABHA: {patient?.abhaId ? patient.abhaId.slice(0, 12) + '...' : 'Linked'})
              </span>
            </div>

            {/* Website name "MediKiosk" in large heading style */}
            <div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight font-kiosk leading-none">
                Medi<span className="text-primary-600">Kiosk</span>
              </h1>
              <span className="text-sm sm:text-base font-bold text-primary-700 tracking-wide uppercase mt-1 block">
                Next-Generation Pre-Consultation Touch & Voice Health Terminal
              </span>
            </div>

            {/* 1.5–2 line description of what the platform is and does */}
            <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl">
              An intelligent case-taking kiosk designed for high-volume hospital OPDs. Record your symptoms using voice or touch, digitize old prescriptions with automated OCR, and receive an instant doctor consultation token without standing in long queues.
            </p>

            {/* Audio read-aloud button for elderly/low-literacy accessibility */}
            <div>
              <AudioButton
                textToSpeak="मेडीकियोस्क में आपका स्वागत है। डॉक्टर से मिलने से पहले अपनी बीमारी की जानकारी बोलकर या छूकर दर्ज करने के लिए नीचे दिए गए 'कंसल्ट नाउ' बटन को दबाएं।"
                label="Listen to Audio Guide"
                size="md"
              />
            </div>

            {/* Prominent "Consult Now" Call-To-Action Button */}
            <div className="pt-2">
              <button
                type="button"
                id="btn-consult-now"
                onClick={() => navigate('/kiosk/language')}
                className="kiosk-btn group relative px-10 py-6 rounded-3xl bg-gradient-to-r from-primary-600 via-sky-600 to-primary-700 hover:from-primary-500 hover:to-sky-500 text-white font-black text-xl sm:text-2xl shadow-2xl shadow-primary-600/40 flex items-center justify-between gap-6 max-w-md w-full border-2 border-primary-400/40 ring-4 ring-primary-500/10 hover:ring-primary-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-white/20 group-hover:scale-110 transition-transform">
                    <HeartPulse className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <span className="font-kiosk tracking-tight">{t.consultNow}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white text-primary-700 flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-md">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </button>
              <p className="text-xs text-slate-500 font-semibold mt-2.5 pl-2">
                ⚡ Takes only 2–3 minutes • Multilingual (Hindi, Marathi, Gujarati, English)
              </p>
            </div>

          </div>

          {/* RIGHT SIDE: Top 30% of page height, right 30% of width
              A vertical stack containing three items:
              1. About Us
              2. Patient Previous Data (old doctor prescriptions and reports)
              3. Contact Us
          */}
          <div className="lg:w-[30%] flex flex-col justify-start">
            
            <div className="p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-lg space-y-3">
              <div className="px-2 pt-1 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Quick Access Terminal Stack
                </span>
                <span className="w-2 h-2 rounded-full bg-primary-500" />
              </div>

              {/* 1. About Us Item */}
              <button
                type="button"
                onClick={() => setActiveModal('about')}
                className="kiosk-btn w-full p-4 rounded-2xl bg-slate-50 hover:bg-primary-50/70 border border-slate-200 hover:border-primary-300 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-900">
                      1. About Us
                    </h4>
                    <p className="text-[11px] text-slate-500">Hospital vision & kiosk tech</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* 2. Patient Previous Data Item */}
              <button
                type="button"
                onClick={() => setActiveModal('previous_data')}
                className="kiosk-btn w-full p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <FolderClock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                      2. Patient Previous Data
                    </h4>
                    <p className="text-[11px] text-slate-500">Old doctor prescriptions & lab reports</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* 3. Contact Us Item */}
              <button
                type="button"
                onClick={() => setActiveModal('contact')}
                className="kiosk-btn w-full p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-900">
                      3. Contact Us
                    </h4>
                    <p className="text-[11px] text-slate-500">Hospital helpdesk & kiosk assistant</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </button>

            </div>

          </div>

        </div>

        {/* Bottom Information Footer Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-semibold gap-2">
          <span>MediKiosk v2.4 • Smart OPD Queuing & Clinical AI Summary</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Kiosk Terminal #04 Active (OPD Wing B)</span>
          </span>
        </div>

      </div>

      {/* MODAL 1: About Us Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary-100 text-primary-700">
                  <Info className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 font-kiosk">About MediKiosk</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              MediKiosk transforms high-volume Indian hospital OPDs by bridging patient-doctor communication gaps. It provides voice-driven history taking in regional languages (Hindi, Marathi, Gujarati), automatic document digitization via OCR, emergency red-flag triage, and AYUSH Dashavidha Pariksha support.
            </p>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
              <p><strong>Developed For:</strong> Smart India Hackathon & High-Density OPDs</p>
              <p><strong>Standards:</strong> ABDM / ABHA M1, M2 & M3 Integration Ready</p>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="kiosk-btn w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Patient Previous Data Modal */}
      {activeModal === 'previous_data' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-4 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <FolderClock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 font-kiosk">Patient Previous Data</h3>
                  <p className="text-xs text-slate-500">Archived doctor prescriptions and lab investigations</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {sampleDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-primary-700 uppercase tracking-wider bg-primary-50 px-2.5 py-0.5 rounded-md">
                      {doc.type}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{doc.date}</span>
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{doc.title}</h4>
                  
                  {doc.extractedData && (
                    <div className="text-xs text-slate-600 space-y-1 pt-1">
                      <p><strong>Doctor:</strong> {doc.extractedData.doctorName} ({doc.extractedData.hospitalName})</p>
                      {doc.extractedData.diagnoses.length > 0 && (
                        <p><strong>Diagnoses:</strong> {doc.extractedData.diagnoses.join(', ')}</p>
                      )}
                      {doc.extractedData.medications.length > 0 && (
                        <p><strong>Prescribed Meds:</strong> {doc.extractedData.medications.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveModal('none')}
              className="kiosk-btn w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm"
            >
              Close Record Viewer
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Contact Us Modal */}
      {activeModal === 'contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 font-kiosk">Hospital Helpdesk</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Need assistance using the touch screen, voice recorder, or locating your doctor? Our staff is nearby to assist you.
            </p>
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">OPD Helpdesk Counter:</span>
                <span className="text-sm font-black text-slate-900">Ground Floor, Gate 2</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Emergency Triage Line:</span>
                <span className="text-sm font-black text-rose-600">108 / Ext. 104</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Kiosk Support Assistant:</span>
                <span className="text-sm font-black text-primary-700">+91 1800-200-4491</span>
              </div>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="kiosk-btn w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
