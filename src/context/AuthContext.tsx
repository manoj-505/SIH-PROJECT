import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PatientUser, DoctorUser } from '../types';
import { storageService } from '../services/storageService';

const API_BASE = "http://localhost:5000/api";

interface AuthContextType {
  patient: PatientUser | null;
  doctor: DoctorUser | null;
  activeRole: 'patient' | 'doctor' | null;
  loginPatientWithId: (idType: 'abha' | 'aadhaar', idValue: string) => boolean;
  registerPatient: (name: string, age: number, gender: PatientUser['gender'], mobile: string) => Promise<PatientUser>;
  loginDoctor: (username: string) => boolean;
  registerDoctor: (doctorData: Omit<DoctorUser, 'id' | 'isVerified'>) => Promise<DoctorUser>;
  logout: () => void;
  switchRole: (role: 'patient' | 'doctor' | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patient, setPatient] = useState<PatientUser | null>(null);
  const [doctor, setDoctor] = useState<DoctorUser | null>(null);
  const [activeRole, setActiveRole] = useState<'patient' | 'doctor' | null>(null);

  useEffect(() => {
    const savedPatient = storageService.getPatient();
    const savedDoctor = storageService.getDoctor();
    setPatient(savedPatient);
    setDoctor(savedDoctor);

    const savedRole = localStorage.getItem('medikiosk_active_role') as 'patient' | 'doctor' | null;
    if (savedRole) {
      setActiveRole(savedRole);
    }
  }, []);

  const loginPatientWithId = (idType: 'abha' | 'aadhaar', idValue: string): boolean => {
    const p: PatientUser = {
      id: `p-${Date.now()}`,
      name: idType === 'abha' ? 'Aarav K. Sharma' : 'Meera S. Patel',
      age: 38,
      gender: 'Male',
      mobile: '9876543210',
      abhaId: idType === 'abha' ? idValue : '91-4921-8812-3310@abdm',
      aadhaarId: idType === 'aadhaar' ? idValue : 'XXXX-XXXX-9901',
      registeredAt: new Date().toISOString()
    };
    setPatient(p);
    storageService.savePatient(p);
    setActiveRole('patient');
    localStorage.setItem('medikiosk_active_role', 'patient');
    return true;
  };

  const registerPatient = async (
    name: string,
    age: number,
    gender: PatientUser['gender'],
    mobile: string
  ): Promise<PatientUser> => {
    const response = await fetch(`${API_BASE}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age, gender, mobile })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to register patient");
    }

    const newPatient: PatientUser = data.patient;
    setPatient(newPatient);
    storageService.savePatient(newPatient);
    setActiveRole('patient');
    localStorage.setItem('medikiosk_active_role', 'patient');
    return newPatient;
  };

  const loginDoctor = (username: string): boolean => {
    const existing = storageService.getDoctor();
    if (existing) {
      setDoctor(existing);
    } else {
      const doc: DoctorUser = {
        id: 'doc-001',
        username,
        name: 'Dr. Anand Verma',
        age: 46,
        gender: 'Male',
        mobile: '+91 99887 76655',
        experienceYears: 18,
        qualification: 'MBBS, MD (Internal Medicine)',
        regNumber: 'MCI-2008-44910',
        department: 'General Medicine OPD',
        roomNo: 'OPD Room 104',
        isVerified: true
      };
      setDoctor(doc);
      storageService.saveDoctor(doc);
    }
    setActiveRole('doctor');
    localStorage.setItem('medikiosk_active_role', 'doctor');
    return true;
  };

  const registerDoctor = async (
    doctorData: Omit<DoctorUser, 'id' | 'isVerified'>
  ): Promise<DoctorUser> => {
    const response = await fetch(`${API_BASE}/doctors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doctorData)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to register doctor");
    }

    const newDoc: DoctorUser = data.doctor;
    setDoctor(newDoc);
    storageService.saveDoctor(newDoc);
    setActiveRole('doctor');
    localStorage.setItem('medikiosk_active_role', 'doctor');
    return newDoc;
  };

  const logout = () => {
    setActiveRole(null);
    localStorage.removeItem('medikiosk_active_role');
  };

  const switchRole = (role: 'patient' | 'doctor' | null) => {
    setActiveRole(role);
    if (role) {
      localStorage.setItem('medikiosk_active_role', role);
    } else {
      localStorage.removeItem('medikiosk_active_role');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        patient,
        doctor,
        activeRole,
        loginPatientWithId,
        registerPatient,
        loginDoctor,
        registerDoctor,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};