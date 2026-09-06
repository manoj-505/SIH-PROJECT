from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
    Form
)
import os
import tempfile
from .schemas import (
    StartSessionRequest,
    StartSessionResponse,
    ChatRequest,
    ChatResponse,
    SummaryResponse,
    Patient,
    DocumentTimelineRequest

)

from .conversation import (
    create_session,
    get_session,
    add_message,
    detect_complaint,
    set_complaint,
    get_next_field,
    set_current_field,
    save_current_answer,
    start_ayush_assessment,
    get_next_ayush_field,
    set_current_ayush_field,
    save_ayush_answer,
    add_extracted_document_information
)
from .ocr import extract_text
from .document_extraction import (
    extract_medical_information
)
from .safety import (
    check_red_flags,
    safety_message
)

from .conversation import load_ontology
from .medical_timeline import build_medical_timeline
from .llm import generate_document_history_summary
from .llm import generate_chat_response
from .summary import create_clinical_summary


app = FastAPI(
    title="MediKiosk AI Clinical Intake API",
    description=(
        "AI-assisted clinical history "
        "collection system for MediKiosk."
    ),
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "application": "MediKiosk",
        "message": "MediKiosk AI API is running",
        "status": "online"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post(
    "/session/start",
    response_model=StartSessionResponse
)
def start_session(request: StartSessionRequest):

    patient = Patient(
        name=request.name,
        age=request.age,
        sex=request.sex,
        language=request.language
    )

    session_id = create_session(patient)

    message = (
        f"Hello {request.name or 'there'}. "
        "I will ask you a few questions about "
        "your health. Please describe what "
        "brings you to the hospital today."
    )

    add_message(
        session_id,
        "assistant",
        message
    )

    return StartSessionResponse(
        session_id=session_id,
        message=message
    )


@app.post(
    "/chat",
    response_model=ChatResponse
)
def chat(request: ChatRequest):

    session = get_session(request.session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    # -------------------------------------------------
    # SAVE PATIENT MESSAGE
    # -------------------------------------------------

    add_message(
        request.session_id,
        "patient",
        request.message
    )

    # -------------------------------------------------
    # AYUSH ASSESSMENT IS ACTIVE
    # -------------------------------------------------

    if session.get("ayush_active", False):

        # Save answer to previous AYUSH question
        if session.get("ayush_current_field"):

            save_ayush_answer(
                request.session_id,
                request.message
            )

        # Find next AYUSH question
        next_ayush_field = get_next_ayush_field(
            request.session_id
        )

        # -------------------------------------------------
        # AYUSH ASSESSMENT COMPLETE
        # -------------------------------------------------

        if not next_ayush_field:

            session["ayush_active"] = False

            reply = (
                "Thank you. The AYUSH assessment is now "
                "complete. Your information has been "
                "recorded for review by the healthcare "
                "professional."
            )

            add_message(
                request.session_id,
                "assistant",
                reply
            )

            return ChatResponse(
                session_id=request.session_id,
                reply=reply,
                current_complaint=session[
                    "current_complaint"
                ],
                current_field=None,
                red_flags=[],
                complete=True
            )

        # -------------------------------------------------
        # ASK NEXT AYUSH QUESTION
        # -------------------------------------------------

        set_current_ayush_field(
            request.session_id,
            next_ayush_field
        )

        ayush_ontology = load_ontology("ayush")

        next_question = ayush_ontology.get(
            "questions",
            {}
        ).get(
            next_ayush_field
        )

        reply = generate_chat_response(
            patient_message=request.message,
            conversation_history=session["messages"],
            clinical_state=session["clinical_history"],
            next_question=next_question
        )

        add_message(
            request.session_id,
            "assistant",
            reply
        )

        return ChatResponse(
            session_id=request.session_id,
            reply=reply,
            current_complaint=session[
                "current_complaint"
            ],
            current_field=next_ayush_field,
            red_flags=[],
            complete=False
        )

    # -------------------------------------------------
    # NORMAL CLINICAL HISTORY
    # -------------------------------------------------

    if not session["current_complaint"]:

        complaint = detect_complaint(
            request.message
        )

        set_complaint(
            request.session_id,
            complaint
        )

    else:

        save_current_answer(
            request.session_id,
            request.message
        )

    complaint = session["current_complaint"]

    # -------------------------------------------------
    # RED FLAG CHECK
    # -------------------------------------------------

    red_flags = check_red_flags(
        request.message,
        complaint
    )

    if red_flags:

        for flag in red_flags:

            session["red_flags"].append(
                flag.model_dump()
            )

        reply = safety_message()

        add_message(
            request.session_id,
            "assistant",
            reply
        )

        return ChatResponse(
            session_id=request.session_id,
            reply=reply,
            current_complaint=complaint,
            current_field=session[
                "current_field"
            ],
            red_flags=red_flags,
            complete=False
        )

    # -------------------------------------------------
    # NORMAL CLINICAL QUESTIONS
    # -------------------------------------------------

    ontology = load_ontology(
        complaint
    )

    next_field = get_next_field(
        request.session_id
    )

    if next_field:

        set_current_field(
            request.session_id,
            next_field
        )

    next_question = None

    if next_field:

        next_question = ontology.get(
            "questions",
            {}
        ).get(
            next_field
        )

    # -------------------------------------------------
    # CHECK WHETHER NORMAL HISTORY IS COMPLETE
    # -------------------------------------------------

    remaining_field = get_next_field(
        request.session_id
    )

    if remaining_field is None:

        # Start AYUSH assessment
        start_ayush_assessment(
            request.session_id
        )

        first_ayush_field = get_next_ayush_field(
            request.session_id
        )

        if first_ayush_field:

            set_current_ayush_field(
                request.session_id,
                first_ayush_field
            )

            ayush_ontology = load_ontology(
                "ayush"
            )

            ayush_question = ayush_ontology.get(
                "questions",
                {}
            ).get(
                first_ayush_field
            )

            reply = (
                "Thank you. I have recorded your "
                "general health information. "
                "Now I will ask a few additional "
                "questions used for the AYUSH "
                "assessment.\n\n"
                + ayush_question
            )

            add_message(
                request.session_id,
                "assistant",
                reply
            )

            return ChatResponse(
                session_id=request.session_id,
                reply=reply,
                current_complaint=complaint,
                current_field=first_ayush_field,
                red_flags=[],
                complete=False
            )

    # -------------------------------------------------
    # GENERATE NORMAL RESPONSE
    # -------------------------------------------------

    try:

        reply = generate_chat_response(
            patient_message=request.message,
            conversation_history=session["messages"],
            clinical_state=session["clinical_history"],
            next_question=next_question
        )

    except RuntimeError as error:

        if "rate limit" in str(error).lower():

            raise HTTPException(
                status_code=429,
                detail=(
                    "AI service rate limit reached. "
                    "Please try again later."
                )
            )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    add_message(
        request.session_id,
        "assistant",
        reply
    )

    return ChatResponse(
        session_id=request.session_id,
        reply=reply,
        current_complaint=complaint,
        current_field=next_field,
        red_flags=red_flags,
        complete=False
    )
@app.post(
    "/summary",
    response_model=SummaryResponse
)
def summary(request: ChatRequest):

    session = get_session(
        request.session_id
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    summary_text = create_clinical_summary(
        session
    )

    return SummaryResponse(
        session_id=request.session_id,
        summary=summary_text,
        clinical_history=session["clinical_history"],
        red_flags=session["red_flags"],
        requires_doctor_review=True
    )
@app.post("/documents/ocr")
async def ocr_document(
    file: UploadFile = File(...),
    language: str = Form("English")
):
    """
    Upload a document and extract text using OCR.
    """

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".tiff",
        ".tif",
        ".pdf"
    }

    filename = file.filename or ""

    extension = os.path.splitext(
        filename
    )[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Use JPG, JPEG, PNG, TIFF, or PDF."
            )
        )

    contents = await file.read()

    temp_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension
        ) as temp_file:

            temp_file.write(contents)

            temp_path = temp_file.name

        extracted_text = extract_text(
            temp_path,
            language=language
        )

        return {
            "filename": filename,
            "document_type": extension.replace(
                ".",
                ""
            ),
            "language": language,
            "text": extracted_text
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(error)}"
        )

    finally:

        if temp_path and os.path.exists(
            temp_path
        ):
            os.remove(temp_path)
