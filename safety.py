from typing import List, Optional
from .schemas import RedFlag


# ---------------------------------------------------------
# General clinical safety patterns
# ---------------------------------------------------------
#
# IMPORTANT:
# These rules do NOT diagnose a disease.
# They only identify potentially concerning symptoms
# that should receive human/clinical review.
#
# Keep this layer deterministic. Do not rely only on the LLM
# to identify safety-critical symptoms.
# ---------------------------------------------------------

RED_FLAG_PATTERNS = {

    # -----------------------------------------------------
    # CHEST PAIN
    # -----------------------------------------------------
    "chest pain": [
        (
            [
                "difficulty breathing",
                "breathing difficulty",
                "shortness of breath",
                "can't breathe",
                "cannot breathe",
                "unable to breathe",
                "breathless"
            ],
            "Chest pain associated with breathing difficulty"
        ),
        (
            [
                "severe sweating",
                "heavy sweating",
                "excessive sweating",
                "sweating heavily"
            ],
            "Chest pain associated with severe sweating"
        ),
        (
            [
                "fainting",
                "passed out",
                "pass out",
                "loss of consciousness",
                "lost consciousness"
            ],
            "Chest pain associated with fainting or loss of consciousness"
        ),
        (
            [
                "pain spreading to arm",
                "pain spreading to my arm",
                "pain spreading to my left arm",
                "pain spreading to my right arm",

                "pain is spreading to arm",
                "pain is spreading to my arm",
                "pain is spreading to my left arm",
                "pain is spreading to my right arm",

                "pain going to arm",
                "pain going to my arm",
                "pain going to my left arm",
                "pain going to my right arm",

                "pain is going to arm",
                "pain is going to my arm",
                "pain is going to my left arm",
                "pain is going to my right arm",

                "pain radiates to arm",
                "pain radiates to my arm",
                "pain radiates to my left arm",
                "pain radiates to my right arm",

                "pain is radiating to my arm",
                "pain is radiating to my left arm",
                "pain is radiating to my right arm",

                "pain down my arm",
                "pain going down my arm",
                "pain going down my left arm",
                "pain going down my right arm",

                "pain is going down my arm",
                "pain is going down my left arm",
                "pain is going down my right arm",

                "pain in my left arm",
                "pain in my right arm",

                "pain into my arm",
                "pain into my left arm",
                "pain into my right arm",

                "pain is moving into my arm",
                "pain moves into my arm",
                "pain moving into my arm",

                "chest pain moves into my arm",
                "chest pain moving into my arm",
                "chest pain goes into my arm",
                "chest pain going into my arm",
                "chest pain is going into my arm"
            ],
            "Chest pain reported with radiation to the arm"
        ),
        (
            [
                "pain spreading to jaw",
                "pain spreading to my jaw",
                "pain going to jaw",
                "pain going to my jaw",
                "pain radiates to jaw",
                "pain radiates to my jaw",
                "pain in my jaw",
                "chest pain moves into my jaw"
            ],
            "Chest pain reported with radiation to the jaw"
        ),
        (
            [
                "pain spreading to back",
                "pain spreading to my back",
                "pain going to back",
                "pain going to my back",
                "pain radiates to back",
                "pain radiates to my back",
                "pain in my back",
                "chest pain moves into my back"
            ],
            "Chest pain reported with radiation to the back"
        ),
        (
            [
                "severe chest pain",
                "very severe chest pain",
                "extreme chest pain",
                "worst chest pain",
                "chest pain 10",
                "chest pain 9"
            ],
            "Severe chest pain reported"
        )
    ],

    # -----------------------------------------------------
    # HEADACHE
    # -----------------------------------------------------
    "headache": [
        (
            [
                "sudden severe headache",
                "sudden headache",
                "worst headache",
                "worst headache of my life",
                "extremely severe headache",
                "very severe headache"
            ],
            "Sudden or unusually severe headache"
        ),
        (
            [
                "weakness on one side",
                "one sided weakness",
                "one-sided weakness",
                "weakness in one arm",
                "weakness in my arm",
                "weakness in one leg",
                "weakness in my leg",
                "face feels weak",
                "facial weakness"
            ],
            "Headache associated with weakness"
        ),
        (
            [
                "difficulty speaking",
                "cannot speak",
                "can't speak",
                "unable to speak",
                "speech difficulty",
                "slurred speech",
                "speaking difficulty"
            ],
            "Headache associated with difficulty speaking"
        ),
        (
            [
                "loss of consciousness",
                "lost consciousness",
                "passed out",
                "pass out",
                "fainted",
                "fainting"
            ],
            "Headache associated with loss of consciousness"
        ),
        (
            [
                "vision loss",
                "loss of vision",
                "cannot see",
                "can't see",
                "sudden vision change",
                "sudden vision changes"
            ],
            "Headache associated with sudden vision changes"
        )
    ],

    # -----------------------------------------------------
    # FEVER
    # -----------------------------------------------------
    "fever": [
        (
            [
                "difficulty breathing",
                "breathing difficulty",
                "shortness of breath",
                "can't breathe",
                "cannot breathe",
                "unable to breathe",
                "breathless"
            ],
            "Fever associated with breathing difficulty"
        ),
        (
            [
                "confusion",
                "very confused",
                "suddenly confused",
                "not making sense",
                "disoriented"
            ],
            "Fever associated with confusion"
        ),
        (
            [
                "loss of consciousness",
                "lost consciousness",
                "passed out",
                "pass out",
                "fainted",
                "fainting"
            ],
            "Fever associated with loss of consciousness"
        )
    ],

    # -----------------------------------------------------
    # ABDOMINAL PAIN
    # -----------------------------------------------------
    "abdominal pain": [
        (
            [
                "severe abdominal pain",
                "severe stomach pain",
                "severe belly pain",
                "very severe abdominal pain",
                "extreme abdominal pain",
                "worst abdominal pain"
            ],
            "Severe abdominal pain reported"
        ),
        (
            [
                "vomiting blood",
                "blood in vomit",
                "blood in my vomit",
                "throwing up blood",
                "vomited blood"
            ],
            "Abdominal symptoms associated with reported blood in vomit"
        ),
        (
            [
                "blood in stool",
                "blood in my stool",
                "bloody stool",
                "passing blood in stool",
                "black stool",
                "black stools"
            ],
            "Abdominal symptoms associated with reported blood in stool"
        ),
        (
            [
                "fainting",
                "passed out",
                "pass out",
                "loss of consciousness",
                "lost consciousness"
            ],
            "Abdominal pain associated with fainting or loss of consciousness"
        ),
        (
            [
                "pain spreading to back",
                "pain spreading to my back",
                "pain going to back",
                "pain going to my back",
                "pain radiates to back",
                "pain radiates to my back"
            ],
            "Abdominal pain reported with radiation to the back"
        ),
        (
            [
                "pain spreading to shoulder",
                "pain spreading to my shoulder",
                "pain going to shoulder",
                "pain going to my shoulder",
                "pain radiates to shoulder",
                "pain radiates to my shoulder"
            ],
            "Abdominal pain reported with radiation to the shoulder"
        )
    ],

    # -----------------------------------------------------
    # COUGH
    # -----------------------------------------------------
    "cough": [
        (
            [
                "coughing blood",
                "blood when coughing",
                "blood in sputum",
                "blood in my sputum",
                "coughing up blood",
                "cough up blood",
                "coughed blood"
            ],
            "Cough associated with reported blood"
        ),
        (
            [
                "severe difficulty breathing",
                "difficulty breathing",
                "breathing difficulty",
                "shortness of breath",
                "can't breathe",
                "cannot breathe",
                "unable to breathe",
                "severe breathlessness"
            ],
            "Cough associated with breathing difficulty"
        )
    ]
}


