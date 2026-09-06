import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Printer,
  MessageSquare,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TokenQueueItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AudioButton } from '../common/AudioButton';

interface TokenReceiptProps {
  token: TokenQueueItem;
  onReset: () => void;
}

export const TokenReceipt: React.FC<TokenReceiptProps> = ({ token, onReset }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [smsSent, setSmsSent] = useState<boolean>(false);

  useEffect(() => {
    // Fire celebratory confetti on token issuance
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if unavailable
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onReset();
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleSendSms = () => {
    setSmsSent(true);
    setTimeout(() => {
      setSmsSent(false);
    }, 4000);
  };

  const spokenTokenText = language === 'hi'
    ? `बधाई हो! आपका टोकन नंबर ${token.tokenNo} है। कृपया ओपीडी कमरा नंबर 104 के बाहर प्रतीक्षा करें। आपका अनुमानित समय लगभग ${token.estimatedWaitMins} मिनट है।`
    : language === 'mr'
    ? `अभिनंदन! तुमचा टोकन क्रमांक ${token.tokenNo} आहे. कृपया खोली 104 बाहेर थांबा. अंदाजे वेळ ${token.estimatedWaitMins} मिनिटे आहे.`
    : language === 'gu'
    ? `અભિનંદન! તમારો ટોકન નંબર ${token.tokenNo} છે. કૃપા કરીને રૂમ નંબર 104 ની બહાર રાહ જુઓ.`
    : `Your consultation token number is ${token.tokenNo}. Please proceed to ${token.roomNo}. Your estimated wait time is approximately ${token.estimatedWaitMins} minutes.`;

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
      
      {/* Audio Announcement helper */}
      <div className="flex justify-center">
        <AudioButton
          textToSpeak={spokenTokenText}
          label="Listen to Token Details"
          size="lg"
          className="bg-primary-600 text-white hover:bg-primary-700 shadow-md"
        />
      </div>

      {/* Kiosk Slip Container */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-2xl print:border-none print:shadow-none">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-primary-700 to-sky-600 text-white p-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Official OPD Consultation Slip</span>
          </div>
          <h2 className="text-2xl font-black font-kiosk tracking-tight">
            MediKiosk Hospital OPD
          </h2>
          <p className="text-xs text-sky-100 mt-0.5">District General Hospital & Medical College</p>
        </div>

        {/* Big Token Number Display */}
        <div className="p-8 text-center bg-slate-50 border-b border-dashed border-slate-300">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">
            {t.tokenNumber}
          </span>
          <div className="text-6xl sm:text-7xl font-black text-primary-600 tracking-tight font-kiosk drop-shadow-sm">
            {token.tokenNo}
          </div>

          {token.priority === 'emergency' && (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-black uppercase mt-3 shadow-md animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Priority Red Alert: Inform Triage Nurse</span>
            </div>
          )}
        </div>

        {/* Key Appointment Details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-primary-600" />
                <span>{t.roomNumber}</span>
              </span>
              <span className="text-lg font-black text-slate-900 block">
                {token.roomNo}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.estimatedWait}</span>
              </span>
              <span className="text-lg font-black text-slate-900 block">
                ~{token.estimatedWaitMins} Mins
              </span>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Patient Name:</span>
              <span className="font-bold text-slate-900">{token.patientName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Assigned Doctor:</span>
              <span className="font-bold text-primary-700">{token.doctorName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Token Issued At:</span>
              <span className="font-semibold text-slate-600">{token.createdAt}</span>
            </div>
          </div>

          {/* Verification Barcode Simulation */}
          <div className="text-center pt-2">
            <div className="h-10 mx-auto max-w-xs flex items-center justify-between opacity-70">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-full bg-slate-900 ${i % 3 === 0 ? 'w-1.5' : i % 2 === 0 ? 'w-0.5' : 'w-1'}`}
                />
              ))}
            </div>
            <span className="text-[10px] tracking-widest text-slate-400 mt-1 block uppercase font-mono">
              ABHA-VERIFIED-TRANSACTION-REF-{token.tokenNo}
            </span>
          </div>

        </div>

        {/* Action Controls (Hidden when printed) */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="kiosk-btn flex-1 py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printToken}</span>
          </button>

          <button
            type="button"
            onClick={handleSendSms}
            className="kiosk-btn flex-1 py-3.5 rounded-2xl bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>{smsSent ? '✓ Sent to Mobile!' : t.sendSmsWhatsapp}</span>
          </button>
        </div>

      </div>

      {/* Auto Reset Timer Bar */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{t.sessionResetIn}</span>
          <span className="font-black text-primary-600 text-sm">{secondsRemaining}s</span>
        </div>

        <button
          type="button"
          onClick={() => {
            onReset();
            navigate('/');
          }}
          className="kiosk-btn px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.newSession}</span>
        </button>
      </div>

    </div>
  );
};
