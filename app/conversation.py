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
        patient=patient
    )

    sessions[session_id] = {

        "patient": patient.model_dump(),

        "messages": [],

        "clinical_history":
            clinical_history.model_dump(),

        "current_complaint": None,

        "current_field": None,

        "asked_fields": [],

        "red_flags": []
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
    Find the next unanswered clinical field.
    """

    session = sessions.get(session_id)

    if not session:
        return None

    complaint = session["current_complaint"]

    if not complaint:
        return None

    ontology = load_ontology(complaint)

    for field in ontology.get(
        "fields",
        []
    ):

        if field not in session["asked_fields"]:
            return field

    return None