import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, CheckCircle2, ArrowRight, Languages, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SupportedLanguage } from '../types';
import { AudioButton } from '../components/common/AudioButton';

export const LanguageSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, languagesList, speakText, t } = useLanguage();

  const handleLanguageSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    // Audio confirmation in selected language
    const confirmationText = code === 'hi'
      ? 'हिंदी भाषा चुनी गई है।'
      : code === 'mr'
      ? 'मराठी भाषा निवडली आहे.'
      : code === 'gu'
      ? 'ગુજરાતી ભાષા પસંદ કરેલ છે.'
      : 'English language selected.';
    speakText(confirmationText);
  };

  const handleProceed = () => {
    navigate('/kiosk/documents');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col justify-between p-6 sm:p-10 select-none">
      
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/patient-home')}
          className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
        >
          <span>← Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <AudioButton
            textToSpeak="कृपया अपनी पसंदीदा भाषा चुनें। अंग्रेजी, हिंदी, मराठी, या गुजराती पर स्पर्श करें।"
            label="Listen to Audio Help"
            size="md"
          />
        </div>
      </div>

      {/* Main Selection Area */}
      <div className="max-w-4xl mx-auto w-full my-auto py-8">
        
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 border border-primary-200 text-primary-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Languages className="w-4 h-4 text-primary-600" />
            <span>Step 1 of 5: Accessibility & Language</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 font-kiosk tracking-tight">
            {t.selectLanguage}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mt-2 font-medium">
            {t.selectLanguageSub}
          </p>
        </div>

        {/* 4 Large Touch Target Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {languagesList.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <div
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                onMouseEnter={() => speakText(lang.sampleAudioText)}
                className={`kiosk-btn group relative p-6 sm:p-8 rounded-3xl border-3 cursor-pointer text-left transition-all duration-200 flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-xl ${
                  isSelected
                    ? 'bg-white border-primary-600 ring-4 ring-primary-500/20 shadow-primary-500/10'
                    : 'bg-white/80 hover:bg-white border-slate-200 hover:border-primary-400'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 font-kiosk tracking-tight">
                      {lang.nativeName}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-2xl flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600'
                      }`}
                    >
                      {isSelected ? <CheckCircle2 className="w-5 h-5" /> : <Volume2 className="w-4 h-4" />}
                    </div>
                  </div>

                  <span className="text-base font-bold text-primary-700 block">
                    {lang.name}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                    {lang.subtext}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-primary-600 font-semibold">
                  <span>Hover or touch to listen</span>
                  <span className="text-primary-600 font-bold">{isSelected ? '✓ Selected' : 'Tap to select'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleProceed}
            className="kiosk-btn px-10 py-5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-black text-lg sm:text-xl shadow-xl shadow-primary-600/30 flex items-center gap-3 transition-all transform hover:scale-105"
          >
            <span>Proceed with {languagesList.find(l => l.code === language)?.name}</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

      </div>

      {/* Footer hint */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-500 font-medium">
        You can switch language at any time from the top right globe icon.
      </div>

    </div>
  );
};
