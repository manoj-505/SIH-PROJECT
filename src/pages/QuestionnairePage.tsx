import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Leaf,
  AlertTriangle,
  HeartPulse,
  Flame,
  ArrowRight,
  ShieldAlert,
  Sliders,
  CheckCircle
} from 'lucide-react';
import { useKioskSession } from '../context/KioskSessionContext';
import { useLanguage } from '../context/LanguageContext';
import { SocratesQuestion, QuestionOption } from '../components/kiosk/SocratesQuestion';
import { AyushSection } from '../components/kiosk/AyushSection';
import { RedAlertModal } from '../components/common/RedAlertModal';
import { AudioButton } from '../components/common/AudioButton';

export const QuestionnairePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    questionnaire,
    updateQuestionnaire,
    isEmergencyAlert,
    emergencyTriggers,
    dismissEmergencyModal,
    loadSampleSession
  } = useKioskSession();

  const { t, language } = useLanguage();

  // Active step index
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = questionnaire.ayushMode ? 8 : 7;

  // STEP 1: Chief Complaint options
  const chiefComplaintOptions: QuestionOption[] = [
    { id: 'cc-1', label: 'Chest Pain / Pressure', sublabel: 'छाती में दर्द या भारीपन', isRedFlagWarning: true },
    { id: 'cc-2', label: 'High Fever & Chills', sublabel: 'तेज़ बुखार और कंपकंपी' },
    { id: 'cc-3', label: 'Shortness of Breath', sublabel: 'सांस लेने में कठिनाई', isRedFlagWarning: true },
    { id: 'cc-4', label: 'Severe Headache / Dizziness', sublabel: 'सिरदर्द या चक्कर आना' },
    { id: 'cc-5', label: 'Persistent Cough', sublabel: 'लगातार खांसी या कफ' },
    { id: 'cc-6', label: 'Abdominal Pain', sublabel: 'पेट में दर्द या मरोड़' },
    { id: 'cc-7', label: 'Joint / Back Pain', sublabel: 'जोड़ों या कमर का दर्द' },
    { id: 'cc-8', label: 'Sudden Weakness / Numbness', sublabel: 'अचानक कमज़ोरी या सुन्नपन', isRedFlagWarning: true }
  ];

  // STEP 2: Onset & Duration options
  const durationOptions: QuestionOption[] = [
    { id: 'dur-1', label: 'Sudden (Within last 2 hours)', sublabel: 'अचानक (पिछले 2 घंटों में)' },
    { id: 'dur-2', label: '1 to 3 Days', sublabel: '1 से 3 दिनों से' },
    { id: 'dur-3', label: '1 to 2 Weeks', sublabel: '1 से 2 सप्ताह से' },
    { id: 'dur-4', label: 'More than 1 Month', sublabel: 'एक महीने से अधिक (दीर्घकालिक)' }
  ];

  // STEP 3: Character / Nature of Pain
  const characterOptions: QuestionOption[] = [
    { id: 'ch-1', label: 'Crushing / Heavy Tightness', sublabel: 'भारी दबाव या जकड़न', isRedFlagWarning: true },
    { id: 'ch-2', label: 'Sharp / Stabbing Pain', sublabel: 'तेज़ चुभने वाला दर्द' },
    { id: 'ch-3', label: 'Dull Continuous Aching', sublabel: 'हल्का लगातार मीठा दर्द' },
    { id: 'ch-4', label: 'Burning Sensation', sublabel: 'जलन का अहसास (Heartburn/Burning)' },
    { id: 'ch-5', label: 'Throbbing / Pulsating', sublabel: 'धड़कता हुआ दर्द' }
  ];

  // STEP 4: Radiation & Factors
  const radiationOptions: QuestionOption[] = [
    { id: 'rad-1', label: 'Radiates to Left Arm & Shoulder', sublabel: 'बाएं हाथ या कंधे की तरफ जाता है', isRedFlagWarning: true },
    { id: 'rad-2', label: 'Radiates to Neck / Jaw', sublabel: 'गर्दन या जबड़े की तरफ जाता है', isRedFlagWarning: true },
    { id: 'rad-3', label: 'Radiates to Upper Back', sublabel: 'पीठ के ऊपरी हिस्से में फैलता है' },
    { id: 'rad-4', label: 'Localized (Does not spread)', sublabel: 'एक ही जगह रहता है' }
  ];

  // STEP 5: Past Medical & Comorbidities
  const pastMedicalOptions: QuestionOption[] = [
    { id: 'pm-1', label: 'Hypertension (High BP)', sublabel: 'उच्च रक्तचाप' },
    { id: 'pm-2', label: 'Type 2 Diabetes', sublabel: 'मधुमेह / शुगर' },
    { id: 'pm-3', label: 'Asthma / COPD', sublabel: 'दमा या सांस की बीमारी' },
    { id: 'pm-4', label: 'Heart Disease / Prior Stent', sublabel: 'हृदय रोग' },
    { id: 'pm-5', label: 'Thyroid Disorder', sublabel: 'थायराइड' },
    { id: 'pm-6', label: 'No Prior Chronic Illnesses', sublabel: 'कोई पुरानी बीमारी नहीं' }
  ];

  // STEP 6: Drug Allergies
  const allergyOptions: QuestionOption[] = [
    { id: 'al-1', label: 'Penicillin / Amoxicillin', sublabel: 'एंटीबायोटिक एलर्जी' },
    { id: 'al-2', label: 'Sulfa Drugs', sublabel: 'सल्फा दवाएं' },
    { id: 'al-3', label: 'Painkillers (NSAIDs / Ibuprofen)', sublabel: 'दर्द निवारक दवाएं' },
    { id: 'al-4', label: 'Dust / Pollen / Food Allergy', sublabel: 'धूल या खानपान से एलर्जी' },
    { id: 'al-5', label: 'No Known Drug Allergies (NKDA)', sublabel: 'दवाओं से कोई एलर्जी नहीं' }
  ];

  // STEP 7: Review of Systems (Associated symptoms)
  const rosOptions: QuestionOption[] = [
    { id: 'ros-1', label: 'Cold Sweating (Diaphoresis)', sublabel: 'ठंडा पसीना आना', isRedFlagWarning: true },
    { id: 'ros-2', label: 'Palpitations (Fast heartbeat)', sublabel: 'दिल की तेज़ धड़कन' },
    { id: 'ros-3', label: 'Nausea or Vomiting', sublabel: 'उल्टी या जी मिचलाना' },
    { id: 'ros-4', label: 'Dizziness or Near-Fainting', sublabel: 'चक्कर आना' },
    { id: 'ros-5', label: 'High Grade Fever', sublabel: 'तेज़ बुखार' },
    { id: 'ros-6', label: 'Productive Cough with Phlegm', sublabel: 'बलगम वाली खांसी' }
  ];

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/kiosk/summary');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/kiosk/documents');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none">
      
      {/* Top Banner: Mode Controls & Demo Quick-Fill */}
      <div className="max-w-4xl mx-auto w-full mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* AYUSH Mode Toggle */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => updateQuestionnaire({ ayushMode: !questionnaire.ayushMode })}
            className={`kiosk-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
              questionnaire.ayushMode
                ? 'bg-gradient-to-r from-ayush-600 to-amber-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span>{t.ayushMode}: {questionnaire.ayushMode ? 'ENABLED (दशविध परीक्षा ON)' : 'OFF'}</span>
          </button>
        </div>

        {/* Red Flag Simulation / Emergency Demo Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSampleSession}
            title="Simulate Critical Chest Pain Red-Flag Triage"
            className="kiosk-btn px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Test Red-Flag Triage Trigger</span>
          </button>

          <span className="text-xs font-bold text-slate-500 hidden md:inline">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

      </div>

      {/* Dynamic Question Render according to active step */}
      <div className="flex-1 max-w-4xl mx-auto w-full my-auto">
        
        {/* STEP 1: Chief Complaint */}
        {currentStep === 1 && (
          <SocratesQuestion
            questionNumber={1}
            totalQuestions={totalSteps}
            title="What is your main health concern today?"
            description="आज आपको मुख्य रूप से क्या तकलीफ़ हो रही है? नीचे छुएं, बोलकर बताएं या लिखें।"
            audioPromptText="कृपया बताएं कि आपको आज क्या परेशानी हो रही है। दिए गए विकल्पों को छुएं या माइक दबाकर बोलें।"
            options={chiefComplaintOptions}
            selectedValues={questionnaire.chiefComplaint ? [questionnaire.chiefComplaint] : []}
            onSelect={(vals) => updateQuestionnaire({ chiefComplaint: vals[0] || '' })}
            customText={questionnaire.chiefComplaint}
            onCustomTextChange={(txt) => updateQuestionnaire({ chiefComplaint: txt })}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            canProceed={Boolean(questionnaire.chiefComplaint.trim())}
            inputPlaceholder="Type or speak custom complaint..."
          />
        )}

        {/* STEP 2: Duration / Onset */}
        {currentStep === 2 && (
          <SocratesQuestion
            questionNumber={2}
            totalQuestions={totalSteps}
            title="When did these symptoms begin?"
            description="यह तकलीफ़ कब से शुरू हुई है? (Onset & Duration)"
            audioPromptText="यह समस्या कब से है? कृपया समय अवधि का चयन करें।"
            options={durationOptions}
            selectedValues={questionnaire.duration ? [questionnaire.duration] : []}
            onSelect={(vals) => updateQuestionnaire({ duration: vals[0] || '' })}
            customText={questionnaire.duration}
            onCustomTextChange={(txt) => updateQuestionnaire({ duration: txt })}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            canProceed={Boolean(questionnaire.duration.trim())}
            inputPlaceholder="e.g. 2 days ago after heavy work..."
          />
        )}

        {/* STEP 3: Character & Severity Scale (1-10) */}
        {currentStep === 3 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-kiosk">
                  How does the pain/discomfort feel, and how intense is it?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  दर्द का प्रकार और तीव्रता का स्तर (Visual Severity Scale 1-10)
                </p>
              </div>
              <AudioButton
                textToSpeak="कृपया दर्द की तीव्रता 1 से 10 के बीच चुनें और बताएं कि दर्द कैसा महसूस हो रहा है।"
                label="Listen"
              />
            </div>

            {/* Pain / Severity 1-10 Touch Slider */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Pain / Discomfort Intensity (दर्द का स्तर)
                </span>
                <span className={`text-xl font-black px-3 py-1 rounded-xl ${
                  questionnaire.severity >= 8
                    ? 'bg-rose-600 text-white animate-pulse'
                    : questionnaire.severity >= 5
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {questionnaire.severity} / 10 {questionnaire.severity >= 8 ? '(Severe)' : questionnaire.severity >= 5 ? '(Moderate)' : '(Mild)'}
                </span>
              </div>

              {/* Visual Number Chips (1 to 10) */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => updateQuestionnaire({ severity: num })}
                    className={`kiosk-btn h-14 rounded-2xl font-black text-lg flex items-center justify-center transition-all ${
                      questionnaire.severity === num
                        ? num >= 8
                          ? 'bg-rose-600 text-white ring-4 ring-rose-400/30 shadow-lg'
                          : num >= 5
                          ? 'bg-amber-500 text-white ring-4 ring-amber-400/30 shadow-lg'
                          : 'bg-primary-600 text-white ring-4 ring-primary-400/30 shadow-lg'
                        : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Character selection chips */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                Nature of Pain
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {characterOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateQuestionnaire({ character: opt.label })}
                    className={`kiosk-btn p-4 rounded-2xl border-2 text-left transition-all ${
                      questionnaire.character === opt.label
                        ? 'border-primary-600 bg-primary-50 text-primary-950 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className="text-base font-bold block">{opt.label}</span>
                    <span className="text-xs text-slate-500">{opt.sublabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Next / Back */}
            <div className="pt-4 flex justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrevStep}
                className="kiosk-btn px-6 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold"
              >
                {t.previous}
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="kiosk-btn px-8 py-3 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold"
              >
                {t.next}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Radiation & Triggers */}
        {currentStep === 4 && (
          <SocratesQuestion
            questionNumber={4}
            totalQuestions={totalSteps}
            title="Does the pain spread to other areas?"
            description="क्या यह दर्द शरीर के अन्य हिस्सों (जैसे बाएं हाथ, गर्दन, पीठ) में फैलता है?"
            audioPromptText="क्या यह दर्द बाएं हाथ या गर्दन की तरफ फैलता है? कृपया बताएं।"
            options={radiationOptions}
            selectedValues={questionnaire.radiation ? [questionnaire.radiation] : []}
            onSelect={(vals) => updateQuestionnaire({ radiation: vals[0] || '' })}
            customText={questionnaire.radiation}
            onCustomTextChange={(txt) => updateQuestionnaire({ radiation: txt })}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            canProceed={true}
            inputPlaceholder="e.g. Spreads to left jaw and shoulder..."
          />
        )}

        {/* STEP 5: Past Medical & Surgical */}
        {currentStep === 5 && (
          <SocratesQuestion
            questionNumber={5}
            totalQuestions={totalSteps}
            title="Do you have any existing chronic medical conditions?"
            description="क्या आपको पहले से कोई बीमारी है जैसे बीपी, शुगर, थायराइड या पूर्व सर्जरी?"
            audioPromptText="क्या आपको हाई बीपी, शुगर या कोई अन्य पुरानी बीमारी है? दिए गए विकल्पों को चुनें।"
            options={pastMedicalOptions}
            isMultiSelect={true}
            selectedValues={questionnaire.pastMedicalConditions}
            onSelect={(vals) => updateQuestionnaire({ pastMedicalConditions: vals })}
            customText={questionnaire.pastMedicalConditions.join(', ')}
            onCustomTextChange={(txt) =>
              updateQuestionnaire({ pastMedicalConditions: txt.split(',').map((s) => s.trim()).filter(Boolean) })
            }
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            canProceed={true}
            inputPlaceholder="Type any other known medical illness..."
          />
        )}

        {/* STEP 6: Drug Allergies */}
        {currentStep === 6 && (
          <SocratesQuestion
            questionNumber={6}
            totalQuestions={totalSteps}
            title="Do you have allergies to any medicines or food?"
            description="क्या आपको किसी दवा या भोजन से एलर्जी है? (Drug & Food Allergies)"
            audioPromptText="क्या आपको किसी दवा से कोई एलर्जी होती है? कृपया बताएं।"
            options={allergyOptions}
            isMultiSelect={true}
            selectedValues={questionnaire.drugAllergies}
            onSelect={(vals) => updateQuestionnaire({ drugAllergies: vals })}
            customText={questionnaire.drugAllergies.join(', ')}
            onCustomTextChange={(txt) =>
              updateQuestionnaire({ drugAllergies: txt.split(',').map((s) => s.trim()).filter(Boolean) })
            }
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            canProceed={true}
            inputPlaceholder="e.g. Skin rash with Sulfa drugs..."
          />
        )}

        {/* STEP 7: Review of Systems / Associated Symptoms */}
        {currentStep === 7 && !questionnaire.ayushMode && (
          <SocratesQuestion
            questionNumber={7}
            totalQuestions={totalSteps}
            title="Are you having any of these other symptoms?"
            description="साथ में अन्य लक्षण जैसे पसीना आना, चक्कर, धड़कन तेज़ होना (Review of Systems)"
            audioPromptText="क्या आपको चक्कर, ठंडा पसीना या उल्टी जैसा महसूस हो रहा है?"
            options={rosOptions}
            isMultiSelect={true}
            selectedValues={questionnaire.reviewOfSystems}
            onSelect={(vals) => updateQuestionnaire({ reviewOfSystems: vals })}
            customText={questionnaire.reviewOfSystems.join(', ')}
            onCustomTextChange={(txt) =>
              updateQuestionnaire({ reviewOfSystems: txt.split(',').map((s) => s.trim()).filter(Boolean) })
            }
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            canProceed={true}
            inputPlaceholder="Any other symptoms not mentioned..."
          />
        )}

        {/* STEP 8: AYUSH Dashavidha Pariksha Module (when AYUSH Mode enabled) */}
        {questionnaire.ayushMode && currentStep === 7 && (
          <SocratesQuestion
            questionNumber={7}
            totalQuestions={totalSteps}
            title="Are you having any of these other symptoms?"
            description="साथ में अन्य लक्षण जैसे पसीना आना, चक्कर, धड़कन तेज़ होना (Review of Systems)"
            audioPromptText="क्या आपको चक्कर, ठंडा पसीना या उल्टी जैसा महसूस हो रहा है?"
            options={rosOptions}
            isMultiSelect={true}
            selectedValues={questionnaire.reviewOfSystems}
            onSelect={(vals) => updateQuestionnaire({ reviewOfSystems: vals })}
            customText={questionnaire.reviewOfSystems.join(', ')}
            onCustomTextChange={(txt) =>
              updateQuestionnaire({ reviewOfSystems: txt.split(',').map((s) => s.trim()).filter(Boolean) })
            }
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            canProceed={true}
          />
        )}

        {questionnaire.ayushMode && currentStep === 8 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <AyushSection
              assessment={questionnaire.ayushAssessment!}
              onChange={(updated) => updateQuestionnaire({ ayushAssessment: updated })}
            />
            <div className="pt-4 flex justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrevStep}
                className="kiosk-btn px-6 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold"
              >
                {t.previous}
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="kiosk-btn px-8 py-3 rounded-2xl bg-ayush-600 hover:bg-ayush-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-ayush-600/30"
              >
                <span>Complete AYUSH Case-Taking</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Real-Time Critical Red-Flag Alert Modal */}
      <RedAlertModal
        isOpen={isEmergencyAlert}
        onDismiss={dismissEmergencyModal}
        triggers={emergencyTriggers}
      />

    </div>
  );
};
