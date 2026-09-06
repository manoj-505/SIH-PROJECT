from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# -----------------------------
# PATIENT
# -----------------------------

class Patient(BaseModel):

    name: Optional[str] = None

    age: Optional[int] = None

    sex: Optional[str] = None

    language: Optional[str] = "English"

    weight: Optional[str] = None

# -----------------------------
# SYMPTOMS
# -----------------------------

class Symptom(BaseModel):
    name: str
    onset: Optional[str] = None
    duration: Optional[str] = None
    location: Optional[str] = None
    character: Optional[str] = None
    radiation: Optional[str] = None
    severity: Optional[str] = None

    aggravating_factors: List[str] = Field(default_factory=list)
    relieving_factors: List[str] = Field(default_factory=list)
    associated_symptoms: List[str] = Field(default_factory=list)


# -----------------------------
# MEDICATION
# -----------------------------

class Medication(BaseModel):

    name: Optional[str] = None

    form: Optional[str] = None

    strength: Optional[str] = None

    dose: Optional[str] = None

    frequency: Optional[str] = None

    duration: Optional[str] = None

    instructions: Optional[str] = None

# -----------------------------
# INVESTIGATION
# -----------------------------

class Investigation(BaseModel):
    test_name: str
    value: Optional[str] = None
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    date: Optional[str] = None


# -----------------------------
# DOCUMENT
# -----------------------------

class MedicalDocument(BaseModel):
    filename: str
    document_type: Optional[str] = None
    extracted_text: Optional[str] = None


# -----------------------------
# RED FLAG
# -----------------------------

class RedFlag(BaseModel):
    symptom: str
    reason: str
    severity: str = "potential"
    requires_human_review: bool = True


# -----------------------------
# CLINICAL HISTORY
# -----------------------------

class ClinicalHistory(BaseModel):

    patient: Patient = Field(default_factory=Patient)

    # AYUSH / Ayurvedic assessment
    ayush_assessment: Dict[str, Any] = Field(
        default_factory=dict
    )

    chief_complaints: List[Symptom] = Field(
        default_factory=list
    )

    past_medical_history: List[str] = Field(
        default_factory=list
    )

    past_surgical_history: List[str] = Field(
        default_factory=list
    )

    medications: List[Medication] = Field(
        default_factory=list
    )

    allergies: List[str] = Field(
        default_factory=list
    )

    family_history: List[str] = Field(
        default_factory=list
    )

    personal_history: Dict[str, Any] = Field(
        default_factory=dict
    )

    investigations: List[Investigation] = Field(
        default_factory=list
    )

    documents: List[MedicalDocument] = Field(
        default_factory=list
    )

    red_flags: List[RedFlag] = Field(
        default_factory=list
    )


# -----------------------------
# SESSION
# -----------------------------

class StartSessionRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    language: str = "English"


class StartSessionResponse(BaseModel):
    session_id: str
    message: str


# -----------------------------
# CHAT
# -----------------------------

class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    current_complaint: Optional[str] = None
    current_field: Optional[str] = None
    red_flags: List[RedFlag] = Field(
        default_factory=list
    )
    complete: bool = False


# -----------------------------
# SUMMARY
# -----------------------------

class SummaryResponse(BaseModel):
    session_id: str
    summary: str
    clinical_history: ClinicalHistory
    red_flags: List[RedFlag] = Field(
        default_factory=list
    )
    requires_doctor_review: bool = True
class ExtractedPatientInformation(BaseModel):

    name: Optional[str] = None

    age: Optional[str] = None

    sex: Optional[str] = None

    weight: Optional[str] = None


class ExtractedDoctorInformation(BaseModel):

    name: Optional[str] = None

    qualification: Optional[str] = None

    registration_number: Optional[str] = None

    hospital_name: Optional[str] = None


class ExtractedMedication(BaseModel):

    name: Optional[str] = None

    form: Optional[str] = None

    strength: Optional[str] = None

    dose: Optional[str] = None

    frequency: Optional[str] = None

    duration: Optional[str] = None

    instructions: Optional[str] = None


class ExtractedMedicalInformation(BaseModel):

    document_type: Optional[str] = None

    document_date: Optional[str] = None

    patient: ExtractedPatientInformation = Field(
        default_factory=ExtractedPatientInformation
    )

    doctor: ExtractedDoctorInformation = Field(
        default_factory=ExtractedDoctorInformation
    )

    medical_history: List[str] = Field(
        default_factory=list
    )

    clinical_findings: List[str] = Field(
        default_factory=list
    )

    medications: List[ExtractedMedication] = Field(
        default_factory=list
    )

    investigations: List[Investigation] = Field(
        default_factory=list
    )

    allergies: List[str] = Field(
        default_factory=list
    )

    advice: List[str] = Field(
        default_factory=list
    )

    important_findings: List[str] = Field(
        default_factory=list
    )
class DocumentTimelineRequest(BaseModel):
    documents: List[Dict[str, Any]]