@app.post("/documents/process")
async def process_document(
    session_id: str,
    file: UploadFile = File(...),
    language: str = Form("English")
):
    """
    Upload a medical document,
    extract its text using OCR,
    and structure the information using AI.
    """

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".tiff",
        ".tif",
        ".pdf"
    }

    filename = file.filename or ""
    session = get_session(session_id)

    if not session:

        raise HTTPException(
        status_code=404,
        detail="Session not found."
    )
    extension = os.path.splitext(
        filename
    )[1].lower()

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Use JPG, JPEG, PNG, TIFF, or PDF."
            )
        )

    contents = await file.read()

    temp_path = None

    try:

        # -----------------------------------------
        # SAVE TEMPORARY FILE
        # -----------------------------------------

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=extension
        ) as temp_file:

            temp_file.write(contents)

            temp_path = temp_file.name

        # -----------------------------------------
        # OCR
        # -----------------------------------------

        extracted_text = extract_text(
            temp_path,
            language=language
        )

        if not extracted_text:

            raise HTTPException(
                status_code=422,
                detail=(
                    "No readable text was found "
                    "in the document."
                )
            )

        # -----------------------------------------
        # AI MEDICAL EXTRACTION
        # -----------------------------------------

        try:

            medical_information = extract_medical_information(
                ocr_text=extracted_text,
                image_path=temp_path
            )

        except RuntimeError as error:

            if "rate limit" in str(error).lower():

                raise HTTPException(
                    status_code=429,
                    detail=(
                        "AI service rate limit reached. "
                        "Please try again later."
                    )
                )

            raise
        add_extracted_document_information(
            session_id=session_id,
            filename=filename,
            extracted_text=extracted_text,
            medical_information=medical_information.model_dump()
    )
        # -----------------------------------------
        # RETURN RESULT
        # -----------------------------------------

        return {
            "filename": filename,
            "document_type": extension.replace(
                ".",
                ""
            ),
            "ocr_text": extracted_text,
            "medical_information":
                medical_information.model_dump()
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Document processing failed: "
                f"{str(error)}"
            )
        )

    finally:

        if temp_path and os.path.exists(
            temp_path
        ):

            os.remove(temp_path)
