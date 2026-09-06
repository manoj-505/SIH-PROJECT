import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  KeyRound,
  ShieldCheck,
  UserPlus,
  Phone,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PatientUser } from '../types';

export const PatientLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginPatientWithId, registerPatient } = useAuth();

  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');

  // Existing Patient form
  const [idType, setIdType] = useState<'abha' | 'aadhaar'>('abha');
  const [idNumber, setIdNumber] = useState<string>('91-7890-1234-5678@abdm');
  const [password, setPassword] = useState<string>('patient123');
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

  // New Patient form
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<PatientUser['gender']>('Male');
  const [mobile, setMobile] = useState<string>('');
  
  // OTP states
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpValue, setOtpValue] = useState<string>('');
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(60);
  const [otpError, setOtpError] = useState<string>('');

  const handleSendOtp = () => {
    if (!mobile || mobile.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
    setOtpValue('4582'); // Demo pre-fill for effortless testing
    setOtpTimer(60);
  };

  const handleVerifyOtp = () => {
    if (otpValue === '4582' || otpValue.length === 4 || otpValue.length === 6) {
      setOtpVerified(true);
      setOtpError('');
    } else {
      setOtpError('Invalid OTP. Please enter 4582.');
    }
  };

  const handleExistingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber.trim()) {
      alert('Please enter your ABHA or Aadhaar number');
      return;
    }
    loginPatientWithId(idType, idNumber);
    navigate('/patient-home');
  };

  const handleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age) {
      alert('Please fill out your Name and Age');
      return;
    }
    if (!otpVerified) {
      alert('Please verify mobile number via OTP first');
      return;
    }
    try {
      await registerPatient(name, parseInt(age, 10), gender, mobile);
      navigate('/patient-home');
    } catch (err) {
      alert('Registration failed. Please check your connection and try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Top Breadcrumb & Return to Landing */}
      <div className="max-w-xl mx-auto w-full mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
        >
          <span>← Back to Entry Selection</span>
        </button>
        <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
          Patient Portal Access
        </span>
      </div>

      <div className="max-w-xl mx-auto w-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-primary-700 to-sky-600 text-white p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-kiosk tracking-tight">
            Patient Kiosk Access
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 mt-1 font-medium">
            Login with ABHA/Aadhaar or register as a new patient
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab('existing')}
            className={`kiosk-btn flex-1 py-4 text-center font-bold text-sm sm:text-base border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'existing'
                ? 'border-primary-600 text-primary-600 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Existing Patient Login</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`kiosk-btn flex-1 py-4 text-center font-bold text-sm sm:text-base border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'new'
                ? 'border-primary-600 text-primary-600 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>New Registration</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          
          {/* TAB A: Existing Patient Login */}
          {activeTab === 'existing' && (
            <form onSubmit={handleExistingSubmit} className="space-y-5">
              
              {/* ID Selector (ABHA or Aadhaar) */}
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Select Login Identifier
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIdType('abha');
                      setIdNumber('91-7890-1234-5678@abdm');
                    }}
                    className={`kiosk-btn py-3 px-4 rounded-2xl border-2 text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                      idType === 'abha'
                        ? 'border-primary-600 bg-primary-50 text-primary-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span>ABHA ID (Health ID)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIdType('aadhaar');
                      setIdNumber('8921-4401-9012');
                    }}
                    className={`kiosk-btn py-3 px-4 rounded-2xl border-2 text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                      idType === 'aadhaar'
                        ? 'border-primary-600 bg-primary-50 text-primary-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span>Aadhaar Number</span>
                  </button>
                </div>
              </div>

              {/* ID Number input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {idType === 'abha' ? 'ABHA ID / Health Address' : '12-Digit Aadhaar ID'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder={idType === 'abha' ? 'e.g. 91-XXXX-XXXX-XXXX or name@abdm' : 'XXXX-XXXX-XXXX'}
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-900 focus:bg-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-800 underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-900 focus:bg-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="kiosk-btn w-full py-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-base shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2"
              >
                <span>Login & Proceed to Kiosk</span>
                <ArrowRight className="w-5 h-5" />
              </button>

            </form>
          )}

          {/* TAB B: New Patient Registration */}
          {activeTab === 'new' && (
            <form onSubmit={handleNewSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name (रोगी का नाम) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rameshwar Patil"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-900 focus:bg-white focus:border-primary-500 focus:outline-none"
                />
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Age (उम्र) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-900 focus:bg-white focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Gender (लिंग) *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="Male">Male (पुरुष)</option>
                    <option value="Female">Female (महिला)</option>
                    <option value="Other">Other (अन्य)</option>
                  </select>
                </div>
              </div>

              {/* Mobile number with OTP flow */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Number (मोबाइल नंबर) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    disabled={otpVerified}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-900 focus:bg-white focus:border-primary-500 focus:outline-none disabled:bg-slate-100"
                  />
                  {!otpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="kiosk-btn px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold whitespace-nowrap"
                    >
                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  )}
                </div>
              </div>

              {/* OTP Input box */}
              {otpSent && !otpVerified && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>Enter 4-Digit OTP (Demo Code: 4582)</span>
                    <span className="flex items-center gap-1 text-amber-700">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{otpTimer}s</span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                      placeholder="e.g. 4582"
                      className="w-full px-4 py-2.5 bg-white border-2 border-amber-300 rounded-xl text-center text-lg font-black tracking-widest text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="kiosk-btn px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold whitespace-nowrap shadow-sm"
                    >
                      Verify OTP
                    </button>
                  </div>
                  {otpError && <p className="text-xs text-rose-600 font-bold">{otpError}</p>}
                </div>
              )}

              {/* OTP Verified Success Banner */}
              {otpVerified && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Mobile verified successfully. Ready to register!</span>
                </div>
              )}

              {/* Registration Submit */}
              <button
                type="submit"
                disabled={!otpVerified}
                className="kiosk-btn w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 mt-4"
              >
                <span>Create Account & Start Kiosk</span>
                <ArrowRight className="w-5 h-5" />
              </button>

            </form>
          )}

        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <HelpCircle className="w-12 h-12 text-primary-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
            <p className="text-xs text-slate-600">
              For security, password reset tokens are sent to your linked ABHA Aadhaar mobile number.
            </p>
            <button
              type="button"
              onClick={() => {
                alert('A reset link has been dispatched to your registered Aadhaar mobile number.');
                setShowForgotModal(false);
              }}
              className="kiosk-btn w-full py-3 rounded-xl bg-primary-600 text-white font-bold text-sm"
            >
              Send Reset Link via SMS
            </button>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="text-xs text-slate-500 hover:underline font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};