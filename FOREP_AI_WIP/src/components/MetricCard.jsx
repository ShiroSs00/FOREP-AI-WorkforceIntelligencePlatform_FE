function MetricCard({ title, value, subtext, tone = 'blue', compact = false }) {
  const toneClasses = {
    blue: 'bg-sky-50 text-sky-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="metric-card rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#64748b]">{title}</p>
          <p className={compact ? 'mt-1 text-2xl font-bold text-[#0f172a]' : 'mt-2 text-3xl font-bold text-[#0f172a]'}>
            {value}
          </p>
        </div>
        <span className={`h-2.5 w-2.5 rounded-full ${toneClasses[tone]}`} />
      </div>
      {subtext ? <p className="mt-3 text-sm text-[#64748b]">{subtext}</p> : null}
    </div>
  )
}

export default MetricCard
