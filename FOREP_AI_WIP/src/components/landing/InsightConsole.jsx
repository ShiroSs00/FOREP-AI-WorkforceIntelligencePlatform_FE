const insights = ['Review workload balance', 'Check overdue bottlenecks', 'Support high-pressure teams', 'Improve task assignment flow', 'Summarize team operation']

function InsightConsole() {
  return (
    <div className="rounded-lg border border-sky-400/20 bg-white/10 p-5 backdrop-blur">
      <div className="mb-5 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
      </div>
      <p className="text-sm font-semibold text-sky-100">AI Insight Console</p>
      <div className="mt-5 space-y-3">{insights.map((item) => <div key={item} className="stage-item rounded-lg bg-white/10 px-4 py-3 text-sm text-slate-200">{item}</div>)}</div>
    </div>
  )
}

export default InsightConsole
