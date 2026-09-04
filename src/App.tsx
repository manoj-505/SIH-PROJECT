import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { KioskSessionProvider } from './context/KioskSessionContext';

// Pages
import { LandingPage } from './pages/LandingPage';
import { PatientLoginPage } from './pages/PatientLoginPage';
import { DoctorLoginPage } from './pages/DoctorLoginPage';
import { PatientHomePage } from './pages/PatientHomePage';
import { LanguageSelectPage } from './pages/LanguageSelectPage';
import { DocumentConsentPage } from './pages/DocumentConsentPage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { SummaryPreviewPage } from './pages/SummaryPreviewPage';
import { ConfirmSubmitPage } from './pages/ConfirmSubmitPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { DoctorOpdListPage } from './pages/DoctorOpdListPage';
import { AboutContactPage } from './pages/AboutContactPage';
import { RouteGuard } from './components/common/RouteGuard';

export function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <KioskSessionProvider>
            <Routes>
              {/* 1. Landing / Entry Page */}
              <Route path="/" element={<LandingPage />} />

              {/* 2. Patient Login Page */}
              <Route path="/patient-login" element={<PatientLoginPage />} />

              {/* 3. Doctor Login Page */}
              <Route path="/doctor-login" element={<DoctorLoginPage />} />

              {/* 4. Patient Home Page */}
              <Route path="/patient-home" element={<PatientHomePage />} />

              {/* 5. Language Selection Page */}
              <Route path="/kiosk/language" element={<LanguageSelectPage />} />

              {/* 6. Document Scanning & Consent Page */}
              <Route path="/kiosk/documents" element={<DocumentConsentPage />} />

              {/* 7. Health Questionnaire Page */}
              <Route path="/kiosk/questionnaire" element={<QuestionnairePage />} />

              {/* 8. Summary Preview Page */}
              <Route path="/kiosk/summary" element={<SummaryPreviewPage />} />

              {/* 9. Confirm & Submit Page */}
              <Route path="/kiosk/confirm" element={<ConfirmSubmitPage />} />

              {/* 10. Doctor Dashboard (Protected by RouteGuard) */}
              <Route
                path="/doctor-dashboard"
                element={
                  <RouteGuard allowedRole="doctor">
                    <DoctorDashboardPage />
                  </RouteGuard>
                }
              />

              {/* Dedicated Doctor OPD Queue List */}
              <Route path="/doctor-opd" element={<DoctorOpdListPage />} />

              {/* About & Contact Pages */}
              <Route path="/about" element={<AboutContactPage />} />
              <Route path="/contact" element={<AboutContactPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </KioskSessionProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
