import { getData, setData } from './storage.js'
import { createNotification } from './notificationService.js'

const notificationByEventType = {
  TASK_CREATED: { title: 'New task created', message: 'A new task has been added to the workflow.', type: 'Task', severity: 'Info', link: '/tasks' },
  TASK_COMPLETED: { title: 'Task completed', message: 'A task has been marked as completed.', type: 'Task', severity: 'Success', link: '/tasks' },
  TASK_OVERDUE: { title: 'Overdue task detected', message: 'A task has been marked as overdue and may need manager attention.', type: 'Task', severity: 'Warning', link: '/tasks' },
  LEAVE_REQUESTED: { title: 'New leave request', message: 'A new leave request is waiting for review.', type: 'Leave', severity: 'Info', link: '/leave' },
  LEAVE_APPROVED: { title: 'Leave request approved', message: 'A leave request has been approved.', type: 'Leave', severity: 'Success', link: '/leave' },
  LEAVE_REJECTED: { title: 'Leave request rejected', message: 'A leave request has been rejected.', type: 'Leave', severity: 'Warning', link: '/leave' },
  ATTENDANCE_RECORDED: { title: 'Attendance recorded', message: 'A new attendance record has been added.', type: 'Attendance', severity: 'Info', link: '/attendance' },
  AI_INSIGHT_GENERATED: { title: 'New AI insight generated', message: 'FOREP generated a new demo insight from local workflow data.', type: 'AI', severity: 'Info', link: '/ai-insights' },
}

export function createEvent({ type, title, description, actor = 'System', source = 'Internal', severity = 'Info' }) {
  return {
    id: `event-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type,
    title,
    description,
    actor,
    source,
    severity,
    timestamp: new Date().toISOString(),
  }
}

export function addEvent(event) {
  const events = getData('events')
  const nextEvents = [event, ...events]
  setData('events', nextEvents)
  const notification = notificationByEventType[event.type]
  if (notification) createNotification(notification)
  return nextEvents
}
