import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

const surveillance = ['Tracks people secretly', 'Focuses on control', 'Creates fear', 'Hides data from employees']
const transparency = ['Shows data sources', 'Employees can view their own data', 'No keystroke tracking', 'No screen tracking', 'AI gives suggestions, humans decide']

function ComparisonSection() {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      animate(node.querySelector('.compare-left'), { opacity: [0, 1], translateX: [-48, 0], duration: 700, ease: 'outCubic' })
      animate(node.querySelector('.compare-right'), { opacity: [0, 1], translateX: [48, 0], duration: 700, ease: 'outCubic' })
      observer.disconnect()
    }, { threshold: 0.25 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} id="trust" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="absolute inset-0 landing-grid opacity-30" />
      <div className="relative mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#0ea5e9]">Transparency, Not Surveillance</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-normal text-[var(--text)]">FOREP is built to make work visible without making people feel watched.</h2>
        <div className="relative mt-12 grid gap-8 lg:grid-cols-[1fr_auto_1fr]">
          <div className="compare-left opacity-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[var(--text)]">Surveillance mindset</h3>
            <div className="mt-6 space-y-3">{surveillance.map((item) => <p key={item} className="rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 dark:bg-slate-900 dark:text-slate-100">{item}</p>)}</div>
          </div>
          <div className="hidden w-px bg-[#0ea5e9] shadow-[0_0_36px_rgba(14,165,233,0.65)] lg:block" />
          <div className="compare-right opacity-0 rounded-lg border border-sky-100 bg-[var(--surface)] p-6 shadow-xl shadow-sky-100/60 dark:border-sky-900 dark:shadow-none">
            <h3 className="text-xl font-semibold text-[var(--text)]">FOREP transparency</h3>
            <div className="mt-6 space-y-3">{transparency.map((item) => <p key={item} className="rounded-lg bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700 dark:bg-sky-950/40 dark:text-sky-200">{item}</p>)}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ComparisonSection
