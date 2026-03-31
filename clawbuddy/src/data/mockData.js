import { subMinutes, subHours, subDays, format } from 'date-fns';

const now = new Date();

export const agents = [
  {
    id: 'agent-alpha',
    emoji: '🤖',
    name: 'Agent Alpha',
    subtitle: 'Code Agent',
    role: 'Chief Engineer',
    status: 'active',
    completedTasks: 142,
    accuracy: 98.5,
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'PostgreSQL'],
    accentColor: '#10b981',
    currentActivity: 'Reviewing PR #847',
    lastSeen: 'Just now',
  },
  {
    id: 'dispatch-bot',
    emoji: '📋',
    name: 'Dispatch Bot',
    subtitle: 'Coordinator',
    role: 'Operations Director',
    status: 'idle',
    completedTasks: 89,
    accuracy: 96.2,
    skills: ['Task Management', 'Resource Allocation', 'Analytics', 'Reporting'],
    accentColor: '#f59e0b',
    currentActivity: 'Scheduling sprint backlog',
    lastSeen: '5 minutes ago',
  },
  {
    id: 'audit-bot',
    emoji: '🛡️',
    name: 'Audit Bot',
    subtitle: 'Quality Agent',
    role: 'Compliance Officer',
    status: 'active',
    completedTasks: 234,
    accuracy: 99.1,
    skills: ['Security Auditing', 'Code Review', 'Compliance', 'Risk Assessment'],
    accentColor: '#06b6d4',
    currentActivity: 'Running security scan',
    lastSeen: 'Just now',
  },
];

export const recentActivity = [
  {
    id: 1,
    agent: agents[0],
    action: 'Completed code review for authentication module',
    timestamp: subMinutes(now, 2),
  },
  {
    id: 2,
    agent: agents[2],
    action: 'Detected 3 potential security vulnerabilities in API endpoints',
    timestamp: subMinutes(now, 8),
  },
  {
    id: 3,
    agent: agents[1],
    action: 'Reassigned 5 tasks based on current sprint priorities',
    timestamp: subMinutes(now, 15),
  },
  {
    id: 4,
    agent: agents[0],
    action: 'Merged PR #842 - Improved database query performance by 40%',
    timestamp: subHours(now, 1),
  },
  {
    id: 5,
    agent: agents[2],
    action: 'Generated compliance report for Q4 2025',
    timestamp: subHours(now, 2),
  },
  {
    id: 6,
    agent: agents[1],
    action: 'Scheduled 3 client meetings for next week',
    timestamp: subHours(now, 3),
  },
  {
    id: 7,
    agent: agents[0],
    action: 'Deployed v2.4.1 to production environment',
    timestamp: subHours(now, 5),
  },
  {
    id: 8,
    agent: agents[2],
    action: 'Updated security certificates for all microservices',
    timestamp: subHours(now, 8),
  },
];

export const tasks = [
  {
    id: 'task-1',
    title: 'Implement user authentication flow',
    assignedAgent: agents[0],
    progress: 75,
    priority: 'high',
    column: 'in-progress',
  },
  {
    id: 'task-2',
    title: 'Design dashboard wireframes',
    assignedAgent: agents[1],
    progress: 30,
    priority: 'medium',
    column: 'in-progress',
  },
  {
    id: 'task-3',
    title: 'Write API documentation',
    assignedAgent: agents[0],
    progress: 0,
    priority: 'low',
    column: 'todo',
  },
  {
    id: 'task-4',
    title: 'Security audit for payment module',
    assignedAgent: agents[2],
    progress: 0,
    priority: 'urgent',
    column: 'todo',
  },
  {
    id: 'task-5',
    title: 'Set up CI/CD pipeline',
    assignedAgent: agents[0],
    progress: 90,
    priority: 'high',
    column: 'in-progress',
  },
  {
    id: 'task-6',
    title: 'Client feedback integration',
    assignedAgent: agents[1],
    progress: 0,
    priority: 'medium',
    column: 'needs-input',
  },
  {
    id: 'task-7',
    title: 'Performance optimization review',
    assignedAgent: agents[2],
    progress: 0,
    priority: 'medium',
    column: 'todo',
  },
  {
    id: 'task-8',
    title: 'Database migration script',
    assignedAgent: agents[0],
    progress: 100,
    priority: 'high',
    column: 'done',
  },
  {
    id: 'task-9',
    title: 'User acceptance testing',
    assignedAgent: agents[1],
    progress: 100,
    priority: 'medium',
    column: 'done',
  },
  {
    id: 'task-10',
    title: 'Compliance certification renewal',
    assignedAgent: agents[2],
    progress: 60,
    priority: 'high',
    column: 'needs-input',
  },
];

