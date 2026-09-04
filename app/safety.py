from typing import List, Optional

from .schemas import RedFlag


RED_FLAG_PATTERNS = {
    "chest pain": [
        (
            [
                "difficulty breathing",
                "breathing difficulty",
                "cannot breathe"
            ],
            "Chest pain associated with breathing difficulty"
        ),
        (
            [
                "severe sweating",
                "heavy sweating"
            ],
            "Chest pain associated with severe sweating"
        ),
        (
            [
                "fainting",
                "passed out",
                "loss of consciousness"
            ],
            "Chest pain associated with loss of consciousness"
        ),
        (
            [
                "pain spreading to arm",
                "pain going to arm",
                "pain in left arm"
            ],
            "Chest pain reported with radiation to the arm"
        ),
        (
            [
                "pain spreading to jaw",
                "pain going to jaw"
            ],
            "Chest pain reported with radiation to the jaw"
        )
    ],

    "headache": [
        (
            [
                "sudden severe headache",
                "worst headache"
            ],
            "Sudden or unusually severe headache"
        ),
        (
            [
                "loss of consciousness",
                "passed out"
            ],
            "Headache associated with loss of consciousness"
        ),
        (
            [
                "weakness on one side",
                "one sided weakness"
            ],
            "Headache associated with weakness"
        ),
        (
            [
                "difficulty speaking",
                "cannot speak"
            ],
            "Headache associated with difficulty speaking"
        )
    ],

    "fever": [
        (
            [
                "difficulty breathing",
                "breathing difficulty"
            ],
            "Fever associated with breathing difficulty"
        ),
        (
            [
                "confusion",
                "very confused"
            ],
            "Fever associated with confusion"
        ),
        (
            [
                "loss of consciousness",
                "passed out"
            ],
            "Fever associated with loss of consciousness"
        )
    ],

    "cough": [
        (
            [
                "coughing blood",
                "blood when coughing",
                "blood in sputum"
            ],
            "Cough associated with reported blood"
        ),
        (
            [
                "severe difficulty breathing",
                "cannot breathe"
            ],
            "Cough associated with severe breathing difficulty"
        )
    ]
}


def check_red_flags(
    text: str,
    complaint: Optional[str] = None
) -> List[RedFlag]:

    text_lower = text.lower()

    detected = []

    possible_patterns = []

    if complaint and complaint in RED_FLAG_PATTERNS:
        possible_patterns = RED_FLAG_PATTERNS[complaint]
    else:
        for patterns in RED_FLAG_PATTERNS.values():
            possible_patterns.extend(patterns)

    for keywords, reason in possible_patterns:

        for keyword in keywords:

            if keyword.lower() in text_lower:

                detected.append(
                    RedFlag(
                        symptom=keyword,
                        reason=reason,
                        severity="potential",
                        requires_human_review=True
                    )
                )

                break

    return detected


def safety_message() -> str:

    return (
        "A potentially urgent symptom has been mentioned. "
        "Please wait for clinical staff assistance. "
        "This system does not provide a diagnosis."
    )