@app.post("/documents/timeline/upload")
async def generate_document_timeline_from_uploads(
    files: list[UploadFile] = File(
        ...,
        description="Upload one or more medical documents"
    ),
    language: str = Form(
        "English",
        description="OCR language"
    )
):
    """
    Upload multiple medical documents and automatically:

    1. OCR the documents
    2. Extract medical information
    3. Build chronological timeline
    4. Detect duplicates
    5. Detect conflicts
    6. Generate physician summary
    """

    if not files:
        raise HTTPException(
            status_code=400,
            detail="No medical documents uploaded."
        )

    processed_documents = []

    for file in files:

        filename = file.filename or "unknown_document"

        suffix = os.path.splitext(filename)[1].lower()

        if suffix not in [
            ".jpg",
            ".jpeg",
            ".png",
            ".tiff",
            ".tif",
            ".pdf"
        ]:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {filename}"
            )

        contents = await file.read()

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_file.write(contents)
            temp_path = temp_file.name

        try:

            # -----------------------------
            # OCR
            # -----------------------------

            extracted_text = extract_text(
                temp_path,
                language=language
            )

            # -----------------------------
            # AI MEDICAL EXTRACTION
            # -----------------------------

            try:
                medical_information = extract_medical_information(
                    ocr_text=extracted_text,
                    image_path=(
                        temp_path
                        if suffix != ".pdf"
                        else None
                    )
                )

            except RuntimeError as e:

                if "rate limit" in str(e).lower():

                    raise HTTPException(
                        status_code=429,
                        detail="AI service rate limit reached. Please try again later."
                    )

                raise

            processed_documents.append({
                "filename": filename,
                "extracted_text": extracted_text,
                "medical_information":
                    medical_information.model_dump()
            })

        finally:

            if os.path.exists(temp_path):
                os.remove(temp_path)

    # -----------------------------
    # BUILD TIMELINE
    # -----------------------------

    timeline = build_medical_timeline(
        processed_documents
    )

    # -----------------------------
    # PHYSICIAN SUMMARY
    # -----------------------------

    summary = generate_document_history_summary(
        timeline["timeline"]
    )

    return {
        "total_documents":
            timeline["total_documents"],

        "timeline":
            timeline["timeline"],

        "duplicates":
            timeline["duplicates"],

        "conflicts":
            timeline["conflicts"],

        "physician_summary":
            summary
    }