export const aiLogs = [
  {
    id: 1,
    category: 'observation',
    agent: agents[0],
    message: 'API response times have improved by 23% after implementing caching layer',
    timestamp: subMinutes(now, 5),
  },
  {
    id: 2,
    category: 'general',
    agent: agents[1],
    message: 'Sprint velocity remains consistent at 42 story points per week',
    timestamp: subMinutes(now, 20),
  },
  {
    id: 3,
    category: 'reminder',
    agent: agents[2],
    message: 'Security certificates expire in 14 days - renewal process should be initiated',
    timestamp: subMinutes(now, 45),
  },
  {
    id: 4,
    category: 'fyi',
    agent: agents[0],
    message: 'New version of TypeScript (5.4) released - compatibility check scheduled',
    timestamp: subHours(now, 1),
  },
  {
    id: 5,
    category: 'observation',
    agent: agents[2],
    message: 'Unusual access pattern detected from IP range 192.168.1.x - monitoring closely',
    timestamp: subHours(now, 2),
  },
  {
    id: 6,
    category: 'general',
    agent: agents[1],
    message: 'Team capacity at 92% for next sprint - slight overallocation in testing phase',
    timestamp: subHours(now, 4),
  },
  {
    id: 7,
    category: 'reminder',
    agent: agents[0],
    message: 'Code freeze for v2.5.0 begins Friday at 5 PM',
    timestamp: subHours(now, 6),
  },
  {
    id: 8,
    category: 'fyi',
    agent: agents[2],
    message: 'External penetration test scheduled for next Tuesday - all teams notified',
    timestamp: subHours(now, 8),
  },
  {
    id: 9,
    category: 'observation',
    agent: agents[0],
    message: 'Memory usage on production servers trending 15% below baseline',
    timestamp: subHours(now, 12),
  },
  {
    id: 10,
    category: 'general',
    agent: agents[1],
    message: 'Client satisfaction scores updated: 4.7/5.0 (+0.2 from last month)',
    timestamp: subDays(now, 1),
  },
];

export const councilSessions = [
  {
    id: 'council-1',
    question: 'Should we prioritize migrating to a microservices architecture or focus on improving the current monolithic system?',
    status: 'active',
    participants: [
      { agent: agents[0], sent: 5, limit: 8, position: 'favor-microservices' },
      { agent: agents[1], sent: 4, limit: 8, position: 'cautious' },
      { agent: agents[2], sent: 3, limit: 8, position: 'security-first' },
    ],
    messages: [
      {
        id: 1,
        agent: agents[0],
        message: 'Microservices would allow independent scaling and deployment of components, which is crucial for our growth trajectory.',
        timestamp: subHours(now, 2),
      },
      {
        id: 2,
        agent: agents[1],
        message: 'While microservices offer benefits, the migration complexity and team learning curve could impact delivery schedules significantly.',
        timestamp: subHours(now, 1.83),
      },
      {
        id: 3,
        agent: agents[2],
        message: 'From a security perspective, microservices introduce new attack surfaces. We would need robust service mesh security before proceeding.',
        timestamp: subHours(now, 1.67),
      },
      {
        id: 4,
        agent: agents[0],
        message: 'We could start with a strangler fig pattern - gradually extracting services while maintaining the core monolith.',
        timestamp: subHours(now, 1.5),
      },
      {
        id: 5,
        agent: agents[1],
        message: 'That approach seems pragmatic. I can model the resource implications if we extract 3-4 services in the next quarter.',
        timestamp: subHours(now, 1.33),
      },
    ],
  },
  {
    id: 'council-2',
    question: 'What strategy should we adopt for handling technical debt in our fast-paced development environment?',
    status: 'completed',
    participants: [
      { agent: agents[0], sent: 6, limit: 8, position: 'allocate-20pct' },
      { agent: agents[1], sent: 5, limit: 8, position: 'kanban-bottlenecks' },
      { agent: agents[2], sent: 4, limit: 8, position: 'risk-based' },
    ],
    messages: [
      {
        id: 1,
        agent: agents[0],
        message: 'I recommend dedicating 20% of each sprint specifically to technical debt remediation.',
        timestamp: subDays(now, 1),
      },
      {
        id: 2,
        agent: agents[1],
        message: 'A dedicated debt queue with priority ordering and tackling during low-velocity periods might work better.',
        timestamp: subDays(now, 0.95),
      },
      {
        id: 3,
        agent: agents[2],
        message: 'We should prioritize debt that poses security risks or could cause production incidents.',
        timestamp: subDays(now, 0.9),
      },
    ],
  },
];

