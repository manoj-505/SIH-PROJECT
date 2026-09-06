import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, LanguageOption } from '../types';
import { TRANSLATIONS, Translations } from '../locales/translations';
import { ttsService } from '../services/ttsService';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
  languagesList: LanguageOption[];
  speakText: (
    text: string,
    languageOverride?: SupportedLanguage
  ) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  fontSizeScale: number; // 0.9, 1.0, 1.15
  setFontSizeScale: (scale: number) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean | ((prev: boolean) => boolean)) => void;
}

const LANGUAGES_LIST: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    subtext: 'Standard Indian English',
    sampleAudioText: 'Welcome to MediKiosk. Please touch to select English.'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    subtext: 'हिंदी में जारी रखें',
    sampleAudioText: 'मेडीकियोस्क में आपका स्वागत है। हिंदी चुनने के लिए स्पर्श करें।'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    subtext: 'मराठीमध्ये सुरू ठेवा',
    sampleAudioText: 'मेडीकियोस्क मध्ये आपले स्वागत आहे. मराठी निवडण्यासाठी स्पर्श करा.'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    subtext: 'ગુજરાતીમાં આગળ વધો',
    sampleAudioText: 'મેડીકિયોસ્ક માં આપનું સ્વાગત છે. ગુજરાતી પસંદ કરવા માટે સ્પર્શ કરો.'
  }
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [fontSizeScale, setFontSizeScale] = useState<number>(1.0);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('medikiosk_language') as SupportedLanguage;
    if (savedLang && ['en', 'hi', 'mr', 'gu'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('medikiosk_language', lang);
  };

  const speakText = (
    text: string,
    languageOverride?: SupportedLanguage
  ) => {
    const speechLanguage = languageOverride ?? language;

    setIsSpeaking(true);

    ttsService.speak(
      text,
      speechLanguage,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const stopSpeaking = () => {
    ttsService.stop();
    setIsSpeaking(false);
  };

  // Adjust root document font size
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', `${fontSizeScale}rem`);
  }, [fontSizeScale]);

  // Adjust high contrast
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: TRANSLATIONS[language] || TRANSLATIONS.en,
        languagesList: LANGUAGES_LIST,
        speakText,
        stopSpeaking,
        isSpeaking,
        fontSizeScale,
        setFontSizeScale,
        highContrast,
        setHighContrast
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
