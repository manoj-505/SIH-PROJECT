import os
from typing import Optional

from dotenv import load_dotenv
from openai import OpenAI, RateLimitError

from .prompts import (
    SYSTEM_PROMPT,
    SUMMARY_PROMPT
)


load_dotenv()


API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")


if not API_KEY:
    raise RuntimeError(
        "OPENAI_API_KEY is missing. "
        "Add it to your .env file."
    )


client = OpenAI(
    api_key=API_KEY
)


def generate_chat_response(
    patient_message: str,
    conversation_history: list,
    clinical_state: dict,
    next_question: Optional[str] = None
):
    history_text = ""

    for message in conversation_history:
        history_text += (
            f"{message['role']}: "
            f"{message['content']}\n"
        )

    state_text = str(clinical_state)

    instruction = f"""
Clinical state:
{state_text}

Conversation:
{history_text}

Latest patient message:
{patient_message}

Suggested next clinical question:
{next_question}

Generate the next response for the patient.

Ask only ONE question at a time.

If a suggested next question is provided,
use it as the basis of the response.

Use simple patient-friendly language.

Do not diagnose.
Do not prescribe.
Do not add facts that the patient did not provide.
"""

    try:

        response = client.responses.create(
            model=MODEL,
            instructions=SYSTEM_PROMPT,
            input=instruction
        )

        return response.output_text

    except RateLimitError:

        raise RuntimeError(
            "AI service rate limit reached. "
            "Please try again later."
        )

def generate_summary(
    clinical_history: dict,
    conversation_history: list,
    red_flags: list
):

    instruction = f"""
Clinical history:

{clinical_history}

Conversation:

{conversation_history}

Potential red flags:

{red_flags}

Generate a concise physician-facing
clinical intake summary.
"""

    response = client.responses.create(
        model=MODEL,
        instructions=SUMMARY_PROMPT,
        input=instruction
    )

    return response.output_text
def generate_document_history_summary(documents: list):
    """
    Generate a concise physician-facing summary
    from previously extracted medical documents.
    """

    instruction = f"""
You are generating a physician-facing summary
of a patient's previous medical documents.

CHRONOLOGICAL MEDICAL TIMELINE:

{documents}

TASK:

Create a concise physician-facing summary that helps
a doctor understand the patient's previous medical history
quickly.

IMPORTANT RULES:

1. Use ONLY information contained in the provided documents.
2. Do NOT diagnose the patient.
3. Do NOT prescribe treatment.
4. Do NOT invent missing information.
5. Do NOT assume that unclear handwriting is correct.
6. Preserve uncertainty when information is unclear.
7. Include the chronological medical events in the summary.
8. Keep the events in chronological order when dates are available.
9. Combine repeated information where appropriate.
10. Highlight important previous medications.
11. Highlight important investigations and findings.
12. Highlight documented medical history.
13. Highlight allergies if documented.
14. Clearly identify information requiring verification.
15. Do not change dates, numbers, medication strengths,
    doses or frequencies when they are uncertain.

Use this structure:

CHRONOLOGICAL MEDICAL TIMELINE

For each documented event include:
- Date
- Document type
- Important clinical findings
- Medications
- Investigations
- Important findings

PATIENT OVERVIEW

PREVIOUS MEDICAL EVENTS

MEDICATION HISTORY

INVESTIGATION HISTORY

ALLERGIES

IMPORTANT FINDINGS

INFORMATION REQUIRING VERIFICATION

End with:

AI-generated summary — requires clinician verification.

The purpose of this summary is to reduce the time
required for a doctor to review previous documents.
"""

    response = client.responses.create(
        model=MODEL,
        instructions=SUMMARY_PROMPT,
        input=instruction
    )

    return response.output_text