from fastapi import FastAPI, HTTPException

from .schemas import (
    StartSessionRequest,
    StartSessionResponse,
    ChatRequest,
    ChatResponse,
    SummaryResponse,
    Patient
)

from .conversation import (
    create_session,
    get_session,
    add_message,
    detect_complaint,
    set_complaint,
    get_next_field,
    set_current_field
)

from .safety import (
    check_red_flags,
    safety_message
)

from .conversation import load_ontology
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

    add_message(
        request.session_id,
        "patient",
        request.message
    )

    if not session["current_complaint"]:

        complaint = detect_complaint(
            request.message
        )

        set_complaint(
            request.session_id,
            complaint
        )

    complaint = session["current_complaint"]

    red_flags = check_red_flags(
        request.message,
        complaint
    )

    if red_flags:

        for flag in red_flags:

            session["red_flags"].append(
                flag.model_dump()
            )

    if red_flags:

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
            current_field=session["current_field"],
            red_flags=red_flags,
            complete=False
        )

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
        ).get(next_field)

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

    remaining_field = get_next_field(
        request.session_id
    )

    complete = remaining_field is None

    return ChatResponse(
        session_id=request.session_id,
        reply=reply,
        current_complaint=complaint,
        current_field=next_field,
        red_flags=red_flags,
        complete=complete
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