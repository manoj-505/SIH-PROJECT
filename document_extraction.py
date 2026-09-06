import base64
import mimetypes

from openai import RateLimitError

from .llm import client
from .prompts import DOCUMENT_EXTRACTION_PROMPT
from .schemas import ExtractedMedicalInformation


def extract_medical_information(
    ocr_text: str,
    image_path: str = None
) -> ExtractedMedicalInformation:

    instruction = f"""
OCR TEXT:
{ocr_text}

TASK:

Extract structured medical information from
the uploaded medical document.

IMPORTANT:

The OCR text may contain errors, especially
for handwritten text.

If an image is provided, inspect the original
image directly and use it together with the OCR.

Do NOT guess unclear handwriting.

If a field cannot be read confidently:
- leave it null
- or leave the list empty
- mention the uncertainty in important_findings.

Never invent medical information.
"""

    try:

        if image_path:

            with open(image_path, "rb") as image_file:
                image_bytes = image_file.read()

            base64_image = base64.b64encode(
                image_bytes
            ).decode("utf-8")

            mime_type, _ = mimetypes.guess_type(
                image_path
            )

            if not mime_type:
                mime_type = "image/jpeg"

            image_data_url = (
                f"data:{mime_type};base64,{base64_image}"
            )

            response = client.responses.parse(
                model="gpt-5.6-luna",
                instructions=DOCUMENT_EXTRACTION_PROMPT,
                input=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_text",
                                "text": instruction
                            },
                            {
                                "type": "input_image",
                                "image_url": image_data_url,
                                "detail": "high"
                            }
                        ]
                    }
                ],
                text_format=ExtractedMedicalInformation
            )

        else:

            response = client.responses.parse(
                model="gpt-5.6-luna",
                instructions=DOCUMENT_EXTRACTION_PROMPT,
                input=instruction,
                text_format=ExtractedMedicalInformation
            )

        return response.output_parsed

    except RateLimitError:
        raise RuntimeError(
            "AI service rate limit reached. "
            "Please try again later."
        )