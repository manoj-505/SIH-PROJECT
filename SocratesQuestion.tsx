import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Keyboard, Volume2, Sparkles, Check, Plus } from 'lucide-react';
import { AudioButton } from '../common/AudioButton';
import { VirtualKeyboard } from '../common/VirtualKeyboard';
import { asrService } from '../../services/asrService';
import { useLanguage } from '../../context/LanguageContext';

export interface QuestionOption {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
  isRedFlagWarning?: boolean;
}

interface SocratesQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  title: string;
  description: string;
  audioPromptText: string;
  options: QuestionOption[];
  isMultiSelect?: boolean;
  selectedValues: string[];
  onSelect: (values: string[]) => void;
  customText: string;
  onCustomTextChange: (text: string) => void;
  onNext: () => void;
  onPrev?: () => void;
  canProceed: boolean;
  inputPlaceholder?: string;
}

export const SocratesQuestion: React.FC<SocratesQuestionProps> = ({
  questionNumber,
  totalQuestions,
  title,
  description,
  audioPromptText,
  options,
  isMultiSelect = false,
  selectedValues,
  onSelect,
  customText,
  onCustomTextChange,
  onNext,
  onPrev,
  canProceed,
  inputPlaceholder = 'Describe or add custom details...'
}) => {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(false);
  const [interimSpeech, setInterimSpeech] = useState<string>('');

  useEffect(() => {
    // Stop speech recognition when question changes
    if (isListening) {
      asrService.stopListening();
      setIsListening(false);
    }
  }, [questionNumber]);

  const handleOptionClick = (optionLabel: string) => {
    if (isMultiSelect) {
      if (selectedValues.includes(optionLabel)) {
        onSelect(selectedValues.filter((v) => v !== optionLabel));
      } else {
        onSelect([...selectedValues, optionLabel]);
      }
    } else {
      onSelect([optionLabel]);
    }
  };

  const toggleVoiceRecording = () => {
    if (isListening) {
      asrService.stopListening();
      setIsListening(false);
      setInterimSpeech('');
    } else {
      setIsListening(true);
      setInterimSpeech('Listening...');
      asrService.startListening(
        language,
        (transcript, isFinal) => {
          setInterimSpeech(transcript);
          if (isFinal) {
            const separator = customText.trim() ? ', ' : '';
            onCustomTextChange(`${customText.trim()}${separator}${transcript}`);
            setIsListening(false);
            setInterimSpeech('');
          }
        },
        (err) => {
          console.warn('Voice recognition notice:', err);
          setIsListening(false);
          setInterimSpeech('');
        },
        () => {
          setIsListening(false);
          setInterimSpeech('');
        }
      );
    }
  };

  const handleKeyboardPress = (char: string) => {
    onCustomTextChange(customText + char);
  };

  const handleKeyboardBackspace = () => {
    onCustomTextChange(customText.slice(0, -1));
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      
      {/* Progress & Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          <span>
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100 font-semibold">
            {Math.round((questionNumber / totalQuestions) * 100)}% Complete
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-sky-400 transition-all duration-300 rounded-full"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex-1 flex flex-col justify-between">
        
        <div>
          {/* Question Title & Audio TTS Read-Aloud */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-kiosk leading-tight">
                {title}
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-1.5 font-medium">
                {description}
              </p>
            </div>
            <div className="shrink-0">
              <AudioButton
                textToSpeak={audioPromptText}
                label="Listen to Question"
                size="md"
              />
            </div>
          </div>

          {/* Touch-Guided Multi-Choice / Chips Grid (Input Mode 1) */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                Mode 1: Touch Quick Options {isMultiSelect && '(Select multiple)'}
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {options.map((opt) => {
                const isSelected = selectedValues.includes(opt.label);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleOptionClick(opt.label)}
                    className={`kiosk-btn p-4 rounded-2xl border-2 text-left flex items-start justify-between gap-3 transition-all min-h-[64px] ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50/80 text-primary-950 shadow-md ring-2 ring-primary-500/20'
                        : opt.isRedFlagWarning
                        ? 'border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-slate-900'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-white text-slate-800'
                    }`}
                  >
                    <div>
                      <span className="text-base font-bold block leading-snug">
                        {opt.label}
                      </span>
                      {opt.sublabel && (
                        <span className="text-xs text-slate-500 mt-0.5 block">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                        isSelected
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'border-slate-300 bg-white text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simultaneous Modes 2 & 3: Voice + Typing with Virtual Keyboard */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Mode 2 & 3: Voice Dictation & Text Input
              </label>

              <button
                type="button"
                onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                  showVirtualKeyboard
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>{showVirtualKeyboard ? 'Hide Touch Keyboard' : 'Show Touch Keyboard'}</span>
              </button>
            </div>

            {/* Input bar with integrated Voice Mic Button */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={customText}
                onChange={(e) => onCustomTextChange(e.target.value)}
                placeholder={inputPlaceholder}
                className="w-full pl-4 pr-32 py-3.5 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-200 focus:border-primary-500 rounded-2xl text-base font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-400 shadow-inner"
              />

              {/* Microphone Toggle (Mode 2) */}
              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  title="Speak into Microphone"
                  className={`kiosk-btn px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-700 animate-pulse ring-4 ring-rose-400/30'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 text-white" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-primary-600" />
                      <span>Speak</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Speech Interim Feedback banner */}
            {isListening && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                <span>{interimSpeech || 'Listening... Speak in your chosen language'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Actions Footer */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          {onPrev ? (
            <button
              type="button"
              onClick={onPrev}
              className="kiosk-btn px-6 py-3.5 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-base"
            >
              {t.previous}
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className="kiosk-btn px-8 py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white font-bold text-base shadow-lg shadow-primary-600/30 flex items-center gap-2"
          >
            <span>{t.next}</span>
            <span className="text-xl leading-none">→</span>
          </button>
        </div>

      </div>

      {/* On-Screen Virtual Keyboard for Kiosks */}
      {showVirtualKeyboard && (
        <div className="mt-4">
          <VirtualKeyboard
            onKeyPress={handleKeyboardPress}
            onBackspace={handleKeyboardBackspace}
            onClose={() => setShowVirtualKeyboard(false)}
            isOpen={showVirtualKeyboard}
          />
        </div>
      )}

    </div>
  );
};
