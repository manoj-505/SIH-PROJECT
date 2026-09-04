import { ScannedDocument, LabValue } from '../types';

export class OCRService {
  /**
   * Process a document image or PDF, extracting clinical entities.
   * Can be hooked into AWS Textract, Tesseract.js, or backend OCR microservice.
   */
  public async extractDocumentData(
    fileName: string,
    docType: 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Doctor Certificate'
  ): Promise<ScannedDocument['extractedData']> {
    // Simulate OCR pipeline latency (1.2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1400));

    if (docType === 'Lab Report') {
      const investigationHighlights: LabValue[] = [
        {
          test: 'Fasting Blood Sugar (FBS)',
          value: '172',
          unit: 'mg/dL',
          isAbnormal: true,
          referenceRange: '70 - 100 mg/dL',
          flag: 'HIGH'
        },
        {
          test: 'HbA1c (Glycated Hemoglobin)',
          value: '8.6',
          unit: '%',
          isAbnormal: true,
          referenceRange: '< 5.7 %',
          flag: 'CRITICAL'
        },
        {
          test: 'Serum Creatinine',
          value: '1.05',
          unit: 'mg/dL',
          isAbnormal: false,
          referenceRange: '0.7 - 1.3 mg/dL'
        },
        {
          test: 'Total Cholesterol',
          value: '228',
          unit: 'mg/dL',
          isAbnormal: true,
          referenceRange: '< 200 mg/dL',
          flag: 'HIGH'
        }
      ];

      return {
        diagnoses: ['Type 2 Diabetes Mellitus - Uncontrolled', 'Hyperlipidemia'],
        medications: ['Metformin 500mg BD', 'Atorvastatin 10mg HS'],
        investigationHighlights,
        hospitalName: 'Apollo Diagnostics Centre, Mumbai',
        doctorName: 'Dr. S. Mehta, MD'
      };
    } else if (docType === 'Prescription') {
      const investigationHighlights: LabValue[] = [
        {
          test: 'Blood Pressure (Sitting)',
          value: '148/92',
          unit: 'mmHg',
          isAbnormal: true,
          referenceRange: '< 120/80 mmHg',
          flag: 'HIGH'
        }
      ];

      return {
        diagnoses: ['Essential Hypertension (Stage 1)', 'Acute Bronchitis'],
        medications: [
          'Tab Telmisartan 40mg OD (Morning)',
          'Cap Amoxicillin-Clavulanate 625mg BD x 5 days',
          'Syp Levocetirizine 5mg HS'
        ],
        investigationHighlights,
        hospitalName: 'Civil Hospital OPD, Ward 4',
        doctorName: 'Dr. Rajesh K. Sharma, MD (Med)'
      };
    } else if (docType === 'Discharge Summary') {
      return {
        diagnoses: ['Acute Gastroenteritis with Moderate Dehydration', 'Hypokalemia (Resolved)'],
        medications: ['ORS Sachets ad libitum', 'Tab Rifaximin 400mg TDS', 'Probiotic capsules OD'],
        investigationHighlights: [
          {
            test: 'Serum Potassium (at admission)',
            value: '3.1',
            unit: 'mEq/L',
            isAbnormal: true,
            referenceRange: '3.5 - 5.0 mEq/L',
            flag: 'LOW'
          }
        ],
        hospitalName: 'KEM Hospital, Pune',
        doctorName: 'Dr. Priya Deshmukh, DNB'
      };
    } else {
      // Doctor Certificate
      return {
        diagnoses: [],
        medications: [],
        investigationHighlights: [],
        doctorName: 'Dr. Candidate (MBBS, MD General Medicine)',
        hospitalName: 'Maharashtra University of Health Sciences (MUHS)'
      };
    }
  }

  /**
   * Pre-loaded demo documents for quick evaluation
   */
  public getSampleDocuments(): ScannedDocument[] {
    return [
      {
        id: 'doc-001',
        title: 'Recent OPD Prescription - Civil Hospital',
        type: 'Prescription',
        date: '2026-08-15',
        fileUrl: '#',
        previewUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
        ocrStatus: 'completed',
        extractedData: {
          diagnoses: ['Hypertension Stage 1', 'Dry Cough'],
          medications: ['Telmisartan 40mg OD', 'Cough Expectorant 10ml TDS'],
          investigationHighlights: [
            {
              test: 'Recorded Blood Pressure',
              value: '146/94',
              unit: 'mmHg',
              isAbnormal: true,
              referenceRange: '< 120/80',
              flag: 'HIGH'
            }
          ],
          hospitalName: 'District Civil Hospital, Thane',
          doctorName: 'Dr. S. K. Joshi'
        }
      },
      {
        id: 'doc-002',
        title: 'Comprehensive Metabolic Panel & Lipid Profile',
        type: 'Lab Report',
        date: '2026-07-28',
        fileUrl: '#',
        previewUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500&auto=format&fit=crop&q=60',
        ocrStatus: 'completed',
        extractedData: {
          diagnoses: ['Type 2 Diabetes (Uncontrolled)', 'Dyslipidemia'],
          medications: ['Metformin 500mg', 'Atorvastatin 10mg'],
          investigationHighlights: [
            {
              test: 'Fasting Blood Sugar',
              value: '172',
              unit: 'mg/dL',
              isAbnormal: true,
              referenceRange: '70-100',
              flag: 'HIGH'
            },
            {
              test: 'HbA1c',
              value: '8.6',
              unit: '%',
              isAbnormal: true,
              referenceRange: '< 5.7',
              flag: 'CRITICAL'
            }
          ],
          hospitalName: 'Apollo Diagnostics Laboratory',
          doctorName: 'Dr. R. Bannerjee'
        }
      }
    ];
  }
}

export const ocrService = new OCRService();
