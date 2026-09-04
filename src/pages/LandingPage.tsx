import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, UserCheck, Stethoscope, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 select-none">
      
      {/* Top Brand Bar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
            <Activity className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight font-kiosk flex items-center gap-1.5">
              Medi<span className="text-primary-400">Kiosk</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30 uppercase tracking-wider">
                Smart OPD
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              AI-Powered Pre-Consultation & Clinical OPD Platform
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ABHA & Ayushman Bharat Compliant</span>
        </div>
      </div>

      {/* Center Main: Two Large Clearly Separated Entry Points */}
      <div className="max-w-5xl mx-auto w-full my-auto py-12">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Touch & Voice Pre-Consultation</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black font-kiosk tracking-tight max-w-3xl mx-auto leading-tight">
            Select Your Portal to Continue
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto mt-3">
            Touch one of the two options below to begin consultation intake or open doctor OPD management
          </p>
        </div>

        {/* The Two Large Clearly Separated Entry Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. Patient Portal / Login Entry Point */}
          <button
            type="button"
            onClick={() => navigate('/patient-login')}
            className="kiosk-btn group relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-800/90 hover:from-primary-900/60 hover:to-slate-800 border-2 border-slate-700 hover:border-primary-500 shadow-2xl text-left flex flex-col justify-between transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all pointer-events-none" />

            <div>
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary-600 to-sky-400 flex items-center justify-center text-white shadow-xl shadow-primary-600/30 mb-8 group-hover:scale-110 transition-transform">
                <UserCheck className="w-10 h-10" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-primary-400 block mb-1">
                Patients & Attendants
              </span>
              <h3 className="text-3xl font-black text-white font-kiosk mb-3 group-hover:text-primary-300 transition-colors">
                Patient Login
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                {t.patientPortalDesc}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/80 flex items-center justify-between text-primary-400 group-hover:text-white font-bold text-base">
              <span>Start Patient Case-Taking</span>
              <div className="w-10 h-10 rounded-2xl bg-primary-500/20 group-hover:bg-primary-500 text-primary-300 group-hover:text-white flex items-center justify-center transition-all">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

          {/* 2. Doctor Portal / Login Entry Point */}
          <button
            type="button"
            onClick={() => navigate('/doctor-login')}
            className="kiosk-btn group relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-800/90 hover:from-emerald-950/60 hover:to-slate-800 border-2 border-slate-700 hover:border-emerald-500 shadow-2xl text-left flex flex-col justify-between transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

            <div>
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 mb-8 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-10 h-10" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 block mb-1">
                Physicians & Specialists
              </span>
              <h3 className="text-3xl font-black text-white font-kiosk mb-3 group-hover:text-emerald-300 transition-colors">
                Doctor Login
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                {t.doctorPortalDesc}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/80 flex items-center justify-between text-emerald-400 group-hover:text-white font-bold text-base">
              <span>Open Doctor Clinical OPD</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 group-hover:bg-emerald-500 text-emerald-300 group-hover:text-white flex items-center justify-center transition-all">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>

        </div>

      </div>

      {/* Footer Branding */}
      <div className="max-w-6xl mx-auto w-full pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <span>© 2026 MediKiosk Health Systems — High-Volume Indian Hospital OPD Automation</span>
        <span>Voice (Hindi, Marathi, Gujarati, English) • OCR Document Scanner • Clinical AI</span>
      </div>

    </div>
  );
};
