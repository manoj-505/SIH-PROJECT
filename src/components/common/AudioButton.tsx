import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AudioButtonProps {
  textToSpeak: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  textToSpeak,
  label,
  className = '',
  size = 'md'
}) => {
  const { speakText, stopSpeaking, isSpeaking, t } = useLanguage();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(textToSpeak);
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5 font-semibold'
  }[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isSpeaking ? t.stop : t.listen}
      className={`kiosk-btn inline-flex items-center rounded-full border transition-all duration-200 shadow-sm ${
        isSpeaking
          ? 'bg-amber-500 text-white border-amber-600 animate-pulse ring-2 ring-amber-300'
          : 'bg-primary-50 text-primary-800 border-primary-200 hover:bg-primary-100'
      } ${sizeClasses} ${className}`}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-4 h-4 animate-bounce" />
          <span>{label || t.stop}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-primary-600" />
          <span>{label || t.listen}</span>
        </>
      )}
    </button>
  );
};
