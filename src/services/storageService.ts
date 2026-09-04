import {
  PatientUser,
  DoctorUser,
  TokenQueueItem,
  ClinicalSummary,
  ScannedDocument
} from '../types';

const STORAGE_KEYS = {
  CURRENT_PATIENT: 'medikiosk_current_patient',
  CURRENT_DOCTOR: 'medikiosk_current_doctor',
  OPD_QUEUE: 'medikiosk_opd_queue',
  SUMMARIES: 'medikiosk_summaries',
  DOCUMENTS: 'medikiosk_documents',
  ACTIVE_TOKEN: 'medikiosk_active_token',
};

// Initial realistic demo queue pre-loaded for hospital OPD
const INITIAL_QUEUE: TokenQueueItem[] = [
  {
    tokenNo: 'TK-A101',
    patientId: 'p-101',
    patientName: 'Rameshwar Patil',
    age: 58,
    gender: 'Male',
    chiefComplaint: 'Acute Crushing Chest Pain with Diaphoresis',
    priority: 'emergency',
    status: 'waiting',
    roomNo: 'OPD Room 104',
    doctorName: 'Dr. Anand Verma, MD (Med)',
    queuePosition: 1,
    estimatedWaitMins: 2,
    createdAt: '09:15 AM',
    summaryId: 'sum-101'
  },
  {
    tokenNo: 'TK-A102',
    patientId: 'p-102',
    patientName: 'Sunita Devi Sharma',
    age: 44,
    gender: 'Female',
    chiefComplaint: 'Uncontrolled Fasting Blood Sugars (FBS 172) & Dizziness',
    priority: 'urgent',
    status: 'waiting',
    roomNo: 'OPD Room 104',
    doctorName: 'Dr. Anand Verma, MD (Med)',
    queuePosition: 2,
    estimatedWaitMins: 10,
    createdAt: '09:25 AM',
    summaryId: 'sum-102'
  },
  {
    tokenNo: 'TK-A103',
    patientId: 'p-103',
    patientName: 'Vikramjit Singh',
    age: 36,
    gender: 'Male',
    chiefComplaint: 'Persistent Productive Cough and Fever for 4 days',
    priority: 'normal',
    status: 'waiting',
    roomNo: 'OPD Room 104',
    doctorName: 'Dr. Anand Verma, MD (Med)',
    queuePosition: 3,
    estimatedWaitMins: 20,
    createdAt: '09:35 AM',
    summaryId: 'sum-103'
  }
];

const INITIAL_SUMMARIES: Record<string, ClinicalSummary> = {
  'sum-101': {
    id: 'sum-101',
    tokenNo: 'TK-A101',
    patientId: 'p-101',
    patientName: 'Rameshwar Patil',
    age: 58,
    gender: 'Male',
    mobile: '+91 98201 44512',
    abhaId: '91-4451-2091-8842',
    timestamp: '09:15 AM',
    priority: 'emergency',
    emergencyNotice: 'Suspected Acute Coronary Syndrome (Severe substernal chest pressure radiating to left shoulder and jaw)',
    chiefComplaint: 'Severe retrosternal chest pain x 2 hours with cold sweat',
    hpiClinicalSummary: '58-year-old male with sudden onset retrosternal crushing pain beginning at 07:00 AM while climbing stairs. Severity rated 9/10. Radiation to left shoulder and lower jaw. Accompanied by nausea and profuse cold sweating. No relief with rest.',
    pastMedicalSummary: 'Known case of Hypertension x 6 years (irregular compliance with Amlodipine). Smoker (15 pack-years).',
    drugAllergySummary: 'NKDA. Currently on Tab Amlodipine 5mg OD.',
    familyPersonalSummary: 'Father died of myocardial infarction at age 52. Non-vegetarian diet.',
    rosSummary: 'Positive for diaphoresis, dyspnea on minimal exertion. Negative for syncope.',
    investigationSummary: {
      totalDocuments: 1,
      abnormalValues: [
        { test: 'Blood Pressure', value: '168/104', unit: 'mmHg', isAbnormal: true, referenceRange: '< 120/80', flag: 'CRITICAL' }
      ],
      recentDiagnoses: ['Essential Hypertension'],
      detectedMeds: ['Tab Amlodipine 5mg']
    },
    patientFriendlySummary: {
      language: 'en',
      summaryText: 'Patient reported severe chest tightness radiating to the left arm and jaw with sweating. Immediate triage requested.',
      keyTakeaway: 'EMERGENCY: Transferred to Priority Consultation immediately.'
    },
    doctorApproved: false
  }
};

