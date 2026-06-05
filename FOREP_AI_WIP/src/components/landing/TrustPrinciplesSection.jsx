import { useEffect, useRef } from 'react'
import { EyeOff, Flame, Shuffle, UserRoundCheck } from 'lucide-react'
import { animate, stagger } from 'animejs'

const pains = [
  ['Manager blind spot', 'Managers often lack a clear, shared view of real work progress.', EyeOff],
  ['Unfair evaluation', 'Employees can be judged without enough workflow context.', UserRoundCheck],
  ['Burnout invisible', 'Workload pressure can stay hidden until it becomes serious.', Flame],
  ['Context switching cost', 'Work is scattered across tasks, code, attendance, and leave records.', Shuffle],
]

function TrustPrinciplesSection() {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      animate(node.querySelectorAll('.pain-card'), { opacity: [0, 1], translateY: [30, 0], delay: stagger(110), duration: 650, ease: 'outCubic' })
      observer.disconnect()
    }, { threshold: 0.2 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="relative overflow-hidden bg-[var(--bg)] px-4 py-24 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="absolute inset-0 landing-grid opacity-20" />
      <div className="relative mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#0ea5e9]">The Pain</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-normal text-[var(--text)]">Teams do not need more monitoring. They need better operational context.</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {pains.map(([title, text, Icon]) => (
            <article key={title} className="pain-card opacity-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm dark:shadow-none">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-sky-50 text-[#0ea5e9] dark:bg-sky-950/40 dark:text-[#38bdf8]"><Icon size={22} /></div>
              <h3 className="mt-5 font-semibold text-[var(--text)]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustPrinciplesSection
