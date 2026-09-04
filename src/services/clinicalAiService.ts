import {
  QuestionnaireState,
  ClinicalSummary,
  ScannedDocument,
  PatientUser,
  SupportedLanguage
} from '../types';

export class ClinicalAIService {
  /**
   * Continuous emergency heuristic monitor for critical red flags
   */
  public evaluateRedFlags(state: Partial<QuestionnaireState>): { isEmergency: boolean; triggers: string[] } {
    const triggers: string[] = [];

    const cc = (state.chiefComplaint || '').toLowerCase();
    const rad = (state.radiation || '').toLowerCase();
    const notes = (state.additionalNotes || '').toLowerCase();
    const char = (state.character || '').toLowerCase();
    const allText = `${cc} ${rad} ${notes} ${char}`.toLowerCase();

    // Cardiac emergency patterns
    if (
      (allText.includes('chest pain') || allText.includes('छाती में दर्द') || allText.includes('छातीत दुखणे') || allText.includes('છાતીમાં દુખાવો')) &&
      (allText.includes('left arm') || allText.includes('jaw') || allText.includes('breathless') || allText.includes('sweat') || (state.severity || 0) >= 8)
    ) {
      triggers.push('Suspected Acute Coronary Syndrome (Severe Chest Pain with Radiation/Autonomic Signs)');
    }

    // Neurological / Stroke signs
    if (
      allText.includes('facial drop') ||
      allText.includes('weakness in arm') ||
      allText.includes('slurred speech') ||
      allText.includes('sudden loss of vision') ||
      allText.includes('लकवा') ||
      allText.includes('पक्षाघात')
    ) {
      triggers.push('Suspected Cerebrovascular Event / Stroke (FAST Criteria)');
    }

    // Severe respiratory distress
    if (
      (allText.includes('gasping') || allText.includes('severe breathlessness') || allText.includes('blue lips') || allText.includes('सांस फूलना')) &&
      (state.severity || 0) >= 8
    ) {
      triggers.push('Acute Respiratory Distress / Severe Hypoxia warning');
    }

    // Anaphylaxis
    if (
      allText.includes('swelling in throat') ||
      allText.includes('difficulty swallowing and breathing') ||
      (allText.includes('allergy') && allText.includes('wheezing'))
    ) {
      triggers.push('Suspected Severe Anaphylaxis / Airway Compromise');
    }

    return {
      isEmergency: triggers.length > 0,
      triggers
    };
  }

