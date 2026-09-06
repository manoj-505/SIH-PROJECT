import json
import os
import uuid
from typing import Dict, Any

from .schemas import Patient, ClinicalHistory


# Temporary in-memory storage.
# We will replace this with PostgreSQL later.
sessions: Dict[str, Dict[str, Any]] = {}


ONTOLOGY_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "ontology"
)


def load_ontology(complaint: str):
    """
    Load the clinical question structure
    for the detected complaint.
    """

    filename = complaint.replace(" ", "_") + ".json"

    filepath = os.path.join(
        ONTOLOGY_PATH,
        filename
    )

    # If a specific ontology does not exist,
    # use the general question set.
    if not os.path.exists(filepath):
        filepath = os.path.join(
            ONTOLOGY_PATH,
            "general.json"
        )

    with open(
        filepath,
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def detect_complaint(text: str):
    """
    Detect the patient's main complaint
    using the ontology keyword lists.
    """

    text_lower = text.lower()

    complaints = [
        "chest_pain",
        "fever",
        "headache",
        "abdominal_pain",
        "cough"
    ]

    for complaint_file in complaints:

        filepath = os.path.join(
            ONTOLOGY_PATH,
            f"{complaint_file}.json"
        )

        if not os.path.exists(filepath):
            continue

        with open(
            filepath,
            "r",
            encoding="utf-8"
        ) as file:
            ontology = json.load(file)

        for keyword in ontology.get(
            "keywords",
            []
        ):

            if keyword.lower() in text_lower:
                return ontology["complaint"]

    return "general"


def create_session(patient: Patient):
    """
    Create a new patient intake session.
    """

    session_id = str(uuid.uuid4())

    clinical_history = ClinicalHistory(
        patient=patient,
        ayush_assessment={}
    )

    sessions[session_id] = {

        "patient": patient.model_dump(),

        "messages": [],

        "clinical_history":
            clinical_history.model_dump(),

        "current_complaint": None,

        "current_field": None,

        "asked_fields": [],

        "answered_fields": [],

        "red_flags": [],

        "ayush_active": False,

        "ayush_asked_fields": [],

        "ayush_answered_fields": [],
        
        "ayush_current_field": None
    }

    return session_id


def get_session(session_id: str):
    """
    Retrieve an existing session.
    """

    return sessions.get(session_id)


def add_message(
    session_id: str,
    role: str,
    content: str
):
    """
    Add a patient or assistant message
    to the conversation.
    """

    session = sessions.get(session_id)

    if not session:
        return None

    session["messages"].append(
        {
            "role": role,
            "content": content
        }
    )

    return session


def set_complaint(
    session_id: str,
    complaint: str
):
    """
    Set the main complaint for the session.
    """

    session = sessions.get(session_id)

    if not session:
        return None

    session["current_complaint"] = complaint

    return session


def set_current_field(
    session_id: str,
    field: str
):
    """
    Set the clinical field currently
    being asked about.
    """

    session = sessions.get(session_id)

    if not session:
        return None

    session["current_field"] = field

    if field not in session["asked_fields"]:
        session["asked_fields"].append(field)

    return session


def get_next_field(session_id: str):
    """
    Find the next clinical field that has
    not yet been answered.
    """

    session = sessions.get(session_id)

    if not session:
        return None

    complaint = session["current_complaint"]

    if not complaint:
        return None

    ontology = load_ontology(complaint)

    for field in ontology.get("fields", []):

        if field not in session["answered_fields"]:
            return field

    return None
def save_current_answer(
    session_id: str,
    answer: str
):
    """
    Save the patient's answer to the
    currently active clinical field.
    """

    session = sessions.get(session_id)

    if not session:
        return None

    complaint = session["current_complaint"]
    field = session["current_field"]

    if not complaint or not field:
        return session

    history = session["clinical_history"]

    # Create the chief complaint if it does not exist.
    if not history["chief_complaints"]:

        history["chief_complaints"].append(
            {
                "name": complaint
            }
        )

    symptom = history["chief_complaints"][0]

    # Fields that accept multiple answers.
    list_fields = [
        "aggravating_factors",
        "relieving_factors",
        "associated_symptoms"
    ]

    if field in list_fields:

        symptom[field] = [answer]

    else:

        symptom[field] = answer

    # Mark this field as answered.
    if field not in session["answered_fields"]:

        session["answered_fields"].append(field)

    return session
def start_ayush_assessment(session_id: str):
    """
    Start the AYUSH assessment section.
    """

    session = sessions.get(session_id)

    if not session:
        return None

    session["ayush_active"] = True
    session["ayush_asked_fields"] = []
    session["ayush_answered_fields"] = []
    session["ayush_current_field"] = None

    return session


def get_next_ayush_field(session_id: str):
    """
    Return the next unanswered AYUSH assessment field.
    """

    session = sessions.get(session_id)

    if not session:
        return None

    ontology = load_ontology("ayush")

    answered_fields = session.get(
        "ayush_answered_fields",
        []
    )

    for field in ontology.get("fields", []):

        if field not in answered_fields:
            return field

    return None


def set_current_ayush_field(
    session_id: str,
    field: str
):
    """
    Set the AYUSH field currently being asked.
    """

    session = sessions.get(session_id)

    if not session:
        return None

    session["ayush_current_field"] = field

    if field not in session.get(
        "ayush_asked_fields",
        []
    ):
        session["ayush_asked_fields"].append(field)

    return session


def save_ayush_answer(
    session_id: str,
    answer: str
):
    """
    Save patient's answer to the current AYUSH field.
    """

    session = sessions.get(session_id)

    if not session:
        return None

    field = session.get(
        "ayush_current_field"
    )

    if not field:
        return session

    history = session["clinical_history"]

    if "ayush_assessment" not in history:
        history["ayush_assessment"] = {}

    history["ayush_assessment"][field] = answer

    if field not in session.get(
        "ayush_answered_fields",
        []
    ):
        session["ayush_answered_fields"].append(field)

    return session
def add_extracted_document_information(
    session_id: str,
    filename: str,
    extracted_text: str,
    medical_information: dict
):
    """
    Add information extracted from a medical
    document into the patient's clinical history.
    """

    session = sessions.get(session_id)

    if not session:
        return None

    history = session["clinical_history"]

    # -----------------------------------------
    # SAVE DOCUMENT
    # -----------------------------------------

    history["documents"].append(
        {
            "filename": filename,
            "document_type": medical_information.get(
                "document_type"
            ),
            "extracted_text": extracted_text
        }
    )

    # -----------------------------------------
    # PATIENT INFORMATION
    # -----------------------------------------

    patient_info = medical_information.get(
        "patient",
        {}
    )

    if patient_info:

        current_patient = history.get(
            "patient",
            {}
        )

        if patient_info.get("name"):
            current_patient["name"] = (
                patient_info["name"]
            )

        if patient_info.get("age"):

            age_text = str(
                patient_info["age"]
            )

            try:

                current_patient["age"] = int(
                    age_text.split()[0]
                )

            except (ValueError, TypeError, IndexError):

                pass

        if patient_info.get("sex"):
            current_patient["sex"] = (
                patient_info["sex"]
            )

        # Store weight in personal history
        if patient_info.get("weight"):
            current_patient["weight"] = (
                patient_info["weight"]
        )
        history["patient"] = current_patient

    # -----------------------------------------
    # DOCTOR INFORMATION
    # -----------------------------------------

    doctor_info = medical_information.get(
        "doctor",
        {}
    )

    if doctor_info:

        history["personal_history"][
            "attending_doctor"
        ] = doctor_info

    # -----------------------------------------
    # DOCUMENT DATE
    # -----------------------------------------

    if medical_information.get(
        "document_date"
    ):

        history["personal_history"][
            "document_date"
        ] = medical_information[
            "document_date"
        ]

    # -----------------------------------------
    # MEDICAL HISTORY
    # -----------------------------------------

    for item in medical_information.get(
        "medical_history",
        []
    ):

        if item not in history[
            "past_medical_history"
        ]:

            history[
                "past_medical_history"
            ].append(item)

    # -----------------------------------------
    # CLINICAL FINDINGS
    # -----------------------------------------

    clinical_findings = medical_information.get(
        "clinical_findings",
        []
    )

    if clinical_findings:

        history["personal_history"][
            "clinical_findings"
        ] = clinical_findings

    # -----------------------------------------
    # MEDICATIONS
    # -----------------------------------------

    for medication in medical_information.get(
        "medications",
        []
    ):

        history["medications"].append(
            medication
        )

    # -----------------------------------------
    # INVESTIGATIONS
    # -----------------------------------------

    for investigation in medical_information.get(
        "investigations",
        []
    ):

        history["investigations"].append(
            investigation
        )

    # -----------------------------------------
    # ALLERGIES
    # -----------------------------------------

    for allergy in medical_information.get(
        "allergies",
        []
    ):

        if allergy not in history[
            "allergies"
        ]:

            history["allergies"].append(
                allergy
            )

    # -----------------------------------------
    # ADVICE
    # -----------------------------------------

    advice = medical_information.get(
        "advice",
        []
    )

    if advice:

        history["personal_history"][
            "document_advice"
        ] = advice

    # -----------------------------------------
    # IMPORTANT FINDINGS
    # -----------------------------------------

    important_findings = (
        medical_information.get(
            "important_findings",
            []
        )
    )

    if important_findings:

        history["personal_history"][
            "document_important_findings"
        ] = important_findings

    return session