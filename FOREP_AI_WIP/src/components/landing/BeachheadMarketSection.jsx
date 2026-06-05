import { MapPin, WalletCards, Workflow, UsersRound, GitBranch, HelpCircle } from 'lucide-react'

const cards = [
  ['Startup technology teams', 'Built for 15-80 person teams in Vietnam and SEA.', UsersRound],
  ['Existing tool habits', 'Teams already work across GitHub and Jira or Trello-like task boards.', GitBranch],
  ['Workload visibility gap', 'Managers still ask what people are working on because context is scattered.', HelpCircle],
  ['Affordable MVP focus', 'Designed for teams that need visibility without enterprise tool complexity.', WalletCards],
  ['Regional beachhead', 'Vietnam and SEA teams need practical workflow intelligence that fits local operations.', MapPin],
  ['Operational clarity', 'Help identify who may be overloaded, blocked, or under-supported.', Workflow],
]

function BeachheadMarketSection() {
  return (
    <section className="bg-[var(--surface)] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#0ea5e9]">Beachhead Market</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-normal text-[var(--text)]">Focused first on startup technology teams in Vietnam and SEA.</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map(([title, text, Icon]) => (
            <article key={title} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-6">
              <Icon className="text-[#0ea5e9]" size={24} />
              <h3 className="mt-5 font-semibold text-[var(--text)]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BeachheadMarketSection
