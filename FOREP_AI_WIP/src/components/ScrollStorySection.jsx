import { useEffect, useRef, useState } from 'react'
import { animate, stagger } from 'animejs'

const stages = [
  {
    title: 'Collect workflow signals.',
    description: 'FOREP gathers daily work activity from tasks, attendance, leave records and collaboration tools.',
    type: 'sources',
  },
  {
    title: 'Transform activity into operational events.',
    description: 'Important actions become structured events that form a timeline of how the organization actually works.',
    type: 'events',
  },
  {
    title: 'Analyze workload and productivity patterns.',
    description: 'FOREP reads the event timeline to detect workload pressure, contribution trends, overdue patterns and operational anomalies.',
    type: 'analytics',
  },
  {
    title: 'Generate AI insights for better decisions.',
    description: 'AI summarizes team status, detects overload risk and suggests workflow improvements for managers and employees.',
    type: 'insights',
  },
]

function StageVisual({ type }) {
  if (type === 'sources') {
    return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{['Jira', 'GitHub', 'Gmail', 'Slack', 'Trello', 'Notion', 'Internal Tasks', 'Attendance'].map((item) => <div key={item} className="story-visual-card rounded-lg border border-white/10 bg-white/10 p-4 text-center text-sm font-semibold text-sky-100 backdrop-blur">{item}</div>)}</div>
  }
  if (type === 'events') {
    return <div className="space-y-3">{['TASK_CREATED', 'TASK_ASSIGNED', 'TASK_COMPLETED', 'TASK_OVERDUE', 'PR_MERGED', 'EMAIL_RESPONSE_DELAY', 'LEAVE_REQUESTED'].map((item) => <div key={item} className="story-visual-card rounded-lg border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm font-semibold text-sky-100">{item}</div>)}</div>
  }
  if (type === 'analytics') {
    return <div className="grid gap-4 sm:grid-cols-2">{['Workload Distribution', 'Productivity Trend', 'Overdue Pattern', 'Team Contribution', 'Anomaly Signal'].map((item) => <div key={item} className="story-visual-card rounded-lg border border-white/10 bg-slate-900 p-5 text-sm font-semibold text-slate-200"><div className="mb-4 h-2 rounded-full bg-sky-400/60" /><p>{item}</p></div>)}</div>
  }
  return <div className="rounded-lg border border-sky-400/20 bg-white/10 p-5 backdrop-blur"><p className="text-sm font-semibold text-sky-100">AI Insight Panel</p><div className="mt-5 space-y-3">{['Review workload balance', 'Check overdue bottlenecks', 'Support high-pressure teams', 'Improve task assignment flow'].map((item) => <div key={item} className="story-visual-card rounded-lg bg-white/10 px-4 py-3 text-sm text-slate-200">{item}</div>)}</div></div>
}

function ScrollStorySection() {
  const sectionRef = useRef(null)
  const visualRef = useRef(null)
  const rafRef = useRef(null)
  const [stageIndex, setStageIndex] = useState(0)
  const stageIndexRef = useRef(0)

  useEffect(() => {
    const updateStage = () => {
      rafRef.current = null
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable))
      const nextStage = Math.min(stages.length - 1, Math.floor(progress * stages.length))
      if (nextStage !== stageIndexRef.current) {
        stageIndexRef.current = nextStage
        setStageIndex(nextStage)
      }
    }
    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(updateStage)
    }
    updateStage()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    const visual = visualRef.current
    if (!visual) return
    animate(visual, { opacity: [0, 1], translateY: [24, 0], scale: [0.98, 1], duration: 600, ease: 'outCubic' })
    animate(visual.querySelectorAll('.story-visual-card'), { opacity: [0, 1], translateY: [18, 0], delay: stagger(70), duration: 520, ease: 'outCubic' })
  }, [stageIndex])

  const stage = stages[stageIndex]

  return (
    <section id="insights" ref={sectionRef} className="relative h-[400vh] bg-[#07111f] text-white">
      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.10)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div key={stage.title}>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#0ea5e9]">Cinematic Workflow</p>
            <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-normal sm:text-6xl">{stage.title}</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">{stage.description}</p>
            <div className="mt-8 flex gap-3">{stages.map((item, index) => <span key={item.title} className={`h-2.5 w-10 rounded-full transition ${stageIndex === index ? 'bg-[#0ea5e9]' : 'bg-white/20'}`} />)}</div>
          </div>
          <div ref={visualRef} key={stage.type} className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/40 backdrop-blur">
            <StageVisual type={stage.type} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ScrollStorySection
