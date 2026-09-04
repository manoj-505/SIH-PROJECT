import React from 'react';
import { Leaf, Sparkles, Check, Flame, Wind, Droplets } from 'lucide-react';
import { AyushAssessment } from '../../types';
import { AudioButton } from '../common/AudioButton';

interface AyushSectionProps {
  assessment: AyushAssessment;
  onChange: (updated: AyushAssessment) => void;
}

export const AyushSection: React.FC<AyushSectionProps> = ({
  assessment,
  onChange
}) => {
  const prakritiOptions: { type: AyushAssessment['prakritiDominant']; icon: any; color: string; desc: string }[] = [
    {
      type: 'Vata',
      icon: Wind,
      color: 'from-sky-500 to-indigo-500',
      desc: 'Light, dry skin, quick movement, irregular digestion, variable appetite.'
    },
    {
      type: 'Pitta',
      icon: Flame,
      color: 'from-amber-500 to-rose-500',
      desc: 'Warm body, sharp hunger, intense metabolism, prone to acidity and heat.'
    },
    {
      type: 'Kapha',
      icon: Droplets,
      color: 'from-emerald-500 to-teal-500',
      desc: 'Heavy, calm, steady digestion, soft skin, strong stamina, prone to mucus.'
    },
    {
      type: 'Vata-Pitta',
      icon: Sparkles,
      color: 'from-amber-600 to-orange-500',
      desc: 'Dual combination: High energy, quick metabolism, variable tolerance to cold.'
    },
    {
      type: 'Pitta-Kapha',
      icon: Leaf,
      color: 'from-teal-600 to-emerald-600',
      desc: 'Dual combination: Strong physique, balanced heat and endurance.'
    },
    {
      type: 'Tridoshic',
      icon: Sparkles,
      color: 'from-purple-600 to-indigo-600',
      desc: 'Harmonious balance of all three Doshas (Vata, Pitta, Kapha).'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-ayush-50 to-amber-50 border border-ayush-200 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-ayush-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-ayush-600/20">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-ayush-900 font-kiosk">
              दशविध परीक्षा (Dashavidha Pariksha) & Ahara-Vihara
            </h3>
            <p className="text-xs sm:text-sm text-ayush-700 font-medium mt-0.5">
              Comprehensive Ayurvedic constitutional evaluation for holistic diagnosis
            </p>
          </div>
        </div>
        <AudioButton
          textToSpeak="दशविध परीक्षा: अपनी प्रकृति और आहार-विहार का चयन करें। यह आयुर्वेदिक परामर्श के लिए आवश्यक है।"
          label="Listen in Hindi"
          size="sm"
          className="bg-ayush-100 text-ayush-900 border-ayush-300"
        />
      </div>

      {/* 1. Prakriti Assessment */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h4 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-ayush-100 text-ayush-800 text-xs flex items-center justify-center font-black">
            1
          </span>
          प्रकृति निर्धारण (Prakriti / Bodily Constitution)
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Select the bodily constitution that best characterizes your natural state
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {prakritiOptions.map((item) => {
            const Icon = item.icon;
            const isSelected = assessment.prakritiDominant === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => onChange({ ...assessment, prakritiDominant: item.type })}
                className={`kiosk-btn p-4 rounded-2xl border-2 text-left flex flex-col justify-between gap-2 transition-all ${
                  isSelected
                    ? 'border-ayush-600 bg-ayush-50/80 ring-2 ring-ayush-500/20 shadow-md'
                    : 'border-slate-200 hover:border-ayush-300 bg-slate-50/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Icon className={`w-4 h-4 text-ayush-600`} />
                    <span>{item.type}</span>
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-ayush-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-snug">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sara, Samhanana & Sattva */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Sara */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <span className="text-xs font-black uppercase tracking-wider text-ayush-700 block mb-1">
            2. सार (Sara - Tissue Purity)
          </span>
          <div className="space-y-2 mt-3">
            {(['Pravara', 'Madhyama', 'Avara'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ ...assessment, sara: s })}
                className={`kiosk-btn w-full p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                  assessment.sara === s
                    ? 'border-ayush-600 bg-ayush-100 text-ayush-950 font-black'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <span>{s} ({s === 'Pravara' ? 'Superior' : s === 'Madhyama' ? 'Moderate' : 'Low'})</span>
                {assessment.sara === s && <Check className="w-3.5 h-3.5 text-ayush-700" />}
              </button>
            ))}
          </div>
        </div>

        {/* Ahara Shakti */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <span className="text-xs font-black uppercase tracking-wider text-ayush-700 block mb-1">
            3. आहार शक्ति (Digestive Power)
          </span>
          <div className="space-y-2 mt-3">
            {(['Uttama (Strong digestion)', 'Madhyama', 'Manda (Weak digestion)'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onChange({ ...assessment, aharaShakti: a })}
                className={`kiosk-btn w-full p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                  assessment.aharaShakti === a
                    ? 'border-ayush-600 bg-ayush-100 text-ayush-950 font-black'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <span>{a}</span>
                {assessment.aharaShakti === a && <Check className="w-3.5 h-3.5 text-ayush-700" />}
              </button>
            ))}
          </div>
        </div>

        {/* Vyayama Shakti */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <span className="text-xs font-black uppercase tracking-wider text-ayush-700 block mb-1">
            4. व्यायाम शक्ति (Physical Endurance)
          </span>
          <div className="space-y-2 mt-3">
            {(['Uttama', 'Madhyama', 'Heena'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ ...assessment, vyayamaShakti: v })}
                className={`kiosk-btn w-full p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                  assessment.vyayamaShakti === v
                    ? 'border-ayush-600 bg-ayush-100 text-ayush-950 font-black'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <span>{v} ({v === 'Uttama' ? 'High stamina' : v === 'Madhyama' ? 'Moderate' : 'Low'})</span>
                {assessment.vyayamaShakti === v && <Check className="w-3.5 h-3.5 text-ayush-700" />}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Ahara & Vihara Habits */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h4 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-ayush-100 text-ayush-800 text-xs flex items-center justify-center font-black">
            5
          </span>
          आहार-विहार (Dietary & Daily Lifestyle Regimen)
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Tap items matching your daily habits
        </p>

        <div className="flex flex-wrap gap-2">
          {[
            'Usna / Warm Food',
            'Snigdha / Oily Food',
            'Ruksha / Dry snacks',
            'Tikshna / Spicy food',
            'Divasvapna / Day-sleeping',
            'Ratri Jagarana / Late night awakening',
            'Vegadharana / Suppressing natural urges',
            'Chinta / Mental Stress'
          ].map((habit) => {
            const isSelected = assessment.aharaHabits.includes(habit);
            return (
              <button
                key={habit}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onChange({
                      ...assessment,
                      aharaHabits: assessment.aharaHabits.filter((h) => h !== habit)
                    });
                  } else {
                    onChange({
                      ...assessment,
                      aharaHabits: [...assessment.aharaHabits, habit]
                    });
                  }
                }}
                className={`kiosk-btn px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isSelected
                    ? 'bg-ayush-600 text-white border-ayush-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200'
                }`}
              >
                {isSelected ? `✓ ${habit}` : `+ ${habit}`}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
