// Mock data for OpenOrigin Dashboard
import { subMinutes, subHours, subDays, format } from 'date-fns';

const now = new Date();

export const agents = [
  {
    id: 'alpha',
    emoji: '🤖',
    name: 'Agent Alpha',
    subtitle: 'AI Engineering Lead',
    type: 'Code Agent',
    role: 'Chief Engineer',
    color: '#10b981',
    status: 'online',
    currentActivity: 'Refactoring API endpoints',
    lastSeen: new Date(),
    completedTasks: 147,
    accuracy: 98.2,
    skills: ['React', 'Node.js', 'Python', 'System Design'],
  },
  {
    id: 'dispatch',
    emoji: '📋',
    name: 'Dispatch Bot',
    subtitle: 'Operations Coordinator',
    type: 'Coordinator',
    role: 'Director of Operations',
    color: '#f59e0b',
    status: 'idle',
    currentActivity: 'Waiting for tasks',
    lastSeen: subMinutes(now, 5),
    completedTasks: 89,
    accuracy: 95.7,
    skills: ['Task Management', 'Resource Allocation', 'Process Optimization'],
  },
  {
    id: 'audit',
    emoji: '🛡️',
    name: 'Audit Bot',
    subtitle: 'Compliance & QA',
    type: 'Quality Agent',
    role: 'Compliance Officer',
    color: '#06b6d4',
    status: 'error',
    currentActivity: 'Checking API logs',
    lastSeen: subMinutes(now, 23),
    completedTasks: 312,
    accuracy: 99.1,
    skills: ['Security Audit', 'Code Review', 'Compliance', 'Risk Assessment'],
  },
];

export const metrics = [
  { label: 'Active Tasks', value: 24, change: '+12%', icon: 'CheckSquare', trend: 'up' },
  { label: 'Agents Online', value: 2, change: '1 idle', icon: 'Users', trend: 'neutral' },
  { label: 'Events Today', value: 47, change: '+23%', icon: 'Zap', trend: 'up' },
  { label: 'Uptime', value: 99.9, change: '+0.1%', icon: 'Activity', trend: 'up', suffix: '%' },
];

export const recentActivity = [
  { id: 1, agent: '🤖', action: 'Completed API refactor for auth module', time: subMinutes(now, 2) },
  { id: 2, agent: '📋', action: 'Dispatched 3 tasks to agents', time: subMinutes(now, 7) },
  { id: 3, agent: '🛡️', action: 'Detected anomaly in log batch #4412', time: subMinutes(now, 12) },
  { id: 4, agent: '🤖', action: 'Deployed v2.3.1 to staging', time: subMinutes(now, 18) },
  { id: 5, agent: '📋', action: 'Updated task priorities for sprint 14', time: subMinutes(now, 25) },
  { id: 6, agent: '🛡️', action: 'Passed security audit for payment gateway', time: subMinutes(now, 31) },
  { id: 7, agent: '🤖', action: 'Fixed memory leak in worker process', time: subHours(now, 1) },
  { id: 8, agent: '📋', action: 'Created 5 new task templates', time: subHours(now, 2) },
  { id: 9, agent: '🛡️', action: 'Generated compliance report Q1', time: subHours(now, 3) },
  { id: 10, agent: '🤖', action: 'Merged PR #891 — new dashboard components', time: subHours(now, 4) },
];

export const tasks = [
  // To Do
  { id: 1, title: 'Design new onboarding flow', agent: '🤖', priority: 'high', col: 'todo' },
  { id: 2, title: 'Set up monitoring alerts', agent: '🛡️', priority: 'medium', col: 'todo' },
  { id: 3, title: 'Review API rate limiting', agent: '📋', priority: 'low', col: 'todo' },
  // In Progress
  { id: 4, title: 'Build notification service', agent: '🤖', priority: 'high', col: 'progress', progress: 65 },
  { id: 5, title: 'Audit user permissions', agent: '🛡️', priority: 'medium', col: 'progress', progress: 30 },
  // Needs Input
  { id: 6, title: 'Define auth token strategy', agent: '🤖', priority: 'high', col: 'input' },
  { id: 7, title: 'Select payment provider', agent: '📋', priority: 'urgent', col: 'input' },
  // Done
  { id: 8, title: 'Migrate database to v2', agent: '🤖', priority: 'high', col: 'done' },
  { id: 9, title: 'Write API documentation', agent: '🛡️', priority: 'medium', col: 'done' },
  { id: 10, title: 'Optimize image pipeline', agent: '🤖', priority: 'low', col: 'done' },
];

