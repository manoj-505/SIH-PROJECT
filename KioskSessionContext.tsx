import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  QuestionnaireState,
  ScannedDocument,
  ConsentPreferences,
  ClinicalSummary,
  TokenQueueItem,
  SupportedLanguage
} from '../types';
import { clinicalAiService } from '../services/clinicalAiService';
import { storageService } from '../services/storageService';
import { ocrService } from '../services/ocrService';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

interface KioskSessionContextType {
  documents: ScannedDocument[];
  addDocument: (doc: ScannedDocument) => void;
  removeDocument: (docId: string) => void;
  consent: ConsentPreferences;
  setConsent: React.Dispatch<React.SetStateAction<ConsentPreferences>>;
  isConsentValid: boolean;
  questionnaire: QuestionnaireState;
  updateQuestionnaire: (updates: Partial<QuestionnaireState>) => void;
  isEmergencyAlert: boolean;
  emergencyTriggers: string[];
  dismissEmergencyModal: () => void;
  summary: ClinicalSummary | null;
  generateSummary: (tokenNo: string) => ClinicalSummary;
  activeToken: TokenQueueItem | null;
  submitAndGenerateToken: () => TokenQueueItem;
  resetSession: () => void;
  loadSampleSession: () => void;
}

const DEFAULT_QUESTIONNAIRE: QuestionnaireState = {
  chiefComplaint: '',
  onset: 'Gradual (2-3 days ago)',
  duration: '3 days',
  severity: 5,
  character: 'Dull aching pain',
  radiation: 'None',
  aggravatingFactors: [],
  relievingFactors: [],
  pastMedicalConditions: [],
  pastSurgeries: [],
  drugAllergies: [],
  currentMedications: [],
  familyHistory: [],
  lifestyle: {
    diet: 'Vegetarian',
    smoking: 'Non-smoker',
    alcohol: 'Non-drinker',
    sleep: '6-7 hours nightly'
  },
  reviewOfSystems: [],
  ayushMode: false,
  ayushAssessment: {
    prakritiDominant: 'Pitta-Kapha',
    vikriti: 'Pitta Vriddhi (Digestive fire imbalance)',
    sara: 'Madhyama',
    samhanana: 'Susamhata',
    pramana: 'Madhyama',
    satmya: 'Oka-satmya (Mixed)',
    sattva: 'Madhyama (Moderate)',
    aharaShakti: 'Uttama (Strong digestion)',
    vyayamaShakti: 'Madhyama',
    vaya: 'Madhyama',
    aharaHabits: ['Warm cooked meals', 'Occasional spicy food'],
    viharaHabits: ['Irregular sleep schedule', 'Sedentary desk work']
  },
  isEmergencyAlert: false,
  emergencyTriggers: [],
  additionalNotes: ''
};

const DEFAULT_CONSENT: ConsentPreferences = {
  dataCapture: true,
  documentProcessing: true,
  hisSharing: true,
  abhaLinking: false,
  timestamp: new Date().toISOString()
};

const KioskSessionContext = createContext<KioskSessionContextType | undefined>(undefined);