  /**
   * Generate both Doctor SOAP clinical summary and Patient-friendly plain explanation
   */
  public generateClinicalSummary(
    state: QuestionnaireState,
    documents: ScannedDocument[],
    patient: PatientUser,
    lang: SupportedLanguage,
    tokenNo: string
  ): ClinicalSummary {
    const redFlags = this.evaluateRedFlags(state);
    const priority = redFlags.isEmergency ? 'emergency' : (state.severity >= 7 ? 'urgent' : 'normal');

    // Aggregate abnormal labs from digitized documents
    const abnormalLabs = documents.flatMap(d => d.extractedData?.investigationHighlights || []).filter(l => l.isAbnormal);
    const recentDiagnoses = Array.from(new Set(documents.flatMap(d => d.extractedData?.diagnoses || [])));
    const detectedMeds = Array.from(new Set(documents.flatMap(d => d.extractedData?.medications || [])));

    // 1. Structured Clinical Note (Doctor view)
    const chiefComplaint = `${state.chiefComplaint || 'Generalized malaise'} for ${state.duration || 'recent onset'}`;
    
    const hpiClinicalSummary = `Patient presents with ${state.chiefComplaint || 'symptoms'}. Onset was ${state.onset || 'subacute'}. Nature of pain/symptom is described as ${state.character || 'moderate'}. Severity rated ${state.severity}/10 on visual numeric scale. Radiation reported to: ${state.radiation || 'none'}. Aggravated by: ${state.aggravatingFactors.length ? state.aggravatingFactors.join(', ') : 'no specific triggers'}. Relieved by: ${state.relievingFactors.length ? state.relievingFactors.join(', ') : 'rest'}. Additional remarks: ${state.additionalNotes || 'none'}.`;

    const pastMedicalSummary = `Known comorbidities: ${state.pastMedicalConditions.length ? state.pastMedicalConditions.join(', ') : 'No documented chronic illnesses'}. Prior surgical history: ${state.pastSurgeries.length ? state.pastSurgeries.join(', ') : 'Nil significant'}. Digitized prior diagnoses: ${recentDiagnoses.length ? recentDiagnoses.join('; ') : 'None uploaded'}.`;

    const drugAllergySummary = `Allergies: ${state.drugAllergies.length ? state.drugAllergies.join(', ') : 'NKDA (No known drug allergies)'}. Current medications reported: ${state.currentMedications.length ? state.currentMedications.join(', ') : 'None reported'}. Document OCR medications: ${detectedMeds.length ? detectedMeds.join(', ') : 'Nil'}.`;

    const familyPersonalSummary = `Family history: ${state.familyHistory.length ? state.familyHistory.join(', ') : 'Non-contributory'}. Diet: ${state.lifestyle.diet || 'Mixed'}. Tobacco/Smoking: ${state.lifestyle.smoking || 'None'}. Alcohol: ${state.lifestyle.alcohol || 'None'}. Sleep pattern: ${state.lifestyle.sleep || 'Adequate'}.`;

    const rosSummary = state.reviewOfSystems.length
      ? `Positive findings on review of systems: ${state.reviewOfSystems.join(', ')}.`
      : `Review of systems otherwise non-contributory.`;

    let ayushSummary: string | undefined = undefined;
    if (state.ayushMode && state.ayushAssessment) {
      const a = state.ayushAssessment;
      ayushSummary = `Dashavidha Pariksha: Dominant Prakriti: ${a.prakritiDominant} | Sara: ${a.sara} | Samhanana: ${a.samhanana} | Ahara Shakti: ${a.aharaShakti} | Vyayama Shakti: ${a.vyayamaShakti} | Satmya: ${a.satmya} | Sattva: ${a.sattva} | Vikriti: ${a.vikriti} | Ahara-Vihara habits: ${a.aharaHabits.join(', ')} / ${a.viharaHabits.join(', ')}.`;
    }

    // 2. Patient-Friendly Bilingual Plain Language Summary
    let plainText = "";
    let keyTakeaway = "";

    if (lang === 'hi') {
      plainText = `आपने बताया कि आपको मुख्य रूप से "${state.chiefComplaint || 'अस्वस्थता'}" की समस्या है, जो ${state.duration || 'कुछ समय'} से है। दर्द या परेशानी का स्तर 10 में से ${state.severity} है। पुरानी बीमारी: ${state.pastMedicalConditions.join(', ') || 'कोई नहीं'}। आपने ${documents.length} पुरानी पर्चियां भी जोड़ी हैं।`;
      keyTakeaway = redFlags.isEmergency
        ? "चेतावनी: आपके लक्षण गंभीर लग रहे हैं, तुरंत डॉक्टर या नर्स से सीधे मिलें!"
        : "आपका विवरण डॉक्टर के पास सुरक्षित भेज दिया गया है। अपना टोकन नंबर संभाल कर रखें।";
    } else if (lang === 'mr') {
      plainText = `तुम्ही नोंदवले आहे की तुम्हाला मुख्यत्वे "${state.chiefComplaint || 'त्रास'}" चा त्रास ${state.duration || 'काही दिवसांपासून'} होत आहे. त्रासाची तीव्रता 10 पैकी ${state.severity} आहे. पूर्वीचे आजार: ${state.pastMedicalConditions.join(', ') || 'काही नाही'}. तुम्ही ${documents.length} जुने वैद्यकीय अहवाल जोडले आहेत.`;
      keyTakeaway = redFlags.isEmergency
        ? "महत्त्वाचे: तातडीच्या उपचाराची गरज असू शकते. लगेच कर्मचाऱ्यांना सांगा!"
        : "तुमची सर्व माहिती डॉक्टरांकडे सुरक्षित पाठवली आहे. कृपया टोकन नंबर जवळ ठेवा.";
    } else if (lang === 'gu') {
      plainText = `તમે જણાવ્યું કે તમને મુખ્યત્વે "${state.chiefComplaint || 'તકલીફ'}" ની સમસ્યા ${state.duration || 'થોડા સમય'} થી છે. તકલીફનું સ્તર 10 માંથી ${state.severity} છે. જૂની બીમારી: ${state.pastMedicalConditions.join(', ') || 'કંઈ નહીં'}. તમે ${documents.length} જૂના રિપોર્ટ જોડ્યા છે.`;
      keyTakeaway = redFlags.isEmergency
        ? "ચેતવણી: તમારા લક્ષણો તાકીદના છે, કૃપા કરીને સ્ટાફનો તરત જ સંપર્ક કરો!"
        : "તમારી વિગતો ડૉક્ટર પાસે પહોંચી ગઈ છે. ટોકન નંબર સાચવી રાખો.";
    } else {
      plainText = `You reported experiencing "${state.chiefComplaint || 'discomfort'}" for ${state.duration || 'recently'}. Your symptom intensity is rated at ${state.severity}/10. Past conditions: ${state.pastMedicalConditions.join(', ') || 'None recorded'}. You have attached ${documents.length} medical document(s).`;
      keyTakeaway = redFlags.isEmergency
        ? "URGENT: Red-flag symptoms identified! Please alert kiosk attendant immediately."
        : "Your health summary is compiled and transmitted to the consulting doctor.";
    }

    return {
      id: `summary-${Date.now()}`,
      tokenNo,
      patientId: patient.id,
      patientName: patient.name,
      age: patient.age,
      gender: patient.gender,
      mobile: patient.mobile,
      abhaId: patient.abhaId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority,
      emergencyNotice: redFlags.isEmergency ? redFlags.triggers.join('; ') : undefined,
      chiefComplaint,
      hpiClinicalSummary,
      pastMedicalSummary,
      drugAllergySummary,
      familyPersonalSummary,
      rosSummary,
      ayushSummary,
      investigationSummary: {
        totalDocuments: documents.length,
        abnormalValues: abnormalLabs,
        recentDiagnoses,
        detectedMeds
      },
      patientFriendlySummary: {
        language: lang,
        summaryText: plainText,
        keyTakeaway
      },
      doctorApproved: false
    };
  }
}

export const clinicalAiService = new ClinicalAIService();