def _normalize_text(text: str) -> str:
    """
    Normalize patient text before checking safety patterns.
    """
    if not text:
        return ""

    return " ".join(text.lower().strip().split())


def check_red_flags(
    text: str,
    complaint: Optional[str] = None
) -> List[RedFlag]:

    text_lower = _normalize_text(text)

    if not text_lower:
        return []

    detected: List[RedFlag] = []

    # Normalize complaint name.
    normalized_complaint = (
        complaint.lower().strip()
        if complaint
        else None
    )

    # If we know the complaint, check complaint-specific
    # patterns plus general patterns from other complaints.
    patterns_to_check = []

    if normalized_complaint in RED_FLAG_PATTERNS:
        patterns_to_check.extend(
            RED_FLAG_PATTERNS[normalized_complaint]
        )

    # Always check patterns from other complaints too.
    # This is important because patients may mention a
    # dangerous symptom before the system has correctly
    # identified their main complaint.
    for complaint_name, patterns in RED_FLAG_PATTERNS.items():

        if complaint_name == normalized_complaint:
            continue

        patterns_to_check.extend(patterns)

    # Check every pattern.
    for keywords, reason in patterns_to_check:

        matched_keyword = None

        for keyword in keywords:

            if keyword.lower() in text_lower:
                matched_keyword = keyword
                break

        if matched_keyword:

            # Prevent duplicate alerts with the same reason.
            already_detected = any(
                flag.reason == reason
                for flag in detected
            )

            if not already_detected:
                detected.append(
                    RedFlag(
                        symptom=matched_keyword,
                        reason=reason,
                        severity="potential",
                        requires_human_review=True
                    )
                )

    return detected


def safety_message() -> str:
    """
    Patient-facing message when a potential red flag is detected.
    """

    return (
        "A potentially urgent symptom has been mentioned. "
        "Please wait for clinical staff assistance. "
        "This system does not provide a diagnosis."
    )