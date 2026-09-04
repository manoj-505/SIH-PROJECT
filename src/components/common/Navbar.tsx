import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Home,
  UserCheck,
  ClipboardList,
  Info,
  Globe,
  Sun,
  Moon,
  Type,
  LogOut,
  Stethoscope
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { SupportedLanguage } from '../../types';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t, fontSizeScale, setFontSizeScale, highContrast, setHighContrast } = useLanguage();
  const { activeRole, patient, doctor, logout, switchRole } = useAuth();

  const isCurrent = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: t.home, path: '/patient-home', icon: Home },
    { name: t.patientKiosk, path: '/kiosk/language', icon: UserCheck },
    { name: t.doctorOpdList, path: '/doctor-opd', icon: ClipboardList },
    { name: t.aboutUs, path: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-7 h-7 animate-pulse-subtle" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1 font-kiosk">
                Medi<span className="text-primary-600">Kiosk</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-100 text-primary-800 tracking-wider uppercase ml-1">
                  OPD
                </span>
              </span>
              <p className="text-xs text-slate-500 hidden sm:block">Smart Pre-Consultation Care</p>
            </div>
          </Link>

          {/* Top navigation bar (single row, left to right): Home, Patient Kiosk, Doctor OPD List, About Us */}
          <nav className="flex items-center space-x-1 md:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isCurrent(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`kiosk-btn flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                      : 'text-slate-700 hover:text-primary-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
                  <span className="whitespace-nowrap">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Stack: Language switch, Accessibility, Role status */}
          <div className="flex items-center space-x-2">
            
            {/* Language Quick Switcher */}
            <div className="relative flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <Globe className="w-4 h-4 text-slate-500 ml-1 mr-1" />
              {(['en', 'hi', 'mr', 'gu'] as SupportedLanguage[]).map((langCode) => (
                <button
                  key={langCode}
                  type="button"
                  onClick={() => setLanguage(langCode)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    language === langCode
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {langCode === 'en' ? 'EN' : langCode === 'hi' ? 'हि' : langCode === 'mr' ? 'म' : 'ગુ'}
                </button>
              ))}
            </div>

            {/* Accessibility Controls: Font Size & High Contrast */}
            <div className="hidden lg:flex items-center space-x-1 bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                type="button"
                title="Decrease Font Size"
                onClick={() => setFontSizeScale(Math.max(0.85, fontSizeScale - 0.1))}
                className="w-7 h-7 rounded-lg text-xs font-bold text-slate-700 hover:bg-white flex items-center justify-center"
              >
                A-
              </button>
              <button
                type="button"
                title="Reset Font Size"
                onClick={() => setFontSizeScale(1.0)}
                className="w-7 h-7 rounded-lg text-xs font-bold text-slate-700 hover:bg-white flex items-center justify-center"
              >
                A
              </button>
              <button
                type="button"
                title="Increase Font Size"
                onClick={() => setFontSizeScale(Math.min(1.25, fontSizeScale + 0.1))}
                className="w-7 h-7 rounded-lg text-xs font-bold text-slate-700 hover:bg-white flex items-center justify-center"
              >
                A+
              </button>
              <button
                type="button"
                title="High Contrast Mode"
                onClick={() => setHighContrast(prev => !prev)}
                className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-colors ${
                  highContrast ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-600 hover:bg-white'
                }`}
              >
                {highContrast ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Role indicator & doctor dashboard shortcut */}
            {activeRole === 'doctor' ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/doctor-dashboard"
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Doctor Portal</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Logout"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/doctor-login"
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors hidden sm:flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5 text-primary-600" />
                <span>Doctor Login</span>
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
