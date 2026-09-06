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

const API_BASE = "http://localhost:5000/api";

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
  checkEmergencyStatus: () => boolean;
  dismissEmergencyModal: () => void;
  summary: ClinicalSummary | null;
  generateSummary: (tokenNo: string) => Promise<ClinicalSummary>;
  generatePreviewSummary: (tokenNo: string) => ClinicalSummary;
  activeToken: TokenQueueItem | null;
  submitAndGenerateToken: () => Promise<TokenQueueItem>;
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
  setQuestionnaire((prev) => ({ ...prev, ...updates }));
};

// Call this only once ALL questions have been answered (e.g. on the final review/confirm step)
const checkEmergencyStatus = (): boolean => {
  const evaluation = clinicalAiService.evaluateRedFlags(questionnaire);
  if (evaluation.isEmergency) {
    setIsEmergencyAlert(true);
    setEmergencyTriggers(evaluation.triggers);
    setQuestionnaire((prev) => ({
      ...prev,
      isEmergencyAlert: true,
      emergencyTriggers: evaluation.triggers
    }));
  }
  return evaluation.isEmergency;
};
  const dismissEmergencyModal = () => {
    setIsEmergencyAlert(false);
  };

  // Local-only preview — does NOT save to backend. Safe to call repeatedly
  // (e.g. on page load, or after the user edits and re-checks their summary).
  const generatePreviewSummary = (tokenNo: string): ClinicalSummary => {
    const p = patient || {
      id: 'patient-demo-01',
      name: 'Aarav Sharma',
      age: 38,
      gender: 'Male',
      mobile: '9876543210',
      registeredAt: new Date().toISOString()
    };

    return clinicalAiService.generateClinicalSummary(
      questionnaire,
      documents,
      p,
      language,
      tokenNo
    );
  };

  // Real save — persists to the backend. Only call this once, at final submission.
  const generateSummary = async (tokenNo: string): Promise<ClinicalSummary> => {
    const draftSummary = generatePreviewSummary(tokenNo);

    const response = await fetch(`${API_BASE}/summaries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenNo: draftSummary.tokenNo,
        patientId: draftSummary.patientId,
        patientName: draftSummary.patientName,
        age: draftSummary.age,
        gender: draftSummary.gender,
        mobile: draftSummary.mobile,
        abhaId: draftSummary.abhaId,
        priority: draftSummary.priority,
        emergencyNotice: draftSummary.emergencyNotice,
        chiefComplaint: draftSummary.chiefComplaint,
        hpiClinicalSummary: draftSummary.hpiClinicalSummary,
        pastMedicalSummary: draftSummary.pastMedicalSummary,
        drugAllergySummary: draftSummary.drugAllergySummary,
        familyPersonalSummary: draftSummary.familyPersonalSummary,
        rosSummary: draftSummary.rosSummary,
        ayushSummary: draftSummary.ayushSummary,
        investigationSummary: draftSummary.investigationSummary,
        patientFriendlySummary: draftSummary.patientFriendlySummary
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to save summary");
    }

    const savedSummary: ClinicalSummary = data.summary;
    setSummary(savedSummary);
    storageService.saveSummary(savedSummary);
    return savedSummary;
  };

  const submitAndGenerateToken = async (): Promise<TokenQueueItem> => {
    const queueResponse = await fetch(`${API_BASE}/queue`);
    const currentQueue: TokenQueueItem[] = queueResponse.ok ? await queueResponse.json() : [];
    const tokenIndex = currentQueue.length + 101;
    const tokenNo = `TK-A${tokenIndex}`;

    const newSummary = await generateSummary(tokenNo);

    const response = await fetch(`${API_BASE}/queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenNo,
        patientId: patient?.id || 'p-new',
        patientName: patient?.name || 'Walk-in Patient',
        age: patient?.age || 35,
        gender: patient?.gender || 'Male',
        chiefComplaint: questionnaire.chiefComplaint || 'Consultation Request',
        priority: newSummary.priority,
        roomNo: 'OPD Room 104',
        doctorName: 'Dr. Anand Verma, MD',
        estimatedWaitMins: (currentQueue.length + 1) * 8,
        summaryId: newSummary.id
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to add token to queue");
    }

    const tokenItem: TokenQueueItem = data.token;
    setActiveToken(tokenItem);
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
        checkEmergencyStatus,
        dismissEmergencyModal,
        summary,
        generateSummary,
        generatePreviewSummary,
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