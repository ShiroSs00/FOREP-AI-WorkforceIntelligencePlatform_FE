import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Building2,
  CheckCircle2,
  GitBranch,
  HeartPulse,
  ShieldCheck,
  UserRound,
  UsersRound,
  Workflow,
} from 'lucide-react'

function useReveal() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const items = entry.target.querySelectorAll('.story-reveal')
        animate(items, {
          opacity: [0, 1],
          translateY: [reduced ? 0 : 28, 0],
          delay: stagger(reduced ? 0 : 80),
          duration: reduced ? 1 : 720,
          ease: 'outCubic',
        })
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.18 })

    root.querySelectorAll('.story-section').forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return rootRef
}

const problemSignals = [
  ['Tasks move fast', 'Ownership changes, overdue work and blocked tasks split across tools.'],
  ['Attendance is separate', 'Check-in, leave and availability rarely meet workload context.'],
  ['Performance is delayed', 'Reviews arrive after burnout or disengagement has already grown.'],
  ['Risk is invisible', 'Managers and HRD react late because signals never become one story.'],
]

const intelligence = [
  ['Workload pressure', 'Detect imbalance across teams, employees and active sprint commitments.', Activity],
  ['Burnout risk', 'Surface risk signals from workload, attendance, leave and task pressure.', HeartPulse],
  ['Operational anomalies', 'Spot unusual spikes, delays and contribution gaps before escalation.', BarChart3],
  ['Team health', 'Translate daily activity into transparent, role-aware decision support.', BrainCircuit],
]

const roles = [
  ['Admin', 'Controls organizations, users, teams, integrations and platform health.', Building2],
  ['HRD', 'Reviews people signals, leave pressure, attendance patterns and workforce risk.', UsersRound],
  ['Manager', 'Tracks team workload, task ownership, sprint delivery and operational events.', Workflow],
  ['Employee', 'Sees personal tasks, attendance, leave history and transparent AI insights.', UserRound],
]

const integrations = ['Tasks', 'Attendance', 'Leave', 'GitHub', 'Sprints', 'Notifications', 'AI Insights', 'Analytics']

function SectionLabel({ children }) {
  return <p className="story-reveal opacity-0 text-xs font-bold uppercase tracking-[0.32em] text-sky-300">{children}</p>
}

