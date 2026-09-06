import os

import pytesseract

from PIL import Image, ImageEnhance
from pypdf import PdfReader


# -----------------------------------------
# OCR LANGUAGE MAPPING
# -----------------------------------------

def get_ocr_language(
    language: str
) -> str:
    """
    Convert MediKiosk language names
    into Tesseract language codes.
    """

    languages = {
        "English": "eng",
        "Hindi": "eng+hin",
        "Marathi": "eng+mar",
        "Gujarati": "eng+guj"
    }

    return languages.get(
        language,
        "eng"
    )


# -----------------------------------------
# IMAGE OCR
# -----------------------------------------

def extract_text_from_image(
    file_path: str,
    language: str = "eng"
) -> str:
    """
    Extract text from an image using
    preprocessing + Tesseract OCR.
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    image = Image.open(file_path)

    # Convert to RGB
    image = image.convert("RGB")

    # -----------------------------------------
    # UPSCALE
    # -----------------------------------------

    width, height = image.size

    image = image.resize(
        (
            width * 2,
            height * 2
        )
    )

    # -----------------------------------------
    # GRAYSCALE
    # -----------------------------------------

    gray = image.convert("L")

    # -----------------------------------------
    # CONTRAST
    # -----------------------------------------

    contrast = ImageEnhance.Contrast(
        gray
    )

    gray = contrast.enhance(2.0)

    # -----------------------------------------
    # SHARPEN
    # -----------------------------------------

    sharpness = ImageEnhance.Sharpness(
        gray
    )

    gray = sharpness.enhance(2.0)

    # -----------------------------------------
    # OCR
    # -----------------------------------------

    text = pytesseract.image_to_string(
        gray,
        lang=language,
        config="--psm 6"
    )

    return text.strip()


# -----------------------------------------
# PDF TEXT EXTRACTION
# -----------------------------------------

def extract_text_from_pdf(
    file_path: str
) -> str:
    """
    Extract text from a PDF that already
    contains selectable text.
    """

    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    reader = PdfReader(file_path)

    extracted_text = []

    for page in reader.pages:

        text = page.extract_text()

        if text:
            extracted_text.append(text)

    return "\n".join(
        extracted_text
    ).strip()


# -----------------------------------------
# MAIN EXTRACTION FUNCTION
# -----------------------------------------

def extract_text(
    file_path: str,
    language: str = "English"
) -> str:
    """
    Automatically select the extraction
    method based on file type and language.
    """

    extension = os.path.splitext(
        file_path
    )[1].lower()

    if extension in [
        ".jpg",
        ".jpeg",
        ".png",
        ".tiff",
        ".tif"
    ]:

        ocr_language = get_ocr_language(
            language
        )

        return extract_text_from_image(
            file_path,
            language=ocr_language
        )

    if extension == ".pdf":

        return extract_text_from_pdf(
            file_path
        )

    raise ValueError(
        "Unsupported file type. "
        "Use JPG, JPEG, PNG, TIFF, or PDF."
    )