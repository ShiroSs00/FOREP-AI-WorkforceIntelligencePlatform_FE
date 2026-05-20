import { initialDemoData } from '../data/mockData.js'

export const mockNotifications = [
  {
    id: 'notification-1',
    title: 'Integration event received',
    message: 'A GitHub workflow event is ready to appear in the operational timeline.',
    type: 'Integration',
    severity: 'Info',
    read: false,
    createdAt: '2026-05-20T09:30:00.000Z',
    link: '/events',
  },
  {
    id: 'notification-2',
    title: 'Workflow attention needed',
    message: 'A high-priority operational signal is waiting for manager review.',
    type: 'Event',
    severity: 'Warning',
    read: false,
    createdAt: '2026-05-20T08:40:00.000Z',
    link: '/dashboard',
  },
]

export const mockAnalyticsSummary = {
  overview: [
    { title: 'Operational Overview', description: 'Backend summary cards will surface workflow health when APIs are connected.' },
    { title: 'Recent Events', description: 'Event streams from tasks, attendance, leave and integrations will appear here.' },
    { title: 'Workload Signals', description: 'Workload signals will be calculated from operational events and team context.' },
    { title: 'AI Insight Preview', description: 'AI insight previews will appear after analytics and AI services are connected.' },
    { title: 'Pending Leave Requests', description: 'Leave workflows will be managed by backend APIs.' },
    { title: 'Notification Summary', description: 'Notification summaries will come from backend event processing.' },
  ],
}

export const mockData = {
  ...initialDemoData,
  notifications: mockNotifications,
  analyticsSummary: mockAnalyticsSummary,
}
