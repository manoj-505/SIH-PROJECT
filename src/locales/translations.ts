import { SupportedLanguage } from '../types';

export interface Translations {
  appTitle: string;
  appTagline: string;
  patientPortal: string;
  doctorPortal: string;
  patientPortalDesc: string;
  doctorPortalDesc: string;
  consultNow: string;
  home: string;
  patientKiosk: string;
  doctorOpdList: string;
  aboutUs: string;
  contactUs: string;
  previousData: string;
  selectLanguage: string;
  selectLanguageSub: string;
  touchVoiceTypeHelp: string;
  listen: string;
  speaking: string;
  stop: string;
  recordVoice: string;
  recordingVoice: string;
  listeningSpeech: string;
  typeHere: string;
  next: string;
  previous: string;
  submit: string;
  emergencyAlert: string;
  emergencyAlertBanner: string;
  ayushMode: string;
  ayushModeDesc: string;
  documentsTitle: string;
  documentsSub: string;
  scanCamera: string;
  uploadFile: string;
  consentTitle: string;
  consentReadAloud: string;
  mandatoryConsentWarning: string;
  summaryTitle: string;
  patientFriendlyView: string;
  clinicalSoapView: string;
  confirmTokenTitle: string;
  tokenNumber: string;
  roomNumber: string;
  estimatedWait: string;
  printToken: string;
  sendSmsWhatsapp: string;
  sessionResetIn: string;
  newSession: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    appTitle: "MediKiosk",
    appTagline: "AI-Powered Pre-Consultation History & Clinical OPD Engine",
    patientPortal: "Patient Kiosk",
    doctorPortal: "Doctor OPD Portal",
    patientPortalDesc: "Voice-guided self case-taking, document scanning & instant OPD token",
    doctorPortalDesc: "Review AI clinical summaries, abnormal lab alerts & manage patient queue",
    consultNow: "Consult Now",
    home: "Home",
    patientKiosk: "Patient Kiosk",
    doctorOpdList: "Doctor OPD List",
    aboutUs: "About MediKiosk",
    contactUs: "Helpdesk & Contact",
    previousData: "Previous Medical Data",
    selectLanguage: "Choose Your Preferred Language",
    selectLanguageSub: "Touch any language or listen to instructions in your mother tongue",
    touchVoiceTypeHelp: "You can Touch options, Speak your symptoms, or Type answers",
    listen: "Listen (Audio)",
    speaking: "Playing Audio...",
    stop: "Stop",
    recordVoice: "Tap to Speak",
    recordingVoice: "Listening... speak clearly",
    listeningSpeech: "Speech detected...",
    typeHere: "Type or use virtual keyboard...",
    next: "Next Step",
    previous: "Back",
    submit: "Confirm & Submit",
    emergencyAlert: "URGENT RED-FLAG ALERT",
    emergencyAlertBanner: "Critical symptoms detected. Please alert triage staff or nurses immediately!",
    ayushMode: "AYUSH (Ayurveda) Mode",
    ayushModeDesc: "Includes Dashavidha Pariksha & Ahara-Vihara assessment",
    documentsTitle: "Digitize Prior Medical Records",
    documentsSub: "Scan prescriptions, lab reports, or discharge summaries using camera or upload",
    scanCamera: "Scan with Camera",
    uploadFile: "Upload Document",
    consentTitle: "Patient Consent & ABHA Authorization",
    consentReadAloud: "Listen to Consent in English",
    mandatoryConsentWarning: "Please accept mandatory consent items to proceed with hospital case-taking",
    summaryTitle: "Pre-Consultation Summary Review",
    patientFriendlyView: "Simple Explanation (For Patient)",
    clinicalSoapView: "Physician Clinical Summary (For Doctor)",
    confirmTokenTitle: "Your Consultation Token is Ready!",
    tokenNumber: "Token Number",
    roomNumber: "Assigned OPD Room",
    estimatedWait: "Estimated Wait Time",
    printToken: "Print Token Slip",
    sendSmsWhatsapp: "Send via SMS / WhatsApp",
    sessionResetIn: "Session will auto-reset for privacy in",
    newSession: "Start for Next Patient"
  },
  hi: {
    appTitle: "मेडीकियोस्क (MediKiosk)",
    appTagline: "एआई-संचालित रोगी केस-टेकिंग और ओपीडी परामर्श मंच",
    patientPortal: "मरीज़ कियोस्क (Patient Kiosk)",
    doctorPortal: "डॉक्टर ओपीडी पोर्टल",
    patientPortalDesc: "आवाज़ या स्पर्श से अपनी बीमारी बताएं, पुरानी पर्चियां स्कैन करें और टोकन पाएं",
    doctorPortalDesc: "एआई-निर्मित सारांश, आपातकालीन अलर्ट देखें और मरीज़ों की जांच करें",
    consultNow: "परामर्श शुरू करें (Consult Now)",
    home: "होम",
    patientKiosk: "मरीज़ कियोस्क",
    doctorOpdList: "डॉक्टर ओपीडी सूची",
    aboutUs: "हमारे बारे में",
    contactUs: "सहायता केंद्र",
    previousData: "पिछला मेडिकल रिकॉर्ड",
    selectLanguage: "अपनी पसंदीदा भाषा चुनें",
    selectLanguageSub: "भाषा चुनने के लिए छुएं या सुनकर समझें",
    touchVoiceTypeHelp: "आप छूकर, बोलकर या लिखकर जवाब दे सकते हैं",
    listen: "सुनें (Audio)",
    speaking: "ऑडियो बज रहा है...",
    stop: "रोकें",
    recordVoice: "बोलने के लिए दबाएं",
    recordingVoice: "सुन रहे हैं... कृपया बोलें",
    listeningSpeech: "आवाज़ पहचानी जा रही है...",
    typeHere: "यहाँ लिखें या कीबोर्ड का उपयोग करें...",
    next: "आगे बढ़ें",
    previous: "पीछे जाएं",
    submit: "पुष्टि करें और जमा करें",
    emergencyAlert: "अति आवश्यक आपातकालीन अलर्ट!",
    emergencyAlertBanner: "गंभीर लक्षण पाए गए हैं। कृपया तुरंत ओपीडी स्टाफ या नर्स को सूचित करें!",
    ayushMode: "आयुष (आयुर्वेद) मोड",
    ayushModeDesc: "दशविध परीक्षा और आहार-विहार मूल्यांकन शामिल करता है",
    documentsTitle: "पुरानी पर्चियां व जांच रिपोर्ट स्कैन करें",
    documentsSub: "कैमरे से फोटो खींचें या फाइल अपलोड करें",
    scanCamera: "कैमरे से स्कैन करें",
    uploadFile: "फाइल अपलोड करें",
    consentTitle: "रोगी सहमति एवं आभा (ABHA) सहमति",
    consentReadAloud: "हिंदी में सहमति सुनें",
    mandatoryConsentWarning: "आगे बढ़ने के लिए कृपया अनिवार्य शर्तों को स्वीकार करें",
    summaryTitle: "दर्ज की गई बीमारी का विवरण",
    patientFriendlyView: "सरल भाषा में सारांश (मरीज़ के लिए)",
    clinicalSoapView: "डॉक्टर के लिए क्लिनिकल सारांश",
    confirmTokenTitle: "आपका ओपीडी टोकन तैयार है!",
    tokenNumber: "टोकन नंबर",
    roomNumber: "कमरा नंबर",
    estimatedWait: "अनुमानित प्रतीक्षा समय",
    printToken: "टोकन पर्ची प्रिंट करें",
    sendSmsWhatsapp: "एसएमएस/व्हाट्सएप पर भेजें",
    sessionResetIn: "गोपनीयता के लिए स्क्रीन रीसेट होगी:",
    newSession: "नए मरीज़ के लिए शुरू करें"
  },
  mr: {
    appTitle: "मेडीकियोस्क (MediKiosk)",
    appTagline: "एआय-सक्षम रुग्ण केस-नोंदणी आणि ओपीडी सल्लागार प्रणाली",
    patientPortal: "रुग्ण कियोस्क (Patient Kiosk)",
    doctorPortal: "डॉक्टर ओपीडी पोर्टल",
    patientPortalDesc: "बोलून किंवा स्पर्श करून आजार सांगा, जुनी कागदपत्रे स्कॅन करा आणि टोकन मिळवा",
    doctorPortalDesc: "एआय वैद्यकीय सारांश, रक्त तपासणी अलर्ट तपासा आणि रुग्ण तपासा",
    consultNow: "सल्ला सुरू करा (Consult Now)",
    home: "मुख्यपृष्ठ",
    patientKiosk: "रुग्ण कियोस्क",
    doctorOpdList: "ओपीडी यादी",
    aboutUs: "माहिती",
    contactUs: "मदत केंद्र",
    previousData: "मागील वैद्यकीय नोंदी",
    selectLanguage: "तुमची पसंतीची भाषा निवडा",
    selectLanguageSub: "भाषा निवडण्यासाठी स्पर्श करा किंवा ऐका",
    touchVoiceTypeHelp: "तुम्ही स्क्रीनला स्पर्श करून, बोलून किंवा लिहून माहिती देऊ शकता",
    listen: "ऐका (Audio)",
    speaking: "ऑडिओ वाजत आहे...",
    stop: "थांबवा",
    recordVoice: "बोलण्यासाठी दाबा",
    recordingVoice: "ऐकत आहोत... बोला",
    listeningSpeech: "आवाज रेकॉर्ड होत आहे...",
    typeHere: "येथे लिहा...",
    next: "पुढे जा",
    previous: "मागे या",
    submit: "पुष्टी करा आणि सादर करा",
    emergencyAlert: "तातडीचा धोक्याचा इशारा!",
    emergencyAlertBanner: "गंभीर लक्षणे आढळली आहेत. कृपया त्वरित रुग्णालयातील कर्मचाऱ्यांना कळवा!",
    ayushMode: "आयुष (आयुर्वेद) पद्धत",
    ayushModeDesc: "दशविध परीक्षा व आहार-विहार तपासणी समाविष्ट",
    documentsTitle: "मागील वैद्यकीय कागदपत्रे स्कॅन करा",
    documentsSub: "कॅमेऱ्याने जुनी प्रिस्क्रिप्शन किंवा रिपोर्ट स्कॅन करा",
    scanCamera: "कॅमेऱ्याने स्कॅन करा",
    uploadFile: "फाइल अपलोड करा",
    consentTitle: "रुग्ण संमती आणि आभा (ABHA) जोडणी",
    consentReadAloud: "मराठीत संमती ऐका",
    mandatoryConsentWarning: "कृपया पुढे जाण्यासाठी आवश्यक संमती द्या",
    summaryTitle: "नोंदवलेल्या आजाराचा सारांश",
    patientFriendlyView: "सोप्या भाषेत सारांश (रुग्णासाठी)",
    clinicalSoapView: "वैद्यकीय सारांश (डॉक्टरांसाठी)",
    confirmTokenTitle: "तुमचे ओपीडी टोकन तयार आहे!",
    tokenNumber: "टोकन क्रमांक",
    roomNumber: "ओपीडी खोली क्रमांक",
    estimatedWait: "अंदाजे वाट पाहण्याची वेळ",
    printToken: "टोकन पावती प्रिंट करा",
    sendSmsWhatsapp: "मोबाईलवर एसएमएस मिळवा",
    sessionResetIn: "सुरक्षिततेसाठी स्क्रीन रिसेट होईल:",
    newSession: "पुढील रुग्णासाठी सुरू करा"
  },
  gu: {
    appTitle: "મેડીકિયોસ્ક (MediKiosk)",
    appTagline: "એઆઈ-સંચાલિત દર્દી કેસ-ટેકિંગ અને ઓપીડી સલાહ પ્લેટફોર્મ",
    patientPortal: "દર્દી કિઓસ્ક (Patient Kiosk)",
    doctorPortal: "ડૉક્ટર ઓપીડી પોર્ટલ",
    patientPortalDesc: "બોલીને કે ટચ કરીને તમારી બીમારી જણાવો, જૂના રિપોર્ટ સ્કેન કરો અને ટોકન મેળવો",
    doctorPortalDesc: "એઆઈ ક્લિનિકલ સારાંશ, કટોકટી ચેતવણીઓ જુઓ અને દર્દીઓ તપાસો",
    consultNow: "પરામર્શ શરૂ કરો (Consult Now)",
    home: "હોમ",
    patientKiosk: "દર્દી કિઓસ્ક",
    doctorOpdList: "ઓપીડી યાદી",
    aboutUs: "વિશે",
    contactUs: "મદદ કેન્દ્ર",
    previousData: "અગાઉનો મેડિકલ રેકોર્ડ",
    selectLanguage: "તમારી પસંદગીની ભાષા પસંદ કરો",
    selectLanguageSub: "ભાષા પસંદ કરવા સ્પર્શ કરો અથવા સાંભળો",
    touchVoiceTypeHelp: "તમે સ્પર્શ કરીને, બોલીને અથવા લખીને જવાબ આપી શકો છો",
    listen: "સાંભળો (Audio)",
    speaking: "ઓડિયો વાગી રહ્યો છે...",
    stop: "રોકો",
    recordVoice: "બોલવા માટે દબાવો",
    recordingVoice: "સાંભળી રહ્યા છીએ... બોલો",
    listeningSpeech: "અવાજ ઓળખાઈ રહ્યો છે...",
    typeHere: "અહીં લખો...",
    next: "આગળ વધો",
    previous: "પાછળ જાઓ",
    submit: "ખાતરી કરો અને સબમિટ કરો",
    emergencyAlert: "તાકીદની કટોકટી ચેતવણી!",
    emergencyAlertBanner: "ગંભીર લક્ષણો જણાયા છે. કૃપા કરીને તરત જ સ્ટાફ અથવા નર્સનો સંપર્ક કરો!",
    ayushMode: "આયુષ (આયુર્વેદ) મોડ",
    ayushModeDesc: "દશવિધ પરીક્ષા અને આહાર-વિહાર મૂલ્યાંકન",
    documentsTitle: "જૂના પ્રિસ્ક્રિપ્શન અને રિપોર્ટ સ્કેન કરો",
    documentsSub: "કેમેરાથી સ્કેન કરો અથવા ફાઇલ અપલોડ કરો",
    scanCamera: "કેમેરાથી સ્કેન કરો",
    uploadFile: "ફાઇલ અપલોડ કરો",
    consentTitle: "દર્દીની સંમતિ અને આભા (ABHA) જોડાણ",
    consentReadAloud: "ગુજરાતીમાં સંમતિ સાંભળો",
    mandatoryConsentWarning: "આગળ વધવા માટે કૃપા કરીને આવશ્યક સંમતિ સ્વીકારો",
    summaryTitle: "નોંધાયેલી બીમારીની વિગતો",
    patientFriendlyView: "સરળ ભાષામાં સારાંશ (દર્દી માટે)",
    clinicalSoapView: "ડૉક્ટર માટે ક્લિનિકલ સારાંશ",
    confirmTokenTitle: "તમારું ઓપીડી ટોકન તૈયાર છે!",
    tokenNumber: "ટોકન નંબર",
    roomNumber: "રૂમ નંબર",
    estimatedWait: "અંદાજિત રાહ જોવાનો સમય",
    printToken: "ટોકન સ્લિપ પ્રિન્ટ કરો",
    sendSmsWhatsapp: "એસએમએસ/વોટ્સએપ પર મેળવો",
    sessionResetIn: "સ્ક્રીન આપમેળે રીસેટ થશે:",
    newSession: "નવા દર્દી માટે શરૂ કરો"
  }
};
