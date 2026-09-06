import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  KeyRound,
  UserCheck,
  Camera,
  Upload,
  Clock,
  CheckCircle,
  FileCheck,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CameraScannerModal } from '../components/common/CameraScannerModal';
import { DoctorUser } from '../types';

export const DoctorLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginDoctor, registerDoctor } = useAuth();

  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');

  // Existing Doctor State
  const [username, setUsername] = useState<string>('dr.verma');
  const [password, setPassword] = useState<string>('doctor123');

  // New Doctor State
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<DoctorUser['gender']>('Male');
  const [mobile, setMobile] = useState<string>('');
  const [experienceYears, setExperienceYears] = useState<string>('');
  const [qualification, setQualification] = useState<string>('MBBS, MD (General Medicine)');
  const [department, setDepartment] = useState<string>('General Medicine');
  const [regNumber, setRegNumber] = useState<string>('MCI-2022-88190');
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  // Scanner modal state
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  
  // Pending verification notice banner
  const [registrationSubmitted, setRegistrationSubmitted] = useState<boolean>(false);
  const [pendingDoctorInfo, setPendingDoctorInfo] = useState<DoctorUser | null>(null);

  const handleExistingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginDoctor(username);
    navigate('/doctor-dashboard');
  };

  const handleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !qualification.trim()) {
      alert('Please fill out Name and Qualification');
      return;
    }

    try {
      const newDoc = await registerDoctor({
        username: name.toLowerCase().replace(/\s+/g, '.'),
        name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
        age: parseInt(age || '35', 10),
        gender,
        mobile,
        experienceYears: parseInt(experienceYears || '5', 10),
        qualification,
        regNumber,
        department,
        roomNo: 'OPD Room 104',
        certificateUrl: certificateUrl || undefined
      });

      setPendingDoctorInfo(newDoc);
      setRegistrationSubmitted(true);
    } catch (err) {
      alert('Registration failed. Please check your connection and try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Top Breadcrumb */}
      <div className="max-w-xl mx-auto w-full mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5"
        >
          <span>← Return to Entry Selection</span>
        </button>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
          Doctor Clinical Portal
        </span>
      </div>

      <div className="max-w-xl mx-auto w-full bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-kiosk tracking-tight">
            Doctor Clinical Portal
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium">
            Access real-time patient queue, AI SOAP notes & abnormal labs
          </p>
        </div>

        {/* Pending Verification Notice State (if newly registered) */}
        {registrationSubmitted ? (
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-950 px-3 py-1 rounded-full border border-amber-800">
                Pending Credential Verification
              </span>
              <h3 className="text-2xl font-black text-white font-kiosk mt-3">
                Registration Submitted for Admin Review
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                Welcome, {pendingDoctorInfo?.name}! Your medical degree certificate and registration number ({pendingDoctorInfo?.regNumber}) have been uploaded to hospital credentialing. Status is currently marked as <strong className="text-amber-300">Pending Verification</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Doctor Name:</span>
                <span className="font-bold text-white">{pendingDoctorInfo?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Qualification:</span>
                <span className="font-semibold text-emerald-400">{pendingDoctorInfo?.qualification}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Certificate Status:</span>
                <span className="font-semibold text-emerald-300">✓ Uploaded / Scanned</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  loginDoctor(pendingDoctorInfo?.username || 'dr.preview');
                  navigate('/doctor-dashboard');
                }}
                className="kiosk-btn w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <span>Enter OPD Dashboard in Preview Mode</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setRegistrationSubmitted(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back to Login Form
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Selector */}
            <div className="flex border-b border-slate-700 bg-slate-800/60">
              <button
                type="button"
                onClick={() => setActiveTab('existing')}
                className={`kiosk-btn flex-1 py-4 text-center font-bold text-sm sm:text-base border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'existing'
                    ? 'border-emerald-500 text-emerald-400 bg-slate-800'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Existing Doctor Login</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('new')}
                className={`kiosk-btn flex-1 py-4 text-center font-bold text-sm sm:text-base border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'new'
                    ? 'border-emerald-500 text-emerald-400 bg-slate-800'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>New Doctor Registration</span>
              </button>
            </div>

            <div className="p-6 sm:p-8">
              
              {/* TAB A: Existing Doctor Login */}
              {activeTab === 'existing' && (
                <form onSubmit={handleExistingSubmit} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Doctor Username / Hospital ID
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. dr.verma"
                      className="w-full px-4 py-3.5 bg-slate-900 border-2 border-slate-700 rounded-2xl text-base font-semibold text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 bg-slate-900 border-2 border-slate-700 rounded-2xl text-base font-semibold text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-200">
                    💡 Pre-filled with active Demo Physician credentials: <strong>dr.verma</strong> (OPD Room 104)
                  </div>

                  <button
                    type="submit"
                    className="kiosk-btn w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    <span>Login to OPD Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              )}

              {/* TAB B: New Doctor Registration */}
              {activeTab === 'new' && (
                <form onSubmit={handleNewSubmit} className="space-y-4">
                  
                  {/* Doctor Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Full Name & Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Priya Deshmukh"
                      className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-base font-semibold text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Age, Gender & Mobile */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="38"
                        className="w-full px-3 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-sm font-semibold text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-2 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Exp. (Yrs)</label>
                      <input
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        placeholder="8"
                        className="w-full px-3 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-sm font-semibold text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Mobile & Registration number */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+91 98XXX XXXXX"
                        className="w-full px-3 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-sm font-semibold text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">MCI / Reg No.</label>
                      <input
                        type="text"
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        placeholder="MCI-XXXX-XXXX"
                        className="w-full px-3 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-sm font-semibold text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Qualification */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Qualification & Degree *
                    </label>
                    <input
                      type="text"
                      required
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. MBBS, MD, DNB or BAMS (Ayurveda)"
                      className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-base font-semibold text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Degree Certificate Upload / Live Camera Scan */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">
                        Degree Certificate Verification Document
                      </label>
                      {certificateUrl && (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Certificate Attached</span>
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="kiosk-btn flex-1 py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Scan Physical Certificate</span>
                      </button>

                      <label className="kiosk-btn flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setCertificateUrl(URL.createObjectURL(e.target.files[0]));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Submit registration */}
                  <button
                    type="submit"
                    className="kiosk-btn w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Submit Credentials for Approval</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                </form>
              )}

            </div>
          </>
        )}

      </div>

      {/* Camera Scanner Modal for Certificate Capture */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        title="Scan Doctor Degree Certificate"
        documentTypeLabel="MBBS/MD Certificate or Registration Council Letter"
        onCapture={(dataUrl) => {
          setCertificateUrl(dataUrl);
          setIsCameraOpen(false);
        }}
      />

    </div>
  );
};