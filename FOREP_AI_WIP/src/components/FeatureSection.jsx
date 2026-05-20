import { useEffect, useRef } from 'react'
import { Bell, BrainCircuit, CalendarCheck, ChartNoAxesCombined, ClipboardList, KeyRound, Network, UsersRound, Workflow } from 'lucide-react'
import { animate, stagger } from 'animejs'

const modules = [
  ['Authentication & Authorization', KeyRound],
  ['Employee & Team Management', UsersRound],
  ['Task & Workflow Management', ClipboardList],
  ['Event Timeline System', Workflow],
  ['Workload Analytics Dashboard', ChartNoAxesCombined],
  ['AI Insight Generation', BrainCircuit],
  ['Attendance & Leave Tracking', CalendarCheck],
  ['Productivity & Contribution Tracking', Network],
  ['Notification Center', Bell],
]

const stack = ['Spring Boot 3', 'Java 21', 'PostgreSQL', 'Spring Security + JWT', 'NextJS', 'FastAPI', 'Ollama AI']

function FeatureSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      animate(node.querySelectorAll('.feature-card'), { opacity: [0, 1], translateY: [32, 0], delay: stagger(80), duration: 650, ease: 'outCubic' })
      observer.disconnect()
    }, { threshold: 0.2 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" ref={sectionRef} className="bg-[#f8fafc] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#0ea5e9]">Product Modules</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-normal text-[#0f172a]">A modular MVP for operational intelligence workflows.</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modules.map(([title, Icon]) => (
            <article key={title} className="feature-card opacity-0 rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-sm">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-sky-50 text-[#0ea5e9]"><Icon size={22} /></div>
              <h3 className="mt-5 font-semibold text-[#0f172a]">{title}</h3>
            </article>
          ))}
        </div>
        <div className="mt-20 rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#0ea5e9]">Tech Stack</p>
          <div className="mt-5 flex flex-wrap gap-3">{stack.map((item) => <span key={item} className="rounded-full border border-[#e2e8f0] bg-slate-50 px-4 py-2 text-sm font-semibold text-[#0f172a]">{item}</span>)}</div>
          <p className="mt-5 text-sm leading-6 text-[#64748b]">Designed as a modular MVP for EXE201 with backend, frontend, AI analytics and business roles.</p>
        </div>
      </div>
    </section>
  )
}

export default FeatureSection
