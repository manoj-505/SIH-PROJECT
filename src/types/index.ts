export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'gu';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  subtext: string;
  sampleAudioText: string;
}

export interface PatientUser {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  abhaId?: string;
  aadhaarId?: string;
  registeredAt: string;
}

export interface DoctorUser {
  id: string;
  username: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  experienceYears: number;
  qualification: string;
  regNumber: string;
  department: string;
  roomNo: string;
  certificateUrl?: string;
  isVerified: boolean;
}

export interface LabValue {
  test: string;
  value: string;
  unit: string;
  isAbnormal: boolean;
  referenceRange: string;
  flag?: 'HIGH' | 'LOW' | 'CRITICAL';
}

export interface ScannedDocument {
  id: string;
  title: string;
  type: 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Doctor Certificate';
  date: string;
  fileUrl: string;
  previewUrl: string;
  ocrStatus: 'idle' | 'processing' | 'completed' | 'failed';
  extractedData?: {
    diagnoses: string[];
    medications: string[];
    investigationHighlights: LabValue[];
    doctorName?: string;
    hospitalName?: string;
  };
}

export interface ConsentPreferences {
  dataCapture: boolean;       // Mandatory
  documentProcessing: boolean;// Mandatory
  hisSharing: boolean;        // Mandatory
  abhaLinking: boolean;       // Optional
  timestamp: string;
}

export interface AyushAssessment {
  prakritiDominant: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Tridoshic';
  vikriti: string;
  sara: 'Pravara' | 'Madhyama' | 'Avara';
  samhanana: 'Susamhata' | 'Madhyama' | 'Hina';
  pramana: string;
  satmya: string;
  sattva: 'Pravara (High mental strength)' | 'Madhyama (Moderate)' | 'Avara (Weak)';
  aharaShakti: 'Uttama (Strong digestion)' | 'Madhyama' | 'Manda (Weak digestion)';
  vyayamaShakti: 'Uttama' | 'Madhyama' | 'Heena';
  vaya: 'Balya' | 'Madhyama' | 'Vriddha';
  aharaHabits: string[];
  viharaHabits: string[];
}

export interface QuestionnaireState {
  chiefComplaint: string;
  onset: string;
  duration: string;
  severity: number; // 1-10
  character: string;
  radiation: string;
  aggravatingFactors: string[];
  relievingFactors: string[];
  pastMedicalConditions: string[];
  pastSurgeries: string[];
  drugAllergies: string[];
  currentMedications: string[];
  familyHistory: string[];
  lifestyle: {
    diet: string;
    smoking: string;
    alcohol: string;
    sleep: string;
  };
  reviewOfSystems: string[];
  ayushMode: boolean;
  ayushAssessment?: AyushAssessment;
  isEmergencyAlert: boolean;
  emergencyTriggers: string[];
  additionalNotes: string;
}

export interface ClinicalSummary {
  id: string;
  tokenNo: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  mobile: string;
  abhaId?: string;
  timestamp: string;
  priority: 'normal' | 'urgent' | 'emergency';
  emergencyNotice?: string;
  chiefComplaint: string;
  hpiClinicalSummary: string;
  pastMedicalSummary: string;
  drugAllergySummary: string;
  familyPersonalSummary: string;
  rosSummary: string;
  ayushSummary?: string;
  investigationSummary: {
    totalDocuments: number;
    abnormalValues: LabValue[];
    recentDiagnoses: string[];
    detectedMeds: string[];
  };
  patientFriendlySummary: {
    language: SupportedLanguage;
    summaryText: string;
    keyTakeaway: string;
  };
  doctorNotes?: string;
  doctorApproved: boolean;
}

export interface TokenQueueItem {
  tokenNo: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  priority: 'normal' | 'urgent' | 'emergency';
  status: 'waiting' | 'calling' | 'in_consultation' | 'completed';
  roomNo: string;
  doctorName: string;
  queuePosition: number;
  estimatedWaitMins: number;
  createdAt: string;
  summaryId: string;
}
