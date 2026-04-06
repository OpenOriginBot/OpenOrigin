from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import LogEntry as LogEntryModel
from app.schemas.schemas import LogEntryCreate, LogEntryResponse

router = APIRouter(prefix="/logs", tags=["logs"])


@router.get("/", response_model=list[LogEntryResponse])
def list_logs(category: str = None, limit: int = 50, db: Session = Depends(get_db)):
    query = select(LogEntryModel).order_by(LogEntryModel.time.desc()).limit(limit)
    if category:
        query = query.where(LogEntryModel.category == category)
    result = db.execute(query)
    logs = result.scalars().all()
    return logs


@router.post("/", response_model=LogEntryResponse, status_code=201)
def create_log(data: LogEntryCreate, db: Session = Depends(get_db)):
    log = LogEntryModel(**data.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
