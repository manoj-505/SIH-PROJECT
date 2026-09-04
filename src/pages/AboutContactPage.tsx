import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Info,
  PhoneCall,
  ShieldCheck,
  Languages,
  FileCheck,
  HeartPulse,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';

export const AboutContactPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col select-none">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-8">
        
        {/* About MediKiosk Hero */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-md">
              <Activity className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 font-kiosk">
                About MediKiosk Health Terminal
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                AI-Driven Pre-Consultation History Engine for Indian Hospital Outpatient Departments
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            In high-volume public and tertiary hospitals across India, clinicians often face overwhelming OPD queues with over 150 patients per shift. Elderly, low-literacy, and first-time patients frequently struggle to recall chronological histories or communicate medical specifics within typical 3-minute consultations. 
          </p>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            <strong>MediKiosk</strong> empowers patients to independently document their chief complaint, symptom character, allergies, and lifestyle habits using tactile touch buttons and regional speech recognition (Hindi, Marathi, Gujarati, English). Its built-in optical scanner automatically extracts medication names and flags abnormal blood parameters from physical papers. An AI clinical synthesis layer generates draft SOAP summaries directly on the doctor's screen the instant the patient's token is called.
          </p>

          {/* Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <Languages className="w-6 h-6 text-primary-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">Multilingual Accessibility</h4>
              <p className="text-xs text-slate-500 mt-1">Full voice prompts and TTS read-aloud in 4 regional languages.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <HeartPulse className="w-6 h-6 text-emerald-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">Allopathic & AYUSH</h4>
              <p className="text-xs text-slate-500 mt-1">Dashavidha Pariksha (Prakriti, Sara, Samhanana, Ahara-Vihara) support.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-6 h-6 text-amber-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">Emergency Red-Flags</h4>
              <p className="text-xs text-slate-500 mt-1">Continuous algorithmic heuristic surveillance for acute chest pain and stroke signs.</p>
            </div>
          </div>
        </div>

        {/* Contact & Helpdesk Information */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-kiosk">
                Hospital Helpdesk & Assistance
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Need immediate physical assistance at the kiosk? Contact our hospital support desk.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold">Kiosk Attendant Station:</strong>
                <span className="text-slate-600">OPD Hall B, Ground Floor, Near Registration Counter 4</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold">OPD Consultation Hours:</strong>
                <span className="text-slate-600">Monday – Saturday: 08:00 AM to 02:00 PM</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <PhoneCall className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold">Hospital Emergency Triage Desk:</strong>
                <span className="text-rose-600 font-black text-base">Dial 108 / Intercom #104</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold">Technical Helpdesk Email:</strong>
                <span className="text-slate-600">support@medikiosk.gov.in</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              type="button"
              onClick={() => navigate('/patient-home')}
              className="kiosk-btn px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Return to Patient Home
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
