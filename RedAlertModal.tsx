import React from 'react';
import { AlertTriangle, BellRing, PhoneCall, Check, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AudioButton } from './AudioButton';

interface RedAlertModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  triggers: string[];
}

export const RedAlertModal: React.FC<RedAlertModalProps> = ({
  isOpen,
  onDismiss,
  triggers
}) => {
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  const getSpokenAlertText = () => {
    if (language === 'hi') {
      return "आपातकालीन चेतावनी: आपके दर्ज किए गए लक्षण गंभीर हैं। कृपया तुरंत ओपीडी स्टाफ या पास की नर्स को सूचित करें। आपका टोकन प्राथमिकता पर रख दिया गया है।";
    } else if (language === 'mr') {
      return "तातडीचा इशारा: तुमची लक्षणे गंभीर वाटत आहेत. कृपया लगेच ओपीडी कर्मचारी किंवा परिचारिकेला कळवा.";
    } else if (language === 'gu') {
      return "કટોકટી ચેતવણી: તમારા લક્ષણો ગંભીર જણાય છે. કૃપા કરીને તરત જ સ્ટાફ અથવા નર્સનો સંપર્ક કરો.";
    }
    return "Critical Emergency Alert. Red-flag symptoms have been identified. Please alert the nearest kiosk attendant or hospital triage staff immediately. Emergency protocol initiated.";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white border-4 border-rose-600 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Pulsing Alert Top Bar */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white p-5 text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-20">
            <ShieldAlert className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl animate-bounce">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <span className="text-xs font-black uppercase tracking-widest bg-white/30 px-2 py-0.5 rounded text-rose-100">
                Triage Priority Red Alert
              </span>
              <h2 className="text-2xl font-black font-kiosk leading-tight text-white mt-0.5">
                {t.emergencyAlert}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
            <BellRing className="w-6 h-6 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-base font-bold leading-snug">
                {t.emergencyAlertBanner}
              </p>
              <p className="text-xs text-rose-700 mt-1 font-medium">
                Our clinical AI protocol detected high-risk emergency markers. The hospital triage team has been alerted.
              </p>
            </div>
          </div>

          {/* Triggered Symptoms List */}
          {triggers && triggers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Identified Red-Flag Symptoms:
              </h4>
              <ul className="space-y-1.5">
                {triggers.map((trigger, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm font-semibold text-rose-900 bg-rose-100/60 px-3 py-2 rounded-xl border border-rose-200/80"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    <span>{trigger}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action guidance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold block">Nearest Helpdesk</span>
              <span className="text-base font-black text-slate-900">OPD Counter #1</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-semibold block">Triage Desk Intercom</span>
              <span className="text-base font-black text-rose-600 flex items-center justify-center gap-1">
                <PhoneCall className="w-4 h-4" />
                <span>Ext. 108</span>
              </span>
            </div>
          </div>

          {/* Audio read-aloud button for elderly/low-literacy */}
          <div className="flex justify-center">
            <AudioButton
              textToSpeak={getSpokenAlertText()}
              label="Listen to Emergency Guidance"
              size="lg"
              className="bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200"
            />
          </div>

          {/* Dismiss button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onDismiss}
              className="kiosk-btn w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
            >
              <Check className="w-5 h-5" />
              <span>I Have Informed Staff / Continue Case-Taking</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
