import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Ticket,
  Lock,
  Hospital,
  AlertCircle
} from 'lucide-react';
import { useKioskSession } from '../context/KioskSessionContext';
import { useLanguage } from '../context/LanguageContext';
import { TokenReceipt } from '../components/kiosk/TokenReceipt';
import { AudioButton } from '../components/common/AudioButton';
import { TokenQueueItem } from '../types';

export const ConfirmSubmitPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    submitAndGenerateToken,
    activeToken,
    resetSession,
    questionnaire,
    documents
  } = useKioskSession();

  const { t, language } = useLanguage();

  const [finalConsentAgreed, setFinalConsentAgreed] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [issuedToken, setIssuedToken] = useState<TokenQueueItem | null>(activeToken);

  const handleConfirmSubmit = async () => {
    if (!finalConsentAgreed) {
      alert('Please agree to transmit your pre-consultation record to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const generated = await submitAndGenerateToken();
      setIssuedToken(generated);
    } catch (err) {
      alert('Failed to submit. Please check your connection and try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const spokenConfirmPrompt = language === 'hi'
    ? "अंतिम पुष्टि: क्या आप अपने द्वारा दर्ज विवरण और दस्तावेजों को अपने डॉक्टर के पास भेजने के लिए सहमत हैं? पुष्टि करने के लिए हरा बटन दबाएं और अपना टोकन प्राप्त करें।"
    : language === 'mr'
    ? "अंतिम संमती: तुम्ही ही माहिती डॉक्टरांकडे पाठवण्यास सहमत आहात का? पुष्टी करा आणि टोकन मिळवा."
    : language === 'gu'
    ? "અંતિમ પુષ્ટિ: શું તમે આ વિગતો ડૉક્ટરને મોકલવા સંમત છો? પુષ્ટિ કરો અને ટોકન મેળવો."
    : "Final Consent Confirmation. Do you authorize sending this clinical history and attached medical documents to your attending OPD doctor? Touch confirm to issue your consultation token.";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-8 select-none">
      
      {/* Top Breadcrumb Header (Hidden if token already issued) */}
      {!issuedToken && (
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate('/kiosk/summary')}
            className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
          >
            <span>← Back to Summary Review</span>
          </button>

          <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
            Step 5 of 5: Final Submission & Token
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 max-w-3xl mx-auto w-full my-auto py-6">
        
        {issuedToken ? (
          /* ISSUED TOKEN RECEIPT VIEW */
          <TokenReceipt
            token={issuedToken}
            onReset={resetSession}
          />
        ) : (
          /* PRE-SUBMISSION FINAL CONSENT CONFIRMATION */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-primary-100 text-primary-700 flex items-center justify-center mx-auto shadow-inner">
                <Ticket className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-kiosk tracking-tight">
                Ready to Generate OPD Token
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto font-medium">
                Please re-confirm your consent to transmit this medical case file directly to the doctor's desk.
              </p>
            </div>

            {/* Final Consent Checkbox */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-50 to-sky-50 border-2 border-primary-200 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={finalConsentAgreed}
                  onChange={(e) => setFinalConsentAgreed(e.target.checked)}
                  className="mt-1 w-6 h-6 rounded-lg text-primary-600 focus:ring-primary-500 border-slate-300"
                />
                <div>
                  <span className="text-base font-black text-slate-900 block leading-snug">
                    "I consent to send this clinical history and {documents.length} digitized document(s) to my consulting physician and hospital HIS."
                  </span>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    This summary is a draft pre-consultation aid and will be reviewed and verified in-person by your doctor.
                  </p>
                </div>
              </label>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-bold block mb-0.5">CHIEF COMPLAINT</span>
                <span className="font-extrabold text-slate-800">{questionnaire.chiefComplaint || 'Generalized'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-bold block mb-0.5">DOCUMENTS ATTACHED</span>
                <span className="font-extrabold text-slate-800">{documents.length} Records Analyzed</span>
              </div>
            </div>

            {/* Audio prompt button */}
            <div className="flex justify-center">
              <AudioButton
                textToSpeak={spokenConfirmPrompt}
                label="Listen in Audio"
                size="md"
              />
            </div>

            {/* Submission CTA */}
            <div>
              <button
                type="button"
                id="btn-confirm-token"
                disabled={!finalConsentAgreed || isSubmitting}
                onClick={handleConfirmSubmit}
                className="kiosk-btn w-full py-5 rounded-3xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting to OPD Doctor Desk...</span>
                  </>
                ) : (
                  <>
                    <Ticket className="w-6 h-6" />
                    <span>Confirm & Generate Token Slip</span>
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};