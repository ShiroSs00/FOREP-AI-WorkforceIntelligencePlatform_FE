import { useEffect, useRef, useState } from 'react'
import { animate, stagger } from 'animejs'
import EventChip from './EventChip.jsx'
import InsightConsole from './InsightConsole.jsx'

const stages = [
  {
    eyebrow: 'Workflow Data',
    title: 'Collect workflow signals.',
    description: 'FOREP gathers daily activity from internal tasks, GitHub, attendance, and leave records.',
    type: 'sources',
  },
  {
    eyebrow: 'Operational Events',
    title: 'Transform actions into operational events.',
    description: 'Important workflow activity becomes structured events that form a timeline of how the organization works.',
    type: 'events',
  },
  {
    eyebrow: 'Workload Analytics',
    title: 'Analyze workload and contribution patterns.',
    description: 'FOREP reads the event timeline to identify workload distribution, overdue patterns, contribution signals, and operational anomalies.',
    type: 'analytics',
  },
  {
    eyebrow: 'Weekly AI Summary',
    title: 'Generate weekly AI insights.',
    description: 'AI summarizes team status, detects workload anomalies, and suggests workflow improvements while keeping humans in control.',
    type: 'insights',
  },
  {
    eyebrow: 'Manager Actions',
    title: 'Support better management decisions.',
    description: 'Managers can understand operational reality, rebalance work, and improve team health without turning FOREP into surveillance.',
    type: 'actions',
  },
]

function StageVisual({ type }) {
  if (type === 'sources') {
    const primary = ['Internal Tasks', 'GitHub Commits', 'Pull Requests', 'Attendance', 'Leave Requests']
    const future = ['Future: Jira', 'Future: Slack', 'Future: Gmail', 'Future: Trello', 'Future: Notion']
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[...primary, ...future].map((item, index) => (
          <div
            key={item}
            className={`stage-item rounded-lg border border-white/20 bg-white/15 p-4 text-sm font-semibold backdrop-blur ${item.startsWith('Future') ? 'text-slate-200' : 'text-white'}`}
            style={{ transform: `translate(${(index % 3 - 1) * 12}px, ${(index % 2 ? 1 : -1) * 10}px)` }}
          >
            {item}
          </div>
        ))}
      </div>
    )
  }

  if (type === 'events') {
    return (
      <div className="flex flex-wrap gap-3">
        {['TASK_CREATED', 'TASK_ASSIGNED', 'TASK_COMPLETED', 'TASK_OVERDUE', 'PR_MERGED', 'LEAVE_REQUESTED', 'ATTENDANCE_RECORDED', 'Future: EMAIL_RESPONSE_DELAY'].map((item) => <EventChip key={item}>{item}</EventChip>)}
      </div>
    )
  }

  if (type === 'analytics') {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {['Workload Distribution', 'Overdue Pattern', 'Team Contribution', 'Attendance Signal', 'Anomaly Signal'].map((item) => (
          <div key={item} className="stage-item rounded-lg border border-white/20 bg-slate-950/80 p-5">
            <div className="mb-4 h-2 rounded-full bg-sky-400/70" />
            <p className="text-sm font-semibold text-white">{item}</p>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'insights') return <InsightConsole />

  return (
    <div className="mx-auto grid max-w-xl gap-3">
      {['Reassign Tasks', 'Review Timeline', 'Monitor Workload', 'Support Team', 'Improve Workflow', 'Share Transparent Feedback'].map((item) => (
        <div key={item} className="stage-item rounded-lg border border-sky-400/30 bg-white/15 p-4 text-center text-sm font-semibold text-white">{item}</div>
      ))}
    </div>
  )
}

function ParallaxWorkflow() {
  const sectionRef = useRef(null)
  const rafRef = useRef(null)
  const stageRef = useRef(0)
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    const update = () => {
      rafRef.current = null
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const total = section.offsetHeight - window.innerHeight
      const progress = Math.min(1, Math.max(0, -rect.top / total))
      const next = Math.min(4, Math.floor(progress * 5))
      if (next !== stageRef.current) {
        stageRef.current = next
        setStageIndex(next)
      }
    }
    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    const root = sectionRef.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scene = root?.querySelector('.workflow-scene')
    const items = root?.querySelectorAll('.stage-item, .event-chip')
    if (!scene || !items) return
    animate(scene, { opacity: [0, 1], translateY: [reduced ? 0 : 24, 0], scale: [0.98, 1], duration: reduced ? 1 : 560, ease: 'outCubic' })
    animate(items, { opacity: [0, 1], translateY: [reduced ? 0 : 22, 0], translateX: [stageIndex === 1 ? -18 : 0, 0], delay: stagger(reduced ? 0 : 65), duration: reduced ? 1 : 520, ease: 'outCubic' })
  }, [stageIndex])

  const stage = stages[stageIndex]

  return (
    <section id="parallax-workflow" ref={sectionRef} className="relative h-[500vh] bg-[#020617] text-white">
      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="absolute inset-0 landing-grid opacity-40" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div key={stage.title}>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#0ea5e9]">{stage.eyebrow}</p>
            <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-normal sm:text-6xl">{stage.title}</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-100">{stage.description}</p>
            <div className="mt-8 flex gap-3">{stages.map((item, index) => <span key={item.title} className={`h-2.5 rounded-full transition-all ${index === stageIndex ? 'w-12 bg-[#0ea5e9]' : 'w-7 bg-white/20'}`} />)}</div>
          </div>
          <div key={stage.type} className="workflow-scene rounded-lg border border-white/20 bg-white/[0.10] p-5 shadow-2xl shadow-slate-950/40 backdrop-blur">
            <StageVisual type={stage.type} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ParallaxWorkflow
