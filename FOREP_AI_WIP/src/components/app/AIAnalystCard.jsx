import Badge from '../ui/Badge.jsx'
import Card from '../ui/Card.jsx'

function AIAnalystCard({ role, title = 'AI Analyst', signals = [], insights = [] }) {
  const hasContent = signals.length || insights.length

  return (
    <Card className="border-slate-800 bg-[#020617] text-white shadow-xl shadow-slate-950/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">{role}</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
        </div>
        <Badge tone="Info">Backend API</Badge>
      </div>
      {hasContent ? (
        <div className="mt-5 space-y-3">
          {signals.map((signal) => (
            <p key={signal} className="rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200">{signal}</p>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-300">
          AI insights will appear here when the backend returns role-scoped insight data.
        </p>
      )}
      {insights.length ? (
        <div className="mt-5 border-t border-white/10 pt-4">
          {insights.map((insight) => <p key={insight} className="text-sm leading-6 text-slate-300">{insight}</p>)}
        </div>
      ) : null}
    </Card>
  )
}

export default AIAnalystCard
