from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class AgentStatus(str, enum.Enum):
    ONLINE = "online"
    IDLE = "idle"
    ERROR = "error"
    OFFLINE = "offline"


class TaskStatus(str, enum.Enum):
    TODO = "todo"
    PROGRESS = "progress"
    INPUT = "input"
    DONE = "done"


class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class LogCategory(str, enum.Enum):
    GENERAL = "general"
    OBSERVATION = "observation"
    REMINDER = "reminder"
    FYI = "fyi"
    ALERT = "alert"


class Stance(str, enum.Enum):
    IN_FAVOR = "in_favor"
    AGAINST = "against"
    CONDITIONAL = "conditional"


class ParticipantStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class SessionStatus(str, enum.Enum):
    DELIBERATING = "deliberating"
    VOTING = "voting"
    CONCLUDED = "concluded"


class MeetingType(str, enum.Enum):
    STANDUP = "standup"
    SALES = "sales"
    PLANNING = "planning"
    ONEONONE = "1on1"
    EXTERNAL = "external"
    ALLHANDS = "all-hands"
    TEAM = "team"


class Sentiment(str, enum.Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


# ─── Agent ────────────────────────────────────────────────────────────────────
class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True)
    emoji = Column(String, default="🤖")
    name = Column(String, nullable=False)
    subtitle = Column(String)
    type = Column(String)
    role = Column(String)
    color = Column(String, default="#10b981")
    status = Column(SAEnum(AgentStatus), default=AgentStatus.OFFLINE)
    current_activity = Column(String)
    last_seen = Column(DateTime, default=datetime.utcnow)
    completed_tasks = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)
    skills = Column(JSON, default=list)

    tasks = relationship("Task", back_populates="agent")


# ─── Task ──────────────────────────────────────────────────────────────────────
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    agent_id = Column(String, ForeignKey("agents.id"), nullable=True)
    priority = Column(SAEnum(Priority), default=Priority.MEDIUM)
    col = Column(SAEnum(TaskStatus), default=TaskStatus.TODO)
    progress = Column(Integer, default=0)

    agent = relationship("Agent", back_populates="tasks")


# ─── LogEntry ──────────────────────────────────────────────────────────────────
class LogEntry(Base):
    __tablename__ = "log_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    agent_id = Column(String, nullable=True)
    agent = Column(String)
    category = Column(SAEnum(LogCategory), default=LogCategory.GENERAL)
    message = Column(Text, nullable=False)
    time = Column(DateTime, default=datetime.utcnow)


# ─── Parliament ────────────────────────────────────────────────────────────────
class ParliamentSession(Base):
    __tablename__ = "parliament_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    question = Column(Text, nullable=False)
    status = Column(SAEnum(SessionStatus), default=SessionStatus.DELIBERATING)

    participants = relationship("Participant", back_populates="session", cascade="all, delete-orphan")
    messages = relationship("ParliamentMessage", back_populates="session", cascade="all, delete-orphan")


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("parliament_sessions.id"), nullable=False)
    agent = Column(String)
    name = Column(String, nullable=False)
    stance = Column(SAEnum(Stance), default=Stance.CONDITIONAL)
    status = Column(SAEnum(ParticipantStatus), default=ParticipantStatus.ACTIVE)

    session = relationship("ParliamentSession", back_populates="participants")


class ParliamentMessage(Base):
    __tablename__ = "parliament_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("parliament_sessions.id"), nullable=False)
    agent = Column(String)
    name = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    time = Column(DateTime, default=datetime.utcnow)

    session = relationship("ParliamentSession", back_populates="messages")


# ─── Meeting ───────────────────────────────────────────────────────────────────
class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    date = Column(DateTime)
    duration_minutes = Column(Integer, default=0)
    meeting_type = Column(SAEnum(MeetingType))
    participants = Column(JSON, default=list)
    summary = Column(Text)
    ai_insights = Column(Text)
    has_external_participants = Column(Boolean, default=False)
    external_domains = Column(JSON, default=list)
    sentiment = Column(SAEnum(Sentiment), default=Sentiment.NEUTRAL)

    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    task = Column(String, nullable=False)
    assignee = Column(String)
    done = Column(Boolean, default=False)

    meeting = relationship("Meeting", back_populates="action_items")