export const logEntries = [
  { id: 1, agent: '🤖', category: 'observation', message: 'Cache hit ratio dropped to 72% — investigating Redis configs', time: subMinutes(now, 3) },
  { id: 2, agent: '📋', category: 'general', message: 'Sprint planning session scheduled for tomorrow 10:00 UTC', time: subMinutes(now, 11) },
  { id: 3, agent: '🛡️', category: 'reminder', message: 'Security audit due in 3 days — pending review of 14 checkpoints', time: subMinutes(now, 18) },
  { id: 4, agent: '🤖', category: 'fyi', message: 'API response time improved by 40ms after query optimization', time: subMinutes(now, 25) },
  { id: 5, agent: '🛡️', category: 'observation', message: 'Unusual traffic pattern detected from IP range 192.168.x.x', time: subMinutes(now, 34) },
  { id: 6, agent: '📋', category: 'general', message: 'Resource allocation updated for Q2 — +15% compute budget approved', time: subMinutes(now, 45) },
  { id: 7, agent: '🤖', category: 'reminder', message: 'Dependency update available: React 19.3 → 19.4', time: subHours(now, 1) },
  { id: 8, agent: '🛡️', category: 'fyi', message: 'All systems passed overnight health check — zero incidents', time: subHours(now, 2) },
  { id: 9, agent: '📋', category: 'observation', message: 'Task throughput increased 18% since implementing new queue strategy', time: subHours(now, 3) },
  { id: 10, agent: '🤖', category: 'general', message: 'Code review completed for PR #897 — approved with suggestions', time: subHours(now, 5) },
];

export const parliamentSessions = [
  {
    id: 1,
    question: 'Should we adopt a microservices architecture for the next generation platform?',
    participants: [
      { agent: '🤖', name: 'Agent Alpha', stance: 'in_favor', status: 'active' },
      { agent: '📋', name: 'Dispatch Bot', stance: 'conditional', status: 'active' },
      { agent: '🛡️', name: 'Audit Bot', stance: 'against', status: 'active' },
    ],
    status: 'voting',
    messages: [
      { agent: '🤖', name: 'Agent Alpha', text: 'Microservices will improve deployment independence and scaling. Each team can own a service end-to-end.', time: subMinutes(now, 5) },
      { agent: '🛡️', name: 'Audit Bot', text: 'I flag the increased attack surface and distributed tracing complexity. Single point of failure becomes multi-point.', time: subMinutes(now, 4) },
      { agent: '📋', name: 'Dispatch Bot', text: 'Conditional support — only if we have proper observability and service mesh in place first.', time: subMinutes(now, 3) },
      { agent: '🤖', name: 'Agent Alpha', text: 'Fair points. I propose a hybrid approach: core services as microservices, peripheral ones can stay monolithic initially.', time: subMinutes(now, 2) },
    ],
  },
  {
    id: 2,
    question: 'Should AI agents have the authority to auto-deploy without human approval?',
    participants: [
      { agent: '🤖', name: 'Agent Alpha', stance: 'in_favor', status: 'active' },
      { agent: '📋', name: 'Dispatch Bot', stance: 'in_favor', status: 'active' },
      { agent: '🛡️', name: 'Audit Bot', stance: 'against', status: 'active' },
    ],
    status: 'deliberating',
    messages: [
      { agent: '🤖', name: 'Agent Alpha', text: 'Speed is a competitive advantage. With proper test gates, auto-deploy eliminates bottleneck.', time: subMinutes(now, 20) },
      { agent: '🛡️', name: 'Audit Bot', text: 'Human oversight is non-negotiable for production deployments. History shows automated deploys without guardrails cause incidents.', time: subMinutes(now, 18) },
      { agent: '📋', name: 'Dispatch Bot', text: 'I agree with Audit Bot — at minimum, staging auto-deploy with production requiring approval.', time: subMinutes(now, 15) },
    ],
  },
];

export const meetings = [
  {
    id: 1,
    title: 'Weekly Engineering Standup',
    date: subDays(now, 1),
    duration_minutes: 30,
    meeting_type: 'standup',
    participants: ['Alice', 'Bob', 'Charlie'],
    summary: 'Sprint progress update. Backend API at 80% complete. Frontend integration starts next week. Two blockers identified: DB migration timing and third-party auth SDK.',
    action_items: [
      { task: 'Review PR #42', assignee: 'Alice', done: false },
      { task: 'Update documentation', assignee: 'Bob', done: true },
    ],
    ai_insights: '30 min meeting, 3 participants. One blocker needs escalation.',
    has_external_participants: false,
    sentiment: 'positive',
  },
  {
    id: 2,
    title: 'Enterprise License Negotiation',
    date: subDays(now, 2),
    duration_minutes: 45,
    meeting_type: 'sales',
    participants: ['Sales Team', 'Acme Corp'],
    summary: 'Negotiated 3-year enterprise deal with Acme Corp. Price reduced 15% in exchange for annual commitment. Legal review needed for data processing agreement.',
    action_items: [
      { task: 'Send revised MSA to legal', assignee: 'Sales', done: false },
      { task: 'Schedule technical demo', assignee: 'Engineering', done: false },
    ],
    ai_insights: 'High-value deal ($240K ARR). Decision expected within 2 weeks.',
    has_external_participants: true,
    external_domains: ['acmecorp.com'],
    sentiment: 'positive',
  },
  {
    id: 3,
    title: 'Q2 Product Roadmap Planning',
    date: subDays(now, 3),
    duration_minutes: 90,
    meeting_type: 'planning',
    participants: ['Product Team', 'Engineering Leads'],
    summary: 'Mapped out Q2 priorities: mobile app v2, API v3, and integrations with Slack and Jira. Resource allocation discussed. Mobile team needs 2 additional hires.',
    action_items: [
      { task: 'Finalize mobile scope document', assignee: 'Product', done: false },
      { task: 'Create engineering estimation doc', assignee: 'Engineering', done: false },
    ],
    ai_insights: 'Ambitious roadmap — mobile + API simultaneously may strain team.',
    has_external_participants: false,
    sentiment: 'neutral',
  },
  {
    id: 4,
    title: '1:1 with Engineering Manager',
    date: subDays(now, 4),
    duration_minutes: 25,
    meeting_type: '1on1',
    participants: ['Manager', 'Self'],
    summary: 'Career growth discussion. Expressed interest in tech lead role. Manager noted strong performance but suggested waiting for next reorg in June.',
    action_items: [
      { task: 'Prepare tech lead proposal document', assignee: 'Self', done: false },
    ],
    ai_insights: 'Positive trajectory — opportunity likely in Q3.',
    has_external_participants: false,
    sentiment: 'positive',
  },
  {
    id: 5,
    title: 'External Security Review',
    date: subDays(now, 5),
    duration_minutes: 60,
    meeting_type: 'external',
    participants: ['Security Team', 'External Auditor'],
    summary: 'Third-party security firm presented findings. 2 medium vulnerabilities found, 0 critical. Remediation plan agreed. Cert renewal on track.',
    action_items: [
      { task: 'Patch XSS vulnerability in auth flow', assignee: 'Backend', done: false },
      { task: 'Update CSP headers on API gateway', assignee: 'DevOps', done: false },
    ],
    ai_insights: 'Good security posture overall. Minor remediation needed.',
    has_external_participants: true,
    external_domains: ['secureaudit.firm'],
    sentiment: 'positive',
  },
  {
    id: 6,
    title: 'All Hands — Company Update',
    date: subDays(now, 7),
    duration_minutes: 45,
    meeting_type: 'all-hands',
    participants: ['All Staff'],
    summary: 'CEO announced expansion into 2 new markets. Headcount growing 30% this year. New offices opening in Berlin and Singapore. All departments briefed.',
    action_items: [
      { task: 'Submit relocation interest form', assignee: 'HR', done: false },
    ],
    ai_insights: 'Company in growth phase. Exciting times ahead.',
    has_external_participants: false,
    sentiment: 'positive',
  },
  {
    id: 7,
    title: 'Sales Demo — FinTech Prospects',
    date: subDays(now, 8),
    duration_minutes: 40,
    meeting_type: 'sales',
    participants: ['Sales', 'Beta Bank', 'Neo Finance'],
    summary: 'Live demo of analytics dashboard. Prospects impressed by real-time processing speed. Pricing discussion started. Follow-up technical deep-dive scheduled.',
    action_items: [
      { task: 'Send custom pricing proposal', assignee: 'Sales', done: false },
      { task: 'Schedule technical deep-dive', assignee: 'AE', done: false },
    ],
    ai_insights: '2 warm leads — decision by end of month.',
    has_external_participants: true,
    external_domains: ['betabank.io', 'neofinance.co'],
    sentiment: 'positive',
  },
  {
    id: 8,
    title: 'Team Retrospective',
    date: subDays(now, 10),
    duration_minutes: 50,
    meeting_type: 'team',
    participants: ['Full Team'],
    summary: 'Sprint retrospective. What went well: better communication via new Slack channels. What to improve: earlier involvement of QA in design reviews. Action items assigned.',
    action_items: [
      { task: 'Set up weekly QA sync', assignee: 'QA Lead', done: false },
      { task: 'Update design review process', assignee: 'Design', done: false },
    ],
    ai_insights: 'Team health score: 8/10. Communication improving.',
    has_external_participants: false,
    sentiment: 'positive',
  },
];

export const meetingStats = {
  total: 247,
  thisWeek: 8,
  openActions: 12,
  avgDuration: 34,
};

export const meetingTypeDistribution = [
  { name: '1-on-1', value: 35, color: '#60a5fa' },
  { name: 'External', value: 28, color: '#a78bfa' },
  { name: 'Sales', value: 22, color: '#34d399' },
  { name: 'Team', value: 18, color: '#fb923c' },
  { name: 'Standup', value: 15, color: '#818cf8' },
  { name: 'Planning', value: 12, color: '#2dd4bf' },
];

export const monthlyTrend = [
  { month: 'Sep', count: 18 },
  { month: 'Oct', count: 22 },
  { month: 'Nov', count: 19 },
  { month: 'Dec', count: 15 },
  { month: 'Jan', count: 24 },
  { month: 'Feb', count: 28 },
];
