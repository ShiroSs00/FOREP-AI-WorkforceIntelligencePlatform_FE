export function getTaskStatusCounts(tasks) {
  return tasks.reduce(
    (counts, task) => ({ ...counts, [task.status]: (counts[task.status] ?? 0) + 1 }),
    { Todo: 0, 'In Progress': 0, Completed: 0, Overdue: 0 },
  )
}

export function getWorkloadSignals(tasks, employees) {
  return employees.map((employee) => {
    const activeTasks = tasks.filter((task) => task.assignee === employee.name && task.status !== 'Completed')
    const highPriority = activeTasks.filter((task) => task.priority === 'High').length
    const overdue = activeTasks.filter((task) => task.status === 'Overdue').length
    const label = overdue > 0 || highPriority > 2 || employee.workloadLevel === 'High' ? 'High' : activeTasks.length > 1 ? 'Medium' : 'Low'

    return { employee: employee.name, team: employee.team, activeTasks: activeTasks.length, highPriority, overdue, label }
  })
}

export function getTeamTaskSummary(tasks, teams) {
  return teams.map((team) => {
    const teamTasks = tasks.filter((task) => task.team === team.name)
    const activeTasks = teamTasks.filter((task) => task.status !== 'Completed')
    const highPriority = activeTasks.filter((task) => task.priority === 'High').length
    const overdue = activeTasks.filter((task) => task.status === 'Overdue').length
    const workload = overdue > 0 || highPriority > 1 || activeTasks.length > 4 ? 'High' : activeTasks.length > 1 ? 'Medium' : 'Low'

    return { ...team, tasks: teamTasks, activeTasks: activeTasks.length, highPriority, overdue, workload }
  })
}

export function getBurnoutSignals(employees, tasks) {
  const workload = getWorkloadSignals(tasks, employees)
  return employees.map((employee) => {
    const signal = workload.find((item) => item.employee === employee.name)
    const label = employee.riskLevel === 'High' || signal?.label === 'High' ? 'High' : employee.riskLevel === 'Medium' || signal?.label === 'Medium' ? 'Medium' : 'Low'
    return { ...employee, signal: label, activeTasks: signal?.activeTasks ?? 0, overdue: signal?.overdue ?? 0 }
  })
}
