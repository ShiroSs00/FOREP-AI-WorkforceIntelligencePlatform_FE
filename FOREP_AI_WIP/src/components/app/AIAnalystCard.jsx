import Card from '../ui/Card.jsx'

function AIAnalystCard({ role, title = 'AI Analyst', signals = [], insights = [] }) {
  const hasContent = signals.length || insights.length

  return (
    <Card className="relative overflow-hidden border-slate-800 bg-[#020617] text-white shadow-xl shadow-slate-950/20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,0.28),transparent_34%),radial-gradient(circle_at_100%_20%,rgba(79,70,229,0.24),transparent_30%)]" />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">{role}</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-sky-100">Live data</span>
      </div>
      {hasContent ? (
        <div className="relative mt-5 space-y-3">
          {signals.map((signal) => (
            <p key={signal} className="rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm leading-6 text-slate-200 backdrop-blur">{signal}</p>
          ))}
        </div>
      ) : (
        <p className="relative mt-5 rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm leading-6 text-slate-300">
          AI insights will appear here when role-scoped intelligence is available.
        </p>
      )}
      {insights.length ? (
        <div className="relative mt-5 border-t border-white/10 pt-4">
          {insights.map((insight) => <p key={insight} className="text-sm leading-6 text-slate-300">{insight}</p>)}
        </div>
      ) : null}
    </Card>
  )
}

export default AIAnalystCard
