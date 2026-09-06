import React, { useEffect, useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../types';
import { ttsService } from '../../services/ttsService';

interface AudioButtonProps {
  textToSpeak: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  language?: SupportedLanguage;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  textToSpeak,
  label = 'Listen',
  className = '',
  size = 'md',
  language,
}) => {
  const { language: selectedLanguage } = useLanguage();

  const [isSpeaking, setIsSpeaking] = useState(false);

  const speechLanguage = language ?? selectedLanguage;

  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  const stopSpeaking = () => {
    ttsService.stop();
    setIsSpeaking(false);
  };

  const handleClick = () => {
    if (!textToSpeak || !textToSpeak.trim()) {
      console.warn('AudioButton received empty text.');
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    console.log('AUDIO BUTTON:', {
      text: textToSpeak,
      language: speechLanguage,
    });

    ttsService.speak(
      textToSpeak,
      speechLanguage,
      () => {
        setIsSpeaking(true);
      },
      () => {
        setIsSpeaking(false);
      },
      (error) => {
        console.error('AudioButton TTS error:', error);
        setIsSpeaking(false);
      }
    );
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm gap-1.5',
    md: 'px-4 py-3 text-sm gap-2',
    lg: 'px-5 py-4 text-base gap-2.5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isSpeaking ? 'Stop audio' : label}
      className={`
        inline-flex
        items-center
        justify-center
        rounded-xl
        font-bold
        transition-all
        duration-200
        active:scale-95
        hover:shadow-md
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {isSpeaking ? (
        <Square
          className={iconSizes[size]}
          fill="currentColor"
        />
      ) : (
        <Volume2
          className={iconSizes[size]}
        />
      )}

      <span>
        {isSpeaking ? 'Stop' : label}
      </span>
    </button>
  );
};