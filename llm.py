import os
from typing import Optional

from dotenv import load_dotenv
from openai import OpenAI

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

    response = client.responses.create(
        model=MODEL,
        instructions=SYSTEM_PROMPT,
        input=instruction
    )

    return response.output_text


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