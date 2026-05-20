export function generateDemoInsight({ tasks, employees, events, attendance }) {
  const overdueTasks = tasks.filter((task) => task.status === 'Overdue')
  if (overdueTasks.length > 0) {
    return {
      title: 'Overdue bottleneck detected',
      description: `Demo AI found ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} in local task data.`,
      category: 'Workflow',
      severity: overdueTasks.length > 2 ? 'High' : 'Medium',
      recommendation: 'Review overdue task owners and redistribute work with the nearest due dates first.',
    }
  }

  const highPriorityByAssignee = tasks.reduce((acc, task) => {
    if (task.priority === 'High' && task.status !== 'Completed') acc[task.assignee] = (acc[task.assignee] ?? 0) + 1
    return acc
  }, {})
  const overloadedAssignee = Object.entries(highPriorityByAssignee).find(([, count]) => count >= 2)
  if (overloadedAssignee) {
    return {
      title: 'High-priority work is concentrated',
      description: `Demo AI found multiple high-priority active tasks assigned to ${overloadedAssignee[0]}.`,
      category: 'Workload',
      severity: 'High',
      recommendation: 'Balance high-priority work across teammates before adding more urgent assignments.',
    }
  }

  const highRiskEmployee = employees.find((employee) => employee.riskLevel === 'High')
  if (highRiskEmployee) {
    return {
      title: 'Burnout support signal',
      description: `Demo AI found a high burnout-risk label for ${highRiskEmployee.name}.`,
      category: 'Burnout',
      severity: 'High',
      recommendation: 'Schedule a workload check-in and move non-critical work where possible.',
    }
  }

  const lateRecords = attendance.filter((record) => record.status === 'Late')
  if (lateRecords.length > 1) {
    return {
      title: 'Late attendance pattern detected',
      description: `Demo AI found ${lateRecords.length} late attendance records in local data.`,
      category: 'Attendance',
      severity: 'Medium',
      recommendation: 'Review whether team schedules or meeting load are contributing to late starts.',
    }
  }

  return {
    title: 'Workflow signals are stable',
    description: `Demo AI reviewed ${events.length} operational events and did not find a high-severity pattern.`,
    category: 'Productivity',
    severity: 'Low',
    recommendation: 'Keep monitoring task aging, attendance signals, and new integration events.',
  }
}
