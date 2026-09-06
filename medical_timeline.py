from typing import List, Dict, Any
from datetime import datetime


def parse_date(date_value: Any):
    """
    Convert supported date formats into a datetime object.

    If the date cannot be reliably understood,
    return None instead of guessing.
    """

    if not date_value:
        return None

    if not isinstance(date_value, str):
        return None

    date_formats = [
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%Y-%m-%d",
        "%d-%m-%y",
        "%d/%m/%y"
    ]

    for date_format in date_formats:

        try:
            return datetime.strptime(
                date_value.strip(),
                date_format
            )

        except ValueError:
            continue

    return None


def normalize_text(value: Any) -> str:
    """
    Normalize text only for comparison.

    Original medical information is never changed.
    """

    if not isinstance(value, str):
        return ""

    return " ".join(
        value.lower().strip().split()
    )


def detect_duplicate_documents(
    documents: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:

    duplicates = []

    for i in range(len(documents)):

        for j in range(i + 1, len(documents)):

            doc_a = documents[i]
            doc_b = documents[j]

            info_a = doc_a.get(
                "medical_information",
                {}
            )

            info_b = doc_b.get(
                "medical_information",
                {}
            )

            date_a = normalize_text(
                info_a.get("document_date")
            )

            date_b = normalize_text(
                info_b.get("document_date")
            )

            type_a = normalize_text(
                info_a.get("document_type")
            )

            type_b = normalize_text(
                info_b.get("document_type")
            )

            patient_a = info_a.get(
                "patient",
                {}
            )

            patient_b = info_b.get(
                "patient",
                {}
            )

            name_a = normalize_text(
                patient_a.get("name")
            )

            name_b = normalize_text(
                patient_b.get("name")
            )

            # Strong duplicate signal:
            # same patient + same date + same document type

            if (
                date_a
                and date_b
                and date_a == date_b
                and type_a
                and type_a == type_b
                and name_a
                and name_a == name_b
            ):

                duplicates.append({
                    "document_1": doc_a.get(
                        "filename"
                    ),
                    "document_2": doc_b.get(
                        "filename"
                    ),
                    "reason": (
                        "Same patient, document type "
                        "and document date."
                    ),
                    "requires_verification": True
                })

    return duplicates


def detect_conflicts(
    documents: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:

    conflicts = []

    # -----------------------------------------
    # ALLERGY CONFLICTS
    # -----------------------------------------

    allergy_records = []

    for document in documents:

        info = document.get(
            "medical_information",
            {}
        )

        allergies = info.get(
            "allergies",
            []
        )

        if allergies:

            allergy_records.append({
                "filename": document.get(
                    "filename"
                ),
                "date": info.get(
                    "document_date"
                ),
                "allergies": allergies
            })

    for i in range(len(allergy_records)):

        for j in range(i + 1, len(allergy_records)):

            first = allergy_records[i]
            second = allergy_records[j]

            first_allergies = {
                normalize_text(item)
                for item in first["allergies"]
            }

            second_allergies = {
                normalize_text(item)
                for item in second["allergies"]
            }

            if (
                first_allergies
                and second_allergies
                and first_allergies != second_allergies
            ):

                conflicts.append({
                    "type": "allergy",
                    "document_1": first[
                        "filename"
                    ],
                    "document_2": second[
                        "filename"
                    ],
                    "information_1": first[
                        "allergies"
                    ],
                    "information_2": second[
                        "allergies"
                    ],
                    "reason": (
                        "Allergy information differs "
                        "between documents."
                    ),
                    "requires_verification": True
                })

    # -----------------------------------------
    # PATIENT INFORMATION CONFLICTS
    # -----------------------------------------

    patient_records = []

    for document in documents:

        info = document.get(
            "medical_information",
            {}
        )

        patient = info.get(
            "patient",
            {}
        )

        if patient:

            patient_records.append({
                "filename": document.get(
                    "filename"
                ),
                "date": info.get(
                    "document_date"
                ),
                "patient": patient
            })

    fields_to_check = [
        "name",
        "sex"
    ]

    for field in fields_to_check:

        known_values = []

        for record in patient_records:

            value = record[
                "patient"
            ].get(field)

            normalized = normalize_text(
                value
            )

            if normalized:

                known_values.append({
                    "filename": record[
                        "filename"
                    ],
                    "value": value
                })

        unique_values = {
            normalize_text(
                item["value"]
            )
            for item in known_values
        }

        if len(unique_values) > 1:

            conflicts.append({
                "type": f"patient_{field}",
                "field": field,
                "records": known_values,
                "reason": (
                    f"Different {field} values "
                    "were found across documents."
                ),
                "requires_verification": True
            })

    return conflicts


def build_medical_timeline(
    documents: List[Dict[str, Any]]
) -> Dict[str, Any]:

    """
    Organize extracted medical documents
    into a chronological medical timeline.

    Also detects:
    - possible duplicate documents
    - conflicting allergy information
    - conflicting patient information

    This function does NOT diagnose or prescribe.
    """

    timeline = []

    for document in documents:

        medical_info = document.get(
            "medical_information",
            {}
        )

        event = {
            "filename": document.get(
                "filename"
            ),

            "document_type": medical_info.get(
                "document_type"
            ),

            "date": medical_info.get(
                "document_date"
            ),

            "patient": medical_info.get(
                "patient",
                {}
            ),

            "doctor": medical_info.get(
                "doctor",
                {}
            ),

            "medical_history": medical_info.get(
                "medical_history",
                []
            ),

            "clinical_findings": medical_info.get(
                "clinical_findings",
                []
            ),

            "medications": medical_info.get(
                "medications",
                []
            ),

            "investigations": medical_info.get(
                "investigations",
                []
            ),

            "allergies": medical_info.get(
                "allergies",
                []
            ),

            "advice": medical_info.get(
                "advice",
                []
            ),

            "important_findings": medical_info.get(
                "important_findings",
                []
            )
        }

        event["_parsed_date"] = parse_date(
            event["date"]
        )

        timeline.append(event)

    # -----------------------------------------
    # SORT CHRONOLOGICALLY
    # -----------------------------------------

    timeline.sort(
        key=lambda event: (
            event["_parsed_date"] is None,
            event["_parsed_date"]
            or datetime.max
        )
    )

    for event in timeline:

        event.pop(
            "_parsed_date",
            None
        )

    # -----------------------------------------
    # DETECT DUPLICATES
    # -----------------------------------------

    duplicates = detect_duplicate_documents(
        documents
    )

    # -----------------------------------------
    # DETECT CONFLICTS
    # -----------------------------------------

    conflicts = detect_conflicts(
        documents
    )

    return {
        "total_documents": len(timeline),
        "timeline": timeline,
        "duplicates": duplicates,
        "conflicts": conflicts
    }