export const KioskSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { patient } = useAuth();
  const { language } = useLanguage();

  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [consent, setConsent] = useState<ConsentPreferences>(DEFAULT_CONSENT);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireState>(DEFAULT_QUESTIONNAIRE);
  const [isEmergencyAlert, setIsEmergencyAlert] = useState<boolean>(false);
  const [emergencyTriggers, setEmergencyTriggers] = useState<string[]>([]);
  const [summary, setSummary] = useState<ClinicalSummary | null>(null);
  const [activeToken, setActiveToken] = useState<TokenQueueItem | null>(null);

  // Initialize with sample pre-loaded records if none exist
  useEffect(() => {
    const savedDocs = storageService.getPatientDocuments();
    if (savedDocs && savedDocs.length > 0) {
      setDocuments(savedDocs);
    } else {
      const samples = ocrService.getSampleDocuments();
      setDocuments(samples);
      storageService.savePatientDocuments(samples);
    }
  }, []);

  const addDocument = (doc: ScannedDocument) => {
    setDocuments((prev) => {
      const updated = [doc, ...prev];
      storageService.savePatientDocuments(updated);
      return updated;
    });
  };

  const removeDocument = (docId: string) => {
    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== docId);
      storageService.savePatientDocuments(updated);
      return updated;
    });
  };

  const isConsentValid = consent.dataCapture && consent.documentProcessing && consent.hisSharing;

  const updateQuestionnaire = (updates: Partial<QuestionnaireState>) => {
    setQuestionnaire((prev) => {
      const nextState = { ...prev, ...updates };

      // Continuously evaluate for emergency / red flags
      const evaluation = clinicalAiService.evaluateRedFlags(nextState);
      if (evaluation.isEmergency && !isEmergencyAlert) {
        setIsEmergencyAlert(true);
        setEmergencyTriggers(evaluation.triggers);
        nextState.isEmergencyAlert = true;
        nextState.emergencyTriggers = evaluation.triggers;
      }

      return nextState;
    });
  };

  const dismissEmergencyModal = () => {
    setIsEmergencyAlert(false);
  };

  const generateSummary = (tokenNo: string): ClinicalSummary => {
    const p = patient || {
      id: 'patient-demo-01',
      name: 'Aarav Sharma',
      age: 38,
      gender: 'Male',
      mobile: '9876543210',
      registeredAt: new Date().toISOString()
    };

    const newSummary = clinicalAiService.generateClinicalSummary(
      questionnaire,
      documents,
      p,
      language,
      tokenNo
    );

    setSummary(newSummary);
    storageService.saveSummary(newSummary);
    return newSummary;
  };

  const submitAndGenerateToken = (): TokenQueueItem => {
    const queue = storageService.getQueue();
    const tokenIndex = queue.length + 101;
    const tokenNo = `TK-A${tokenIndex}`;

    // Generate clinical summary
    const newSummary = generateSummary(tokenNo);

    const tokenItem: TokenQueueItem = {
      tokenNo,
      patientId: patient?.id || 'p-new',
      patientName: patient?.name || 'Walk-in Patient',
      age: patient?.age || 35,
      gender: patient?.gender || 'Male',
      chiefComplaint: questionnaire.chiefComplaint || 'Consultation Request',
      priority: newSummary.priority,
      status: 'waiting',
      roomNo: 'OPD Room 104',
      doctorName: 'Dr. Anand Verma, MD',
      queuePosition: queue.length + 1,
      estimatedWaitMins: (queue.length + 1) * 8,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      summaryId: newSummary.id
    };

    setActiveToken(tokenItem);
    storageService.addTokenToQueue(tokenItem);
    return tokenItem;
  };

  const resetSession = () => {
    setQuestionnaire(DEFAULT_QUESTIONNAIRE);
    setConsent(DEFAULT_CONSENT);
    setIsEmergencyAlert(false);
    setEmergencyTriggers([]);
    setSummary(null);
    setActiveToken(null);
    storageService.clearKioskSession();
  };

  const loadSampleSession = () => {
    setQuestionnaire({
      chiefComplaint: 'Chest Pain and Shortness of Breath',
      onset: 'Sudden onset 4 hours ago',
      duration: '4 hours',
      severity: 8,
      character: 'Severe tightness and pressure',
      radiation: 'Left shoulder and jaw',
      aggravatingFactors: ['Walking', 'Deep inspiration'],
      relievingFactors: ['Resting sitting up'],
      pastMedicalConditions: ['Hypertension', 'Type 2 Diabetes'],
      pastSurgeries: ['Appendectomy (2018)'],
      drugAllergies: ['Penicillin (Skin rash)'],
      currentMedications: ['Metformin 500mg', 'Telmisartan 40mg'],
      familyHistory: ['Father had Heart Attack at 54'],
      lifestyle: {
        diet: 'Vegetarian',
        smoking: 'Smoker (5-10 cigarettes/day)',
        alcohol: 'Occasional',
        sleep: 'Disturbed'
      },
      reviewOfSystems: ['Palpitations', 'Profuse cold sweating', 'Mild nausea'],
      ayushMode: false,
      isEmergencyAlert: true,
      emergencyTriggers: ['Suspected Acute Coronary Syndrome'],
      additionalNotes: 'Patient was working in field when retrosternal pressure began.'
    });
    setIsEmergencyAlert(true);
    setEmergencyTriggers(['Suspected Acute Coronary Syndrome (Severe Chest Pain radiating to jaw)']);
  };

  return (
    <KioskSessionContext.Provider
      value={{
        documents,
        addDocument,
        removeDocument,
        consent,
        setConsent,
        isConsentValid,
        questionnaire,
        updateQuestionnaire,
        isEmergencyAlert,
        emergencyTriggers,
        dismissEmergencyModal,
        summary,
        generateSummary,
        activeToken,
        submitAndGenerateToken,
        resetSession,
        loadSampleSession
      }}
    >
      {children}
    </KioskSessionContext.Provider>
  );
};

export const useKioskSession = (): KioskSessionContextType => {
  const ctx = useContext(KioskSessionContext);
  if (!ctx) {
    throw new Error('useKioskSession must be used within a KioskSessionProvider');
  }
  return ctx;
};