export const meetings = [
  {
    id: 'meeting-1',
    type: 'standup',
    title: 'Weekly Engineering Standup',
    date: format(subDays(now, 0), "yyyy-MM-dd'T'10:00:00'Z'"),
    duration_minutes: 30,
    participants: ['Alice Chen', 'Bob Martinez', 'Carol Williams'],
    summary: `## Weekly Engineering Standup

### Sprint Progress
- Backend API development at 80% completion
- Frontend integration testing scheduled for tomorrow
- Database migration proofs successful

### Blockers
- Waiting on design review for new dashboard components
- Third-party API credentials pending IT approval

### Next Steps
- Complete auth module by Thursday
- Begin performance testing Friday

### Notes
Team morale is high following successful deployment of v2.4.1.`,
    action_items: [
      { task: 'Review PR #847', assignee: 'Alice Chen', done: false },
      { task: 'Update API documentation', assignee: 'Bob Martinez', done: true },
      { task: 'Schedule design review', assignee: 'Carol Williams', done: false },
    ],
    ai_insights: '30 min meeting, 3 participants, positive sentiment',
    sentiment: 'positive',
    has_external_participants: false,
    external_domains: [],
  },
  {
    id: 'meeting-2',
    type: 'sales',
    title: 'Enterprise Client Discovery Call',
    date: format(subDays(now, 1), "yyyy-MM-dd'T'14:00:00'Z'"),
    duration_minutes: 45,
    participants: ['David Kim', 'Sarah Johnson'],
    summary: `## Enterprise Client Discovery Call

### Client Background
- Global logistics company with 50,000+ employees
- Current system handles 2M transactions per day
- Looking to modernize legacy Delphi systems

### Requirements
- Real-time tracking dashboard
- Multi-region deployment (APAC, EMEA, Americas)
- Strict compliance requirements (SOC2, GDPR)

### Timeline
- Decision by Q2 2026
- Pilot program with 100 users

### Next Steps
- Technical deep-dive scheduled for next week
- Security questionnaire to be sent`,
    action_items: [
      { task: 'Send security questionnaire', assignee: 'David Kim', done: false },
      { task: 'Prepare technical architecture docs', assignee: 'Sarah Johnson', done: false },
      { task: 'Set up demo environment', assignee: 'David Kim', done: false },
    ],
    ai_insights: '45 min meeting, 2 participants, high probability lead',
    sentiment: 'positive',
    has_external_participants: true,
    external_domains: ['logistics-global.com'],
  },
  {
    id: 'meeting-3',
    type: 'one-on-one',
    title: '1:1 with Engineering Manager',
    date: format(subDays(now, 2), "yyyy-MM-dd'T'11:00:00'Z'"),
    duration_minutes: 25,
    participants: ['Alice Chen', 'Mike Reynolds'],
    summary: `## 1:1 Discussion Points

### Career Development
- Discussed promotion track to Senior Engineer
- Identified leadership opportunities in upcoming projects
- Need to demonstrate cross-team collaboration

### Current Projects
- Auth module progressing well
- Opportunity to lead technical design for next feature

### Feedback
- Positive feedback on recent code reviews
- Focus on clearer documentation in PRs`,
    action_items: [
      { task: 'Draft technical design doc for next feature', assignee: 'Alice Chen', done: false },
      { task: 'Schedule mentoring session with junior devs', assignee: 'Alice Chen', done: false },
    ],
    ai_insights: '25 min meeting, focused career discussion',
    sentiment: 'positive',
    has_external_participants: false,
    external_domains: [],
  },
  {
    id: 'meeting-4',
    type: 'external',
    title: 'Partner Integration Review',
    date: format(subDays(now, 3), "yyyy-MM-dd'T'15:30:00'Z'"),
    duration_minutes: 60,
    participants: ['Platform Team', 'Integration Partner'],
    summary: `## Integration Partner Review

### Technical Progress
- OAuth 2.0 implementation 70% complete
- Webhook testing successful for 8 of 12 event types
- Rate limiting discussion completed

### Issues Resolved
- Timestamp format discrepancy fixed
- Retry logic implemented for failed webhooks

### Open Items
- Need to finalize webhook retry strategy
- Documentation review pending`,
    action_items: [
      { task: 'Complete OAuth implementation', assignee: 'Platform Team', done: false },
      { task: 'Review and approve API docs', assignee: 'Integration Partner', done: false },
      { task: 'Set up monitoring dashboards', assignee: 'Platform Team', done: false },
    ],
    ai_insights: '60 min meeting with external partner, strong progress',
    sentiment: 'positive',
    has_external_participants: true,
    external_domains: ['partner-api.io', 'integration.dev'],
  },
  {
    id: 'meeting-5',
    type: 'team',
    title: 'Product Team Sync',
    date: format(subDays(now, 4), "yyyy-MM-dd'T'09:00:00'Z'"),
    duration_minutes: 45,
    participants: ['Product Leads', 'Engineering', 'Design'],
    summary: `## Product Team Sync

### Roadmap Review
- Q2 features prioritized based on customer feedback
- Mobile app v3.0 launch moved to March 15
- Analytics dashboard MVP scope finalized

### Design Review
- New design system components approved
- Accessibility improvements required before launch

### Dependencies
- Waiting on final assets from brand team
- Translation strings due end of week`,
    action_items: [
      { task: 'Finalize analytics dashboard scope', assignee: 'Product Leads', done: false },
      { task: 'Complete accessibility audit', assignee: 'Design', done: false },
      { task: 'Submit translation tickets', assignee: 'Product Leads', done: false },
    ],
    ai_insights: '45 min team sync, Q2 roadmap alignment achieved',
    sentiment: 'neutral',
    has_external_participants: false,
    external_domains: [],
  },
  {
    id: 'meeting-6',
    type: 'standup',
    title: 'Daily Standup - Sprint 24',
    date: format(subDays(now, 5), "yyyy-MM-dd'T'09:30:00'Z'"),
    duration_minutes: 15,
    participants: ['Full Engineering Team'],
    summary: `## Daily Standup

### Updates
- 3 PRs merged
- 2 features in review
- 1 blocker escalated

### Blockers
- Need design sign-off on notification system

### Goals for Today
- Complete payment flow testing
- Begin dashboard integration`,
    action_items: [
      { task: 'Get design approval on notifications', assignee: 'Team Lead', done: false },
    ],
    ai_insights: '15 min standup, 12 team members',
    sentiment: 'positive',
    has_external_participants: false,
    external_domains: [],
  },
  {
    id: 'meeting-7',
    type: 'interview',
    title: 'Senior Developer Interview',
    date: format(subDays(now, 6), "yyyy-MM-dd'T'16:00:00'Z'"),
    duration_minutes: 60,
    participants: ['HR', 'Tech Lead', 'Candidate: Emma Thompson'],
    summary: `## Interview Summary - Emma Thompson

### Technical Assessment
- Strong system design skills
- Excellent communication of complex concepts
- 8 years relevant experience

### Technical Topics Covered
- Distributed systems architecture
- Database optimization
- API design patterns

### Impression
- Very strong candidate
- Would bring valuable FinTech experience
- Recommend proceeding to team fit interview`,
    action_items: [
      { task: 'Schedule team fit interview', assignee: 'HR', done: false },
      { task: 'Reference checks', assignee: 'HR', done: false },
    ],
    ai_insights: '60 min technical interview, strong candidate',
    sentiment: 'positive',
    has_external_participants: false,
    external_domains: [],
  },
  {
    id: 'meeting-8',
    type: 'sales',
    title: 'SMB Product Demo',
    date: format(subDays(now, 7), "yyyy-MM-dd'T'10:30:00'Z'"),
    duration_minutes: 40,
    participants: ['Sales Rep', 'Prospect: TechStart Inc'],
    summary: `## SMB Demo - TechStart Inc

### Attendees
- CTO and 2 developers

### Demo Highlights
- Dashboard functionality well received
- API ease of integration impressed technical team
- Pricing concerns mentioned

### Objections
- Budget constraints for early-stage startup
- Need to evaluate competitors

### Next Steps
- Send pricing proposal with startup discount
- Connect with their development team for technical evaluation`,
    action_items: [
      { task: 'Send startup pricing proposal', assignee: 'Sales Rep', done: false },
      { task: 'Schedule follow-up call', assignee: 'Sales Rep', done: false },
    ],
    ai_insights: '40 min demo, medium probability, budget concerns',
    sentiment: 'neutral',
    has_external_participants: true,
    external_domains: ['techstart.io'],
  },
  {
    id: 'meeting-9',
    type: 'all-hands',
    title: 'Q4 Company All-Hands',
    date: format(subDays(now, 14), "yyyy-MM-dd'T'14:00:00'Z'"),
    duration_minutes: 90,
    participants: ['All Employees'],
    summary: `## Q4 All-Hands Meeting

### Company Performance
- 142% of Q4 revenue target achieved
- 23 new enterprise clients onboarded
- NPS score improved to 72

### 2026 Goals
- Expand to APAC market
- Launch mobile app v3.0
- Achieve SOC2 certification

### Team Recognition
- Engineering team for record deployment speed
- Customer success for 98% satisfaction rate

### Open Forum
- Remote work policy discussion
- New office expansion plans
- Benefits review for next year`,
    action_items: [
      { task: 'Review remote work policy document', assignee: 'All Employees', done: false },
    ],
    ai_insights: '90 min all-hands, positive momentum',
    sentiment: 'positive',
    has_external_participants: false,
    external_domains: [],
  },
  {
    id: 'meeting-10',
    type: 'planning',
    title: 'Sprint 25 Planning',
    date: format(subDays(now, 10), "yyyy-MM-dd'T'13:00:00'Z'"),
    duration_minutes: 120,
    participants: ['Product Owner', 'Scrum Master', 'Development Team'],
    summary: `## Sprint 25 Planning

### Sprint Goal
- Complete user authentication feature
- Begin analytics dashboard development
- Address technical debt items

### Stories Committed
- 42 story points total
- Capacity: 48 points
- Buffer: 6 points for unexpected work

### Definition of Done
- Code reviewed and approved
- Unit tests > 80% coverage
- Documentation updated

### Risks Identified
- Third-party API availability
- Resource availability for security audit`,
    action_items: [
      { task: 'Break down analytics stories', assignee: 'Product Owner', done: false },
      { task: 'Schedule security audit sessions', assignee: 'Scrum Master', done: false },
    ],
    ai_insights: '2 hour planning session, realistic commitment',
    sentiment: 'positive',
    has_external_participants: false,
    external_domains: [],
  },
];

export const meetingTypeDistribution = [
  { name: 'One-on-One', value: 35, color: '#60a5fa' },
  { name: 'External', value: 20, color: '#a78bfa' },
  { name: 'Sales', value: 15, color: '#34d399' },
  { name: 'Team', value: 12, color: '#fb923c' },
  { name: 'Standup', value: 10, color: '#818cf8' },
  { name: 'Planning', value: 8, color: '#2dd4bf' },
];

export const monthlyTrendData = [
  { month: 'Sep', meetings: 42 },
  { month: 'Oct', meetings: 48 },
  { month: 'Nov', meetings: 45 },
  { month: 'Dec', meetings: 38 },
  { month: 'Jan', meetings: 52 },
  { month: 'Feb', meetings: 58 },
];

export const metrics = {
  totalAgents: 3,
  activeTasks: 7,
  meetingsToday: 2,
  alerts: 3,
};

export const meetingMetrics = {
  totalMeetings: 247,
  thisWeek: 8,
  openActionItems: 12,
  averageDuration: '34m',
};
