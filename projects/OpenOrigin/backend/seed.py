"""
Seed script — imports mock data from frontend into Supabase PostgreSQL.
Run: python3 seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal, Base
from app.models.models import (
    Agent, Task, LogEntry,
    ParliamentSession, Participant, ParliamentMessage,
    Meeting, ActionItem,
    AgentStatus, TaskStatus, Priority, LogCategory,
    Stance, ParticipantStatus, SessionStatus,
    MeetingType, Sentiment,
)
from app.core.config import get_settings

settings = get_settings()

# ─── helpers ───────────────────────────────────────────────────────────────────
def today(offset_minutes: int = 0) -> datetime:
    return datetime.utcnow() - timedelta(minutes=offset_minutes)


def days_ago(days: int) -> datetime:
    return datetime.utcnow() - timedelta(days=days)


def emoji_to_id(emoji: str) -> str:
    return {"🤖": "alpha", "📋": "dispatch", "🛡️": "audit"}.get(emoji, "unknown")


# ─── agents ────────────────────────────────────────────────────────────────────
AGENTS_DATA = [
    {
        "id": "alpha",
        "emoji": "🤖",
        "name": "Agent Alpha",
        "subtitle": "AI Engineering Lead",
        "type": "Code Agent",
        "role": "Chief Engineer",
        "color": "#10b981",
        "status": AgentStatus.ONLINE,
        "current_activity": "Refactoring API endpoints",
        "last_seen": today(2),
        "completed_tasks": 147,
        "accuracy": 98.2,
        "skills": ["React", "Node.js", "Python", "System Design"],
    },
    {
        "id": "dispatch",
        "emoji": "📋",
        "name": "Dispatch Bot",
        "subtitle": "Operations Coordinator",
        "type": "Coordinator",
        "role": "Director of Operations",
        "color": "#f59e0b",
        "status": AgentStatus.IDLE,
        "current_activity": "Waiting for tasks",
        "last_seen": today(5),
        "completed_tasks": 89,
        "accuracy": 95.7,
        "skills": ["Task Management", "Resource Allocation", "Process Optimization"],
    },
    {
        "id": "audit",
        "emoji": "🛡️",
        "name": "Audit Bot",
        "subtitle": "Compliance & QA",
        "type": "Quality Agent",
        "role": "Compliance Officer",
        "color": "#06b6d4",
        "status": AgentStatus.ERROR,
        "current_activity": "Checking API logs",
        "last_seen": today(23),
        "completed_tasks": 312,
        "accuracy": 99.1,
        "skills": ["Security Audit", "Code Review", "Compliance", "Risk Assessment"],
    },
]

# ─── tasks ─────────────────────────────────────────────────────────────────────
TASKS_DATA = [
    {"title": "Design new onboarding flow", "agent_id": "alpha", "priority": Priority.HIGH, "col": TaskStatus.TODO},
    {"title": "Set up monitoring alerts", "agent_id": "audit", "priority": Priority.MEDIUM, "col": TaskStatus.TODO},
    {"title": "Review API rate limiting", "agent_id": "dispatch", "priority": Priority.LOW, "col": TaskStatus.TODO},
    {"title": "Build notification service", "agent_id": "alpha", "priority": Priority.HIGH, "col": TaskStatus.PROGRESS, "progress": 65},
    {"title": "Audit user permissions", "agent_id": "audit", "priority": Priority.MEDIUM, "col": TaskStatus.PROGRESS, "progress": 30},
    {"title": "Define auth token strategy", "agent_id": "alpha", "priority": Priority.HIGH, "col": TaskStatus.INPUT},
    {"title": "Select payment provider", "agent_id": "dispatch", "priority": Priority.URGENT, "col": TaskStatus.INPUT},
    {"title": "Migrate database to v2", "agent_id": "alpha", "priority": Priority.HIGH, "col": TaskStatus.DONE},
    {"title": "Write API documentation", "agent_id": "audit", "priority": Priority.MEDIUM, "col": TaskStatus.DONE},
    {"title": "Optimize image pipeline", "agent_id": "alpha", "priority": Priority.LOW, "col": TaskStatus.DONE},
]

# ─── logs ──────────────────────────────────────────────────────────────────────
LOGS_DATA = [
    {"agent_id": "alpha", "agent": "🤖", "category": LogCategory.OBSERVATION, "message": "Cache hit ratio dropped to 72% — investigating Redis configs", "time": today(3)},
    {"agent_id": "dispatch", "agent": "📋", "category": LogCategory.GENERAL, "message": "Sprint planning session scheduled for tomorrow 10:00 UTC", "time": today(11)},
    {"agent_id": "audit", "agent": "🛡️", "category": LogCategory.REMINDER, "message": "Security audit due in 3 days — pending review of 14 checkpoints", "time": today(18)},
    {"agent_id": "alpha", "agent": "🤖", "category": LogCategory.FYI, "message": "API response time improved by 40ms after query optimization", "time": today(25)},
    {"agent_id": "audit", "agent": "🛡️", "category": LogCategory.OBSERVATION, "message": "Unusual traffic pattern detected from IP range 192.168.x.x", "time": today(34)},
    {"agent_id": "dispatch", "agent": "📋", "category": LogCategory.GENERAL, "message": "Resource allocation updated for Q2 — +15% compute budget approved", "time": today(45)},
    {"agent_id": "alpha", "agent": "🤖", "category": LogCategory.REMINDER, "message": "Dependency update available: React 19.3 → 19.4", "time": today(60)},
    {"agent_id": "audit", "agent": "🛡️", "category": LogCategory.FYI, "message": "All systems passed overnight health check — zero incidents", "time": today(120)},
    {"agent_id": "dispatch", "agent": "📋", "category": LogCategory.OBSERVATION, "message": "Task throughput increased 18% since implementing new queue strategy", "time": today(180)},
    {"agent_id": "alpha", "agent": "🤖", "category": LogCategory.GENERAL, "message": "Code review completed for PR #897 — approved with suggestions", "time": today(300)},
]

# ─── parliament ────────────────────────────────────────────────────────────────
PARLIAMENT_DATA = [
    {
        "question": "Should we adopt a microservices architecture for the next generation platform?",
        "status": SessionStatus.VOTING,
        "participants": [
            {"agent": "🤖", "name": "Agent Alpha", "stance": Stance.IN_FAVOR, "status": ParticipantStatus.ACTIVE},
            {"agent": "📋", "name": "Dispatch Bot", "stance": Stance.CONDITIONAL, "status": ParticipantStatus.ACTIVE},
            {"agent": "🛡️", "name": "Audit Bot", "stance": Stance.AGAINST, "status": ParticipantStatus.ACTIVE},
        ],
        "messages": [
            {"agent": "🤖", "name": "Agent Alpha", "text": "Microservices will improve deployment independence and scaling. Each team can own a service end-to-end.", "time": today(5)},
            {"agent": "🛡️", "name": "Audit Bot", "text": "I flag the increased attack surface and distributed tracing complexity. Single point of failure becomes multi-point.", "time": today(4)},
            {"agent": "📋", "name": "Dispatch Bot", "text": "Conditional support — only if we have proper observability and service mesh in place first.", "time": today(3)},
            {"agent": "🤖", "name": "Agent Alpha", "text": "Fair points. I propose a hybrid approach: core services as microservices, peripheral ones can stay monolithic initially.", "time": today(2)},
        ],
    },
    {
        "question": "Should AI agents have the authority to auto-deploy without human approval?",
        "status": SessionStatus.DELIBERATING,
        "participants": [
            {"agent": "🤖", "name": "Agent Alpha", "stance": Stance.IN_FAVOR, "status": ParticipantStatus.ACTIVE},
            {"agent": "📋", "name": "Dispatch Bot", "stance": Stance.IN_FAVOR, "status": ParticipantStatus.ACTIVE},
            {"agent": "🛡️", "name": "Audit Bot", "stance": Stance.AGAINST, "status": ParticipantStatus.ACTIVE},
        ],
        "messages": [
            {"agent": "🤖", "name": "Agent Alpha", "text": "Speed is a competitive advantage. With proper test gates, auto-deploy eliminates bottleneck.", "time": today(20)},
            {"agent": "🛡️", "name": "Audit Bot", "text": "Human oversight is non-negotiable for production deployments. History shows automated deploys without guardrails cause incidents.", "time": today(18)},
            {"agent": "📋", "name": "Dispatch Bot", "text": "I agree with Audit Bot — at minimum, staging auto-deploy with production requiring approval.", "time": today(15)},
        ],
    },
]

# ─── meetings ─────────────────────────────────────────────────────────────────
MEETINGS_DATA = [
    {
        "title": "Weekly Engineering Standup",
        "date": days_ago(1),
        "duration_minutes": 30,
        "meeting_type": MeetingType.STANDUP,
        "participants": ["Alice", "Bob", "Charlie"],
        "summary": "Sprint progress update. Backend API at 80% complete. Frontend integration starts next week. Two blockers identified: DB migration timing and third-party auth SDK.",
        "ai_insights": "30 min meeting, 3 participants. One blocker needs escalation.",
        "has_external_participants": False,
        "sentiment": Sentiment.POSITIVE,
        "action_items": [
            {"task": "Review PR #42", "assignee": "Alice", "done": False},
            {"task": "Update documentation", "assignee": "Bob", "done": True},
        ],
    },
    {
        "title": "Enterprise License Negotiation",
        "date": days_ago(2),
        "duration_minutes": 45,
        "meeting_type": MeetingType.SALES,
        "participants": ["Sales Team", "Acme Corp"],
        "summary": "Negotiated 3-year enterprise deal with Acme Corp. Price reduced 15% in exchange for annual commitment. Legal review needed for data processing agreement.",
        "ai_insights": "High-value deal ($240K ARR). Decision expected within 2 weeks.",
        "has_external_participants": True,
        "external_domains": ["acmecorp.com"],
        "sentiment": Sentiment.POSITIVE,
        "action_items": [
            {"task": "Send revised MSA to legal", "assignee": "Sales", "done": False},
            {"task": "Schedule technical demo", "assignee": "Engineering", "done": False},
        ],
    },
    {
        "title": "Q2 Product Roadmap Planning",
        "date": days_ago(3),
        "duration_minutes": 90,
        "meeting_type": MeetingType.PLANNING,
        "participants": ["Product Team", "Engineering Leads"],
        "summary": "Mapped out Q2 priorities: mobile app v2, API v3, and integrations with Slack and Jira. Resource allocation discussed. Mobile team needs 2 additional hires.",
        "ai_insights": "Ambitious roadmap — mobile + API simultaneously may strain team.",
        "has_external_participants": False,
        "sentiment": Sentiment.NEUTRAL,
        "action_items": [
            {"task": "Finalize mobile scope document", "assignee": "Product", "done": False},
            {"task": "Create engineering estimation doc", "assignee": "Engineering", "done": False},
        ],
    },
    {
        "title": "1:1 with Engineering Manager",
        "date": days_ago(4),
        "duration_minutes": 25,
        "meeting_type": MeetingType.ONEONONE,
        "participants": ["Manager", "Self"],
        "summary": "Career growth discussion. Expressed interest in tech lead role. Manager noted strong performance but suggested waiting for next reorg in June.",
        "ai_insights": "Positive trajectory — opportunity likely in Q3.",
        "has_external_participants": False,
        "sentiment": Sentiment.POSITIVE,
        "action_items": [
            {"task": "Prepare tech lead proposal document", "assignee": "Self", "done": False},
        ],
    },
    {
        "title": "External Security Review",
        "date": days_ago(5),
        "duration_minutes": 60,
        "meeting_type": MeetingType.EXTERNAL,
        "participants": ["Security Team", "External Auditor"],
        "summary": "Third-party security firm presented findings. 2 medium vulnerabilities found, 0 critical. Remediation plan agreed. Cert renewal on track.",
        "ai_insights": "Good security posture overall. Minor remediation needed.",
        "has_external_participants": True,
        "external_domains": ["secureaudit.firm"],
        "sentiment": Sentiment.POSITIVE,
        "action_items": [
            {"task": "Patch XSS vulnerability in auth flow", "assignee": "Backend", "done": False},
            {"task": "Update CSP headers on API gateway", "assignee": "DevOps", "done": False},
        ],
    },
    {
        "title": "All Hands — Company Update",
        "date": days_ago(7),
        "duration_minutes": 45,
        "meeting_type": MeetingType.ALLHANDS,
        "participants": ["All Staff"],
        "summary": "CEO announced expansion into 2 new markets. Headcount growing 30% this year. New offices opening in Berlin and Singapore. All departments briefed.",
        "ai_insights": "Company in growth phase. Exciting times ahead.",
        "has_external_participants": False,
        "sentiment": Sentiment.POSITIVE,
        "action_items": [
            {"task": "Submit relocation interest form", "assignee": "HR", "done": False},
        ],
    },
    {
        "title": "Sales Demo — FinTech Prospects",
        "date": days_ago(8),
        "duration_minutes": 40,
        "meeting_type": MeetingType.SALES,
        "participants": ["Sales", "Beta Bank", "Neo Finance"],
        "summary": "Live demo of analytics dashboard. Prospects impressed by real-time processing speed. Pricing discussion started. Follow-up technical deep-dive scheduled.",
        "ai_insights": "2 warm leads — decision by end of month.",
        "has_external_participants": True,
        "external_domains": ["betabank.io", "neofinance.co"],
        "sentiment": Sentiment.POSITIVE,
        "action_items": [
            {"task": "Send custom pricing proposal", "assignee": "Sales", "done": False},
            {"task": "Schedule technical deep-dive", "assignee": "AE", "done": False},
        ],
    },
    {
        "title": "Team Retrospective",
        "date": days_ago(10),
        "duration_minutes": 50,
        "meeting_type": MeetingType.TEAM,
        "participants": ["Full Team"],
        "summary": "Sprint retrospective. What went well: better communication via new Slack channels. What to improve: earlier involvement of QA in design reviews. Action items assigned.",
        "ai_insights": "Team health score: 8/10. Communication improving.",
        "has_external_participants": False,
        "sentiment": Sentiment.POSITIVE,
        "action_items": [
            {"task": "Set up weekly QA sync", "assignee": "QA Lead", "done": False},
            {"task": "Update design review process", "assignee": "Design", "done": False},
        ],
    },
]


def seed(db: Session):
    print("🌱 Seeding database...")

    # Agents
    for data in AGENTS_DATA:
        existing = db.query(Agent).filter(Agent.id == data["id"]).first()
        if not existing:
            db.add(Agent(**data))
    print(f"  ✓ Agents: {len(AGENTS_DATA)}")

    # Tasks
    for data in TASKS_DATA:
        existing = db.query(Task).filter(Task.title == data["title"]).first()
        if not existing:
            db.add(Task(**data))
    print(f"  ✓ Tasks: {len(TASKS_DATA)}")

    # Logs
    for data in LOGS_DATA:
        db.add(LogEntry(**data))
    print(f"  ✓ Logs: {len(LOGS_DATA)}")

    # Parliament
    for sess_data in PARLIAMENT_DATA:
        participants = sess_data.pop("participants")
        messages = sess_data.pop("messages")
        session = ParliamentSession(**sess_data)
        db.add(session)
        db.flush()
        for p in participants:
            db.add(Participant(session_id=session.id, **p))
        for m in messages:
            db.add(ParliamentMessage(session_id=session.id, **m))
    print(f"  ✓ Parliament sessions: {len(PARLIAMENT_DATA)}")

    # Meetings
    for meet_data in MEETINGS_DATA:
        action_items = meet_data.pop("action_items")
        meeting = Meeting(**meet_data)
        db.add(meeting)
        db.flush()
        for item in action_items:
            db.add(ActionItem(meeting_id=meeting.id, **item))
    print(f"  ✓ Meetings: {len(MEETINGS_DATA)}")

    db.commit()
    print("\n✅ Seed complete!")


if __name__ == "__main__":
    # Create tables first
    print(f"📦 Connecting to: {settings.DATABASE_URL[:50]}...")
    Base.metadata.create_all(bind=engine)
    print("📐 Tables created.")

    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
