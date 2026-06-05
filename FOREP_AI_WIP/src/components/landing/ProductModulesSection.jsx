import { useEffect, useRef } from 'react'
import { Bell, BrainCircuit, CalendarCheck, ClipboardList, GitBranch, KeyRound, LayoutDashboard, UsersRound } from 'lucide-react'
import { animate, stagger } from 'animejs'

const modules = [
  ['Employee & Team Management', UsersRound],
  ['Task System', ClipboardList],
  ['GitHub Integration', GitBranch],
  ['Workload Dashboard', LayoutDashboard],
  ['Weekly AI Insight', BrainCircuit],
  ['Attendance Tracking', CalendarCheck],
  ['Leave Requests', CalendarCheck],
  ['RBAC: Admin, Manager, Employee', KeyRound],
  ['Notification Center', Bell],
]

function ProductModulesSection() {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      animate(node.querySelectorAll('.module-card'), { opacity: [0, 1], translateY: [36, 0], delay: stagger(80), duration: 650, ease: 'outCubic' })
      observer.disconnect()
    }, { threshold: 0.2 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} id="features" className="bg-[var(--bg)] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#0ea5e9]">MVP Modules</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-normal text-[var(--text)]">Focused MVP scope for a backend-ready workforce intelligence platform.</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modules.map(([title, Icon]) => (
            <article key={title} className="module-card group opacity-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:shadow-none">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-sky-50 text-[#0ea5e9] transition group-hover:-translate-y-1 dark:bg-sky-950/40 dark:text-[#38bdf8]"><Icon size={22} /></div>
              <h3 className="mt-5 font-semibold text-[var(--text)]">{title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductModulesSection
