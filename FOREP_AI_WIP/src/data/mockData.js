export const employees = [
  { id: 'emp-1', name: 'John Doe', role: 'Engineering Manager', team: 'Platform', email: 'john.doe@forep.demo', workloadLevel: 'High', status: 'Active', riskLevel: 'Medium' },
  { id: 'emp-2', name: 'Maya Tran', role: 'Frontend Engineer', team: 'Platform', email: 'maya.tran@forep.demo', workloadLevel: 'Medium', status: 'Active', riskLevel: 'Low' },
  { id: 'emp-3', name: 'Alex Nguyen', role: 'Operations Lead', team: 'Operations', email: 'alex.nguyen@forep.demo', workloadLevel: 'High', status: 'Active', riskLevel: 'High' },
  { id: 'emp-4', name: 'Lina Park', role: 'People Partner', team: 'People Ops', email: 'lina.park@forep.demo', workloadLevel: 'Low', status: 'On Leave', riskLevel: 'Low' },
  { id: 'emp-5', name: 'Sam Carter', role: 'Support Specialist', team: 'Customer Support', email: 'sam.carter@forep.demo', workloadLevel: 'Medium', status: 'Active', riskLevel: 'Medium' },
  { id: 'emp-6', name: 'Priya Shah', role: 'Data Analyst', team: 'Operations', email: 'priya.shah@forep.demo', workloadLevel: 'Medium', status: 'Active', riskLevel: 'Low' },
]

export const teams = [
  { id: 'team-1', name: 'Platform', manager: 'John Doe', members: ['John Doe', 'Maya Tran'], description: 'Builds the internal product experience and integrations workflow.' },
  { id: 'team-2', name: 'Operations', manager: 'Alex Nguyen', members: ['Alex Nguyen', 'Priya Shah'], description: 'Monitors operational throughput, process quality, and staffing signals.' },
  { id: 'team-3', name: 'People Ops', manager: 'Lina Park', members: ['Lina Park'], description: 'Coordinates attendance, leave policy, and team well-being workflows.' },
  { id: 'team-4', name: 'Customer Support', manager: 'Sam Carter', members: ['Sam Carter'], description: 'Handles customer-facing tickets and response patterns.' },
]

export const tasks = [
  { id: 'task-1', title: 'Review overdue onboarding workflow', description: 'Audit stale onboarding tasks and assign owners for blocked steps.', assignee: 'Alex Nguyen', team: 'Operations', priority: 'High', status: 'Overdue', dueDate: '2026-05-18', createdAt: '2026-05-13' },
  { id: 'task-2', title: 'Build manager task summary panel', description: 'Create a dashboard panel for active task status by team.', assignee: 'Maya Tran', team: 'Platform', priority: 'High', status: 'In Progress', dueDate: '2026-05-24', createdAt: '2026-05-16' },
  { id: 'task-3', title: 'Prepare leave policy refresh', description: 'Draft updated internal policy notes for remote work leave requests.', assignee: 'Lina Park', team: 'People Ops', priority: 'Medium', status: 'Todo', dueDate: '2026-05-27', createdAt: '2026-05-17' },
  { id: 'task-4', title: 'Close support response delay review', description: 'Summarize response delay patterns and propose routing changes.', assignee: 'Sam Carter', team: 'Customer Support', priority: 'Medium', status: 'Completed', dueDate: '2026-05-19', createdAt: '2026-05-12' },
  { id: 'task-5', title: 'Validate workload event mapping', description: 'Check task, attendance, leave, and integration event naming consistency.', assignee: 'Priya Shah', team: 'Operations', priority: 'Low', status: 'In Progress', dueDate: '2026-05-26', createdAt: '2026-05-15' },
]

export const events = [
  { id: 'event-1', type: 'TASK_OVERDUE', title: 'Task became overdue', description: 'Review overdue onboarding workflow passed its due date.', actor: 'System', source: 'Internal', timestamp: '2026-05-20T08:35:00.000Z', severity: 'Warning' },
  { id: 'event-2', type: 'PR_MERGED', title: 'Manager summary PR merged', description: 'Platform integration changes were merged for dashboard summary work.', actor: 'Maya Tran', source: 'GitHub', timestamp: '2026-05-20T07:20:00.000Z', severity: 'Info' },
  { id: 'event-3', type: 'EMAIL_RESPONSE_DELAY', title: 'Customer response delay detected', description: 'Support queue had delayed customer replies across several tickets.', actor: 'Sam Carter', source: 'Gmail', timestamp: '2026-05-19T14:15:00.000Z', severity: 'Warning' },
  { id: 'event-4', type: 'LEAVE_REQUESTED', title: 'Leave requested', description: 'Lina Park requested annual leave.', actor: 'Lina Park', source: 'Internal', timestamp: '2026-05-19T10:10:00.000Z', severity: 'Info' },
]

export const attendanceRecords = [
  { id: 'att-1', employee: 'John Doe', date: '2026-05-20', checkIn: '09:05', checkOut: '18:10', status: 'Present' },
  { id: 'att-2', employee: 'Maya Tran', date: '2026-05-20', checkIn: '09:42', checkOut: '18:30', status: 'Late' },
  { id: 'att-3', employee: 'Alex Nguyen', date: '2026-05-20', checkIn: '08:55', checkOut: '19:05', status: 'Present' },
  { id: 'att-4', employee: 'Lina Park', date: '2026-05-20', checkIn: '-', checkOut: '-', status: 'Absent' },
  { id: 'att-5', employee: 'Sam Carter', date: '2026-05-20', checkIn: '09:10', checkOut: '17:55', status: 'Remote' },
]

export const leaveRequests = [
  { id: 'leave-1', employee: 'Lina Park', type: 'Annual Leave', from: '2026-05-21', to: '2026-05-23', reason: 'Planned family travel.', status: 'Pending' },
  { id: 'leave-2', employee: 'Sam Carter', type: 'Remote Work', from: '2026-05-22', to: '2026-05-22', reason: 'Home office day for focused work.', status: 'Approved' },
]

export const aiInsights = [
  { id: 'insight-1', title: 'Operations workload needs review', description: 'Demo signals show overdue work and high workload concentrated in Operations.', category: 'Workload', severity: 'High', recommendation: 'Review task ownership and move non-urgent work to lower-load teammates.', createdAt: '2026-05-20T09:00:00.000Z' },
  { id: 'insight-2', title: 'Attendance pattern is mixed', description: 'Demo attendance records include late and absent statuses today.', category: 'Attendance', severity: 'Medium', recommendation: 'Check whether late arrivals are isolated or linked to scheduling constraints.', createdAt: '2026-05-20T08:45:00.000Z' },
]

export const initialDemoData = {
  employees,
  teams,
  tasks,
  events,
  attendanceRecords,
  leaveRequests,
  aiInsights,
}
