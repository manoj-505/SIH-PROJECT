from .llm import generate_summary


def create_clinical_summary(session):

    summary = generate_summary(
        clinical_history=session["clinical_history"],
        conversation_history=session["messages"],
        red_flags=session["red_flags"]
    )

    return summary