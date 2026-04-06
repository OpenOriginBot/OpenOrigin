from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.models import Meeting as MeetingModel, ActionItem as ActionItemModel
from app.schemas.schemas import (
    MeetingCreate, MeetingUpdate, MeetingResponse,
    ActionItemCreate, ActionItemResponse, MeetingStatsResponse
)

router = APIRouter(prefix="/meetings", tags=["meetings"])


@router.get("/", response_model=list[MeetingResponse])
def list_meetings(meeting_type: str = None, db: Session = Depends(get_db)):
    query = select(MeetingModel).options(joinedload(MeetingModel.action_items))
    if meeting_type:
        query = query.where(MeetingModel.meeting_type == meeting_type)
    result = db.execute(query.order_by(MeetingModel.date.desc()))
    meetings = result.unique().scalars().all()
    return meetings


@router.get("/stats/", response_model=MeetingStatsResponse)
def meeting_stats(db: Session = Depends(get_db)):
    total = db.execute(select(func.count(MeetingModel.id))).scalar() or 0
    open_actions = db.execute(
        select(func.count(ActionItemModel.id)).where(ActionItemModel.done == False)
    ).scalar() or 0
    avg_duration = db.execute(
        select(func.avg(MeetingModel.duration_minutes))
    ).scalar() or 0

    return MeetingStatsResponse(
        total=total,
        this_week=0,
        open_actions=open_actions,
        avg_duration=round(float(avg_duration), 1)
    )


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    result = db.execute(
        select(MeetingModel)
        .options(joinedload(MeetingModel.action_items))
        .where(MeetingModel.id == meeting_id)
    )
    meeting = result.unique().scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.post("/", response_model=MeetingResponse, status_code=201)
def create_meeting(data: MeetingCreate, db: Session = Depends(get_db)):
    action_items_data = data.action_items
    meeting_data = data.model_dump(exclude={"action_items"})
    meeting = MeetingModel(**meeting_data)
    db.add(meeting)
    db.flush()

    for item_data in action_items_data:
        item = ActionItemModel(meeting_id=meeting.id, **item_data.model_dump())
        db.add(item)

    db.commit()
    db.refresh(meeting)
    return meeting


@router.put("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(meeting_id: int, data: MeetingUpdate, db: Session = Depends(get_db)):
    result = db.execute(select(MeetingModel).where(MeetingModel.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(meeting, key, value)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    result = db.execute(select(MeetingModel).where(MeetingModel.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()
    return None


@router.post("/{meeting_id}/action-items/", response_model=ActionItemResponse, status_code=201)
def add_action_item(meeting_id: int, data: ActionItemCreate, db: Session = Depends(get_db)):
    result = db.execute(select(MeetingModel).where(MeetingModel.id == meeting_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Meeting not found")
    item = ActionItemModel(meeting_id=meeting_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/action-items/{item_id}/toggle", response_model=ActionItemResponse)
def toggle_action_item(item_id: int, db: Session = Depends(get_db)):
    result = db.execute(select(ActionItemModel).where(ActionItemModel.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    item.done = not item.done
    db.commit()
    db.refresh(item)
    return item
