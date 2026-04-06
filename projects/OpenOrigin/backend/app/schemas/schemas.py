from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


# ─── Enums ─────────────────────────────────────────────────────────────────────
class AgentStatus(str, Enum):
    ONLINE = "online"
    IDLE = "idle"
    ERROR = "error"
    OFFLINE = "offline"


class TaskStatus(str, Enum):
    TODO = "todo"
    PROGRESS = "progress"
    INPUT = "input"
    DONE = "done"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class LogCategory(str, Enum):
    GENERAL = "general"
    OBSERVATION = "observation"
    REMINDER = "reminder"
    FYI = "fyi"
    ALERT = "alert"


class Stance(str, Enum):
    IN_FAVOR = "in_favor"
    AGAINST = "against"
    CONDITIONAL = "conditional"


class ParticipantStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class SessionStatus(str, Enum):
    DELIBERATING = "deliberating"
    VOTING = "voting"
    CONCLUDED = "concluded"


class MeetingType(str, Enum):
    STANDUP = "standup"
    SALES = "sales"
    PLANNING = "planning"
    ONEONONE = "1on1"
    EXTERNAL = "external"
    ALLHANDS = "all-hands"
    TEAM = "team"


class Sentiment(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


# ─── Agent ─────────────────────────────────────────────────────────────────────
class AgentBase(BaseModel):
    id: str
    emoji: str = "🤖"
    name: str
    subtitle: Optional[str] = None
    type: Optional[str] = None
    role: Optional[str] = None
    color: str = "#10b981"
    status: AgentStatus = AgentStatus.OFFLINE
    current_activity: Optional[str] = None
    last_seen: Optional[datetime] = None
    completed_tasks: int = 0
    accuracy: float = 0.0
    skills: list[str] = []


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    emoji: Optional[str] = None
    name: Optional[str] = None
    subtitle: Optional[str] = None
    type: Optional[str] = None
    role: Optional[str] = None
    color: Optional[str] = None
    status: Optional[AgentStatus] = None
    current_activity: Optional[str] = None
    last_seen: Optional[datetime] = None
    completed_tasks: Optional[int] = None
    accuracy: Optional[float] = None
    skills: Optional[list[str]] = None


class AgentResponse(AgentBase):
    class Config:
        from_attributes = True


# ─── Task ──────────────────────────────────────────────────────────────────────
class TaskBase(BaseModel):
    title: str
    agent_id: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    col: TaskStatus = TaskStatus.TODO
    progress: int = 0


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    agent_id: Optional[str] = None
    priority: Optional[Priority] = None
    col: Optional[TaskStatus] = None
    progress: Optional[int] = None


class TaskResponse(TaskBase):
    id: int
    agent: Optional[AgentResponse] = None

    class Config:
        from_attributes = True


# ─── LogEntry ──────────────────────────────────────────────────────────────────
class LogEntryBase(BaseModel):
    agent_id: Optional[str] = None
    agent: Optional[str] = None
    category: LogCategory = LogCategory.GENERAL
    message: str
    time: Optional[datetime] = None


class LogEntryCreate(LogEntryBase):
    pass


class LogEntryResponse(LogEntryBase):
    id: int

    class Config:
        from_attributes = True


# ─── Parliament ────────────────────────────────────────────────────────────────
class ParticipantBase(BaseModel):
    agent: Optional[str] = None
    name: str
    stance: Stance = Stance.CONDITIONAL
    status: ParticipantStatus = ParticipantStatus.ACTIVE


class ParticipantCreate(ParticipantBase):
    session_id: Optional[int] = None


class ParticipantResponse(ParticipantBase):
    id: int
    session_id: int

    class Config:
        from_attributes = True


class ParliamentMessageBase(BaseModel):
    agent: Optional[str] = None
    name: str
    text: str
    time: Optional[datetime] = None


class ParliamentMessageCreate(ParliamentMessageBase):
    session_id: Optional[int] = None


class ParliamentMessageResponse(ParliamentMessageBase):
    id: int
    session_id: int

    class Config:
        from_attributes = True


class ParliamentSessionBase(BaseModel):
    question: str
    status: SessionStatus = SessionStatus.DELIBERATING


class ParliamentSessionCreate(ParliamentSessionBase):
    participants: list[ParticipantCreate] = []
    messages: list[ParliamentMessageCreate] = []


class ParliamentSessionResponse(ParliamentSessionBase):
    id: int
    participants: list[ParticipantResponse] = []
    messages: list[ParliamentMessageResponse] = []

    class Config:
        from_attributes = True


# ─── Meeting ──────────────────────────────────────────────────────────────────
class ActionItemBase(BaseModel):
    task: str
    assignee: Optional[str] = None
    done: bool = False


class ActionItemCreate(ActionItemBase):
    meeting_id: Optional[int] = None


class ActionItemResponse(ActionItemBase):
    id: int
    meeting_id: int

    class Config:
        from_attributes = True


class MeetingBase(BaseModel):
    title: str
    date: Optional[datetime] = None
    duration_minutes: int = 0
    meeting_type: Optional[MeetingType] = None
    participants: list[str] = []
    summary: Optional[str] = None
    ai_insights: Optional[str] = None
    has_external_participants: bool = False
    external_domains: list[str] = []
    sentiment: Sentiment = Sentiment.NEUTRAL


class MeetingCreate(MeetingBase):
    action_items: list[ActionItemCreate] = []


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    meeting_type: Optional[MeetingType] = None
    participants: Optional[list[str]] = None
    summary: Optional[str] = None
    ai_insights: Optional[str] = None
    has_external_participants: Optional[bool] = None
    external_domains: Optional[list[str]] = None
    sentiment: Optional[Sentiment] = None


class MeetingResponse(MeetingBase):
    id: int
    action_items: list[ActionItemResponse] = []

    class Config:
        from_attributes = True


class MeetingStatsResponse(BaseModel):
    total: int
    this_week: int
    open_actions: int
    avg_duration: float


class HealthResponse(BaseModel):
    status: str
    database: str
    version: str