function ProblemSection() {
  return (
    <section className="story-section relative overflow-hidden bg-[#020617] px-4 py-28 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 landing-grid opacity-25" />
      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-4xl">
          <SectionLabel>Problem</SectionLabel>
          <h2 className="story-reveal mt-5 opacity-0 text-4xl font-bold tracking-normal sm:text-6xl">
            Modern work creates signals faster than teams can interpret them.
          </h2>
          <p className="story-reveal mt-6 max-w-3xl opacity-0 text-lg leading-8 text-slate-300">
            Tasks, attendance, leave, sprint movement and performance context often live in separate systems. By the time a manager or HRD sees the pattern, the risk has already become a people problem.
          </p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {problemSignals.map(([title, body]) => (
            <div key={title} className="story-reveal opacity-0 rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-slate-950/30">
              <div className="mb-5 h-1.5 w-16 rounded-full bg-sky-300/70" />
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-4 text-sm leading-6 text-slate-300">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SolutionSection() {
  const steps = ['Signals', 'Events', 'Timeline', 'Analytics', 'Actions']
  return (
    <section id="features" className="story-section relative overflow-hidden bg-[#050b18] px-4 py-28 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_80%_75%,rgba(99,102,241,0.16),transparent_26%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionLabel>Solution</SectionLabel>
          <h2 className="story-reveal mt-5 opacity-0 text-4xl font-bold tracking-normal sm:text-6xl">
            FOREP connects operational events into one intelligent timeline.
          </h2>
          <p className="story-reveal mt-6 text-lg leading-8 text-slate-300">
            Every meaningful workforce activity becomes structured context: task creation, assignment, completion, overdue pressure, attendance, leave and team movement.
          </p>
        </div>
        <div className="story-reveal relative opacity-0">
          <div className="absolute left-8 top-8 bottom-8 w-px bg-sky-300/30" />
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step} className="relative rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-sky-300/30 bg-sky-300/10 text-sm font-bold text-sky-100">{index + 1}</span>
                  <div>
                    <h3 className="font-semibold">{step}</h3>
                    <p className="mt-1 text-sm text-slate-400">{index === 0 ? 'Collect fragmented work signals.' : index === 1 ? 'Normalize into operational events.' : index === 2 ? 'Build a role-aware workforce timeline.' : index === 3 ? 'Analyze pressure, trends and anomalies.' : 'Guide transparent decisions.'}</p>
                  </div>
                  <CheckCircle2 className="ml-auto text-sky-300" size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function AIIntelligenceSection() {
  return (
    <section className="story-section bg-[#020617] px-4 py-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionLabel>AI Intelligence</SectionLabel>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <h2 className="story-reveal opacity-0 text-4xl font-bold tracking-normal sm:text-6xl">
            AI reads the timeline and highlights what humans should review.
          </h2>
          <p className="story-reveal opacity-0 text-lg leading-8 text-slate-300">
            FOREP analyzes workload, burnout risk, anomalies, performance trends and team health. It recommends where to look next while keeping people in control.
          </p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {intelligence.map(([title, body, Icon]) => (
            <div key={title} className="story-reveal opacity-0 rounded-2xl border border-sky-300/15 bg-slate-950 p-6 shadow-[0_0_60px_rgba(14,165,233,0.08)]">
              <Icon size={24} className="text-sky-300" />
              <h3 className="mt-6 text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RoleValueSection() {
  return (
    <section className="story-section relative overflow-hidden bg-[#06101f] px-4 py-28 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 landing-grid opacity-20" />
      <div className="relative mx-auto max-w-7xl">
        <SectionLabel>Role-based Value</SectionLabel>
        <h2 className="story-reveal mt-5 max-w-4xl opacity-0 text-4xl font-bold tracking-normal sm:text-6xl">
          One platform, different operating views for every workforce role.
        </h2>
        <div className="mt-14 grid gap-4 lg:grid-cols-4">
          {roles.map(([title, body, Icon]) => (
            <div key={title} className="story-reveal opacity-0 rounded-2xl border border-white/10 bg-white/[0.07] p-6">
              <div className="flex items-center justify-between">
                <Icon className="text-sky-300" size={24} />
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300">{title}</span>
              </div>
              <h3 className="mt-8 text-2xl font-semibold">{title}</h3>
              <p className="mt-4 text-sm leading-6 text-slate-300">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DashboardPreviewSection() {
  const rows = [
    ['Burnout signal', 'Backend team pressure rising', 'Review'],
    ['Leave overlap', 'Two critical owners unavailable', 'Plan'],
    ['Task anomaly', 'Overdue work increasing', 'Rebalance'],
  ]
  return (
    <section className="story-section bg-[#020617] px-4 py-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionLabel>Dashboard Preview</SectionLabel>
          <h2 className="story-reveal mt-5 opacity-0 text-4xl font-bold tracking-normal sm:text-6xl">
            A command center for workforce intelligence, not a surveillance feed.
          </h2>
          <p className="story-reveal mt-6 text-lg leading-8 text-slate-300">
            FOREP presents clear operational context: what changed, why it matters, which role should review it, and what action is available next.
          </p>
        </div>
        <div className="story-reveal opacity-0 rounded-2xl border border-white/12 bg-white/[0.06] p-4 shadow-2xl shadow-sky-950/40">
          <div className="rounded-xl border border-white/10 bg-[#07111f] p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-300">Workforce Risk Console</p>
                <h3 className="mt-2 text-2xl font-semibold">Team health timeline</h3>
              </div>
              <ShieldCheck className="text-sky-300" />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {['Workload', 'Attendance', 'AI Review'].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item}</p>
                  <div className="mt-5 h-2 rounded-full bg-sky-300/70" />
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              {rows.map(([type, title, action]) => (
                <div key={title} className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">{type}</span>
                    <p className="font-semibold">{title}</p>
                    <span className="ml-auto rounded-lg bg-sky-300/10 px-3 py-1 text-xs font-semibold text-sky-100">{action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function IntegrationsSection() {
  return (
    <section className="story-section bg-[#050b18] px-4 py-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionLabel>Integrations</SectionLabel>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <h2 className="story-reveal opacity-0 text-4xl font-bold tracking-normal sm:text-6xl">
            Built around operational data your teams already create.
          </h2>
          <p className="story-reveal opacity-0 text-lg leading-8 text-slate-300">
            FOREP starts with core workforce operations and expands into the systems that shape daily work. The goal is one coherent operating picture, not another disconnected dashboard.
          </p>
        </div>
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {integrations.map((item) => (
            <div key={item} className="story-reveal opacity-0 rounded-2xl border border-white/10 bg-white/[0.06] p-5">
              <GitBranch size={18} className="text-sky-300" />
              <p className="mt-4 font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LandingCTASection() {
  return (
    <section className="story-section relative min-h-screen overflow-hidden bg-[#020617] px-4 py-28 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 landing-grid opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(14,165,233,0.24),transparent_34%)]" />
      <div className="relative mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center text-center">
        <SectionLabel>Ready</SectionLabel>
        <h2 className="story-reveal mt-5 opacity-0 text-5xl font-bold tracking-normal sm:text-7xl">
          Turn workforce operations into intelligent action.
        </h2>
        <p className="story-reveal mt-6 max-w-2xl opacity-0 text-lg leading-8 text-slate-300">
          Open the platform, explore the role-based workflow, or request a guided walkthrough for your team.
        </p>
        <div className="story-reveal mt-10 flex flex-col gap-3 opacity-0 sm:flex-row">
          <Link to="/login" className="rounded-lg bg-[#0ea5e9] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500">Login</Link>
          <a href="mailto:hello@forep.ai?subject=FOREP%20Demo%20Request" className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15">Request Demo</a>
          <a href="#features" className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Explore Features</a>
        </div>
      </div>
    </section>
  )
}

function ScrollytellingSections() {
  const ref = useReveal()
  return (
    <div ref={ref} className="bg-[#020617]">
      <ProblemSection />
      <SolutionSection />
      <AIIntelligenceSection />
      <RoleValueSection />
      <DashboardPreviewSection />
      <IntegrationsSection />
      <LandingCTASection />
    </div>
  )
}

export default ScrollytellingSections
