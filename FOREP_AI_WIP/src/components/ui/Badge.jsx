const styles = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Medium: 'bg-sky-50 text-sky-700 border-sky-100',
  High: 'bg-red-50 text-red-700 border-red-100',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'On Leave': 'bg-slate-100 text-slate-700 border-slate-200',
  Todo: 'bg-slate-100 text-slate-700 border-slate-200',
  'In Progress': 'bg-sky-50 text-sky-700 border-sky-100',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Overdue: 'bg-red-50 text-red-700 border-red-100',
  Present: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Late: 'bg-amber-50 text-amber-700 border-amber-100',
  Absent: 'bg-red-50 text-red-700 border-red-100',
  Remote: 'bg-sky-50 text-sky-700 border-sky-100',
  Pending: 'bg-amber-50 text-amber-700 border-amber-100',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Rejected: 'bg-red-50 text-red-700 border-red-100',
  Info: 'bg-slate-100 text-slate-700 border-slate-200',
  Success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Warning: 'bg-amber-50 text-amber-700 border-amber-100',
  Critical: 'bg-red-50 text-red-700 border-red-100',
}

function Badge({ children, tone, className = '' }) {
  const key = tone ?? children
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[key] ?? styles.Info} ${className}`}>{children}</span>
}

export default Badge
