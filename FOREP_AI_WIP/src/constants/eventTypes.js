export const eventTypes = [
  'TASK_CREATED',
  'TASK_ASSIGNED',
  'TASK_COMPLETED',
  'TASK_OVERDUE',
  'PR_MERGED',
  'EMAIL_RESPONSE_DELAY',
  'LEAVE_REQUESTED',
  'ATTENDANCE_RECORDED',
  'AI_INSIGHT_GENERATED',
]

export const eventSources = ['Internal', 'Jira', 'GitHub', 'Gmail', 'Slack', 'Trello', 'Notion']
export const eventSeverities = ['Info', 'Warning', 'Critical']