class StorageService {
  // Current logged in patient
  public getPatient(): PatientUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_PATIENT);
    if (!raw) {
      // Default sample patient
      const defaultPatient: PatientUser = {
        id: 'patient-demo-01',
        name: 'Aarav Sharma',
        age: 38,
        gender: 'Male',
        mobile: '9876543210',
        abhaId: '91-7890-1234-5678@abdm',
        aadhaarId: 'XXXX-XXXX-8921',
        registeredAt: new Date().toISOString()
      };
      this.savePatient(defaultPatient);
      return defaultPatient;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public savePatient(patient: PatientUser): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PATIENT, JSON.stringify(patient));
  }

  // Current logged in doctor
  public getDoctor(): DoctorUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_DOCTOR);
    if (!raw) {
      const defaultDoctor: DoctorUser = {
        id: 'doc-001',
        username: 'dr.verma',
        name: 'Dr. Anand Verma',
        age: 46,
        gender: 'Male',
        mobile: '+91 99887 76655',
        experienceYears: 18,
        qualification: 'MBBS, MD (General Medicine)',
        regNumber: 'MCI-2008-44910',
        department: 'General Medicine & OPD',
        roomNo: 'Room 104',
        isVerified: true
      };
      this.saveDoctor(defaultDoctor);
      return defaultDoctor;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public saveDoctor(doctor: DoctorUser): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_DOCTOR, JSON.stringify(doctor));
  }

  // OPD Waiting Queue
  public getQueue(): TokenQueueItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OPD_QUEUE);
    if (!raw) {
      this.saveQueue(INITIAL_QUEUE);
      return INITIAL_QUEUE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_QUEUE;
    }
  }

  public saveQueue(queue: TokenQueueItem[]): void {
    localStorage.setItem(STORAGE_KEYS.OPD_QUEUE, JSON.stringify(queue));
  }

  public addTokenToQueue(item: TokenQueueItem): void {
    const current = this.getQueue();
    // Prepend emergency to front, otherwise append
    if (item.priority === 'emergency') {
      current.unshift(item);
    } else {
      current.push(item);
    }
    // Re-index positions
    current.forEach((q, idx) => {
      q.queuePosition = idx + 1;
    });
    this.saveQueue(current);
  }

  public updateTokenStatus(tokenNo: string, status: TokenQueueItem['status']): void {
    const current = this.getQueue();
    const target = current.find(t => t.tokenNo === tokenNo);
    if (target) {
      target.status = status;
      this.saveQueue(current);
    }
  }

  // Summaries
  public getSummary(summaryId: string): ClinicalSummary | null {
    const raw = localStorage.getItem(STORAGE_KEYS.SUMMARIES);
    let dict: Record<string, ClinicalSummary> = INITIAL_SUMMARIES;
    if (raw) {
      try {
        dict = { ...INITIAL_SUMMARIES, ...JSON.parse(raw) };
      } catch {
        dict = INITIAL_SUMMARIES;
      }
    }
    return dict[summaryId] || null;
  }

  public saveSummary(summary: ClinicalSummary): void {
    const raw = localStorage.getItem(STORAGE_KEYS.SUMMARIES);
    let dict: Record<string, ClinicalSummary> = { ...INITIAL_SUMMARIES };
    if (raw) {
      try {
        dict = { ...dict, ...JSON.parse(raw) };
      } catch (err) {
        console.error(err);
      }
    }
    dict[summary.id] = summary;
    localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(dict));
  }

  // Active Token being viewed in Doctor OPD
  public getActiveToken(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TOKEN) || 'TK-A101';
  }

  public setActiveToken(tokenNo: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TOKEN, tokenNo);
  }

  // Documents
  public getPatientDocuments(): ScannedDocument[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public savePatientDocuments(docs: ScannedDocument[]): void {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  }

  public clearKioskSession(): void {
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    // Do not clear the doctor queue or credentials
  }
}

export const storageService = new StorageService();
