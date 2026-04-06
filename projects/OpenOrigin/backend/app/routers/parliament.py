from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import ParliamentSession as SessionModel, Participant, ParliamentMessage
from app.schemas.schemas import (
    ParliamentSessionCreate, ParliamentSessionResponse,
    ParticipantCreate, ParliamentMessageCreate
)

router = APIRouter(prefix="/parliament", tags=["parliament"])


@router.get("/", response_model=list[ParliamentSessionResponse])
def list_sessions(db: Session = Depends(get_db)):
    result = db.execute(
        select(SessionModel)
        .options(joinedload(SessionModel.participants), joinedload(SessionModel.messages))
        .order_by(SessionModel.id.desc())
    )
    sessions = result.unique().scalars().all()
    return sessions


@router.get("/{session_id}", response_model=ParliamentSessionResponse)
def get_session(session_id: int, db: Session = Depends(get_db)):
    result = db.execute(
        select(SessionModel)
        .options(joinedload(SessionModel.participants), joinedload(SessionModel.messages))
        .where(SessionModel.id == session_id)
    )
    session = result.unique().scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/", response_model=ParliamentSessionResponse, status_code=201)
def create_session(data: ParliamentSessionCreate, db: Session = Depends(get_db)):
    session = SessionModel(question=data.question, status=data.status)
    db.add(session)
    db.flush()

    for p_data in data.participants:
        participant = Participant(session_id=session.id, **p_data.model_dump())
        db.add(participant)

    for m_data in data.messages:
        message = ParliamentMessage(session_id=session.id, **m_data.model_dump())
        db.add(message)

    db.commit()
    db.refresh(session)
    return session


@router.post("/{session_id}/messages", status_code=201)
def add_message(session_id: int, data: ParliamentMessageCreate, db: Session = Depends(get_db)):
    result = db.execute(select(SessionModel).where(SessionModel.id == session_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Session not found")
    message = ParliamentMessage(session_id=session_id, **data.model_dump())
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
