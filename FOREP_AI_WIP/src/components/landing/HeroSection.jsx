import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import ThemeToggle from '../app/ThemeToggle.jsx'

const words = 'Reveal workforce risk before it becomes operational drag.'.split(' ')
const signalCards = [
  ['TASK_FLOW', 'Task delays, sprint movement, ownership gaps'],
  ['ATTENDANCE', 'Check-in patterns and team availability'],
  ['LEAVE', 'Absence planning and approval pressure'],
  ['PERFORMANCE', 'Contribution trends without surveillance'],
]

function HeroSection() {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const copy = root.querySelectorAll('.hero-reveal')
    const wordNodes = root.querySelectorAll('.headline-word')
    const cards = root.querySelectorAll('.hero-signal-card')

    const copyAnimation = animate([...copy, ...wordNodes], {
      opacity: [0, 1],
      translateY: [18, 0],
      delay: stagger(reduced ? 0 : 65, { start: reduced ? 0 : 750 }),
      duration: reduced ? 1 : 650,
      ease: 'outCubic',
    })
    const cardAnimation = animate(cards, {
      opacity: [0, 1],
      translateY: [reduced ? 0 : 26, 0],
      delay: stagger(reduced ? 0 : 110, { start: reduced ? 0 : 1050 }),
      duration: reduced ? 1 : 720,
      ease: 'outCubic',
    })

    return () => {
      copyAnimation.pause()
      cardAnimation.pause()
    }
  }, [])

  return (
    <section ref={ref} className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#020617] px-4 py-28 text-white sm:px-6 lg:px-8">
      <div aria-hidden="true" className="absolute inset-0 -z-10 landing-grid opacity-50" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_24%_24%,rgba(14,165,233,0.24),transparent_28%),radial-gradient(circle_at_80%_42%,rgba(99,102,241,0.18),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.1),#020617)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(120deg,transparent_0%,rgba(56,189,248,0.08)_45%,transparent_70%)]" />
      <div className="absolute right-4 top-4 z-20 sm:right-6 lg:right-8">
        <ThemeToggle className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/15 hover:text-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/15" />
      </div>
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-5xl">
          <p className="hero-reveal opacity-0 text-sm font-bold uppercase tracking-[0.3em] text-[#38bdf8]">FOREP</p>
          <p className="hero-reveal mt-4 opacity-0 text-lg font-semibold text-slate-100">AI Workforce Intelligence Platform</p>
          <h1 className="mt-7 max-w-5xl text-5xl font-bold leading-tight tracking-normal sm:text-7xl lg:text-8xl">
            {words.map((word, index) => <span key={`${word}-${index}`} className="headline-word mr-3 inline-block opacity-0">{word}</span>)}
          </h1>
          <p className="hero-reveal mt-6 inline-flex opacity-0 rounded-full border border-sky-400/25 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-100">
            Not a surveillance tool. A transparency tool.
          </p>
          <p className="hero-reveal mt-6 max-w-3xl opacity-0 text-lg leading-8 text-slate-100">
            FOREP turns fragmented task, attendance, leave and performance signals into one intelligent workforce timeline so leaders can act before risk becomes escalation.
          </p>
          <div className="hero-reveal mt-10 flex flex-col gap-3 opacity-0 sm:flex-row">
            <Link to="/login" className="rounded-lg bg-[#0ea5e9] px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500">Login</Link>
            <a href="#features" className="rounded-lg border border-white/25 bg-white/15 px-6 py-3 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">Explore Features</a>
          </div>
        </div>
        <div className="hero-reveal relative opacity-0">
          <div className="absolute -inset-10 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="relative rounded-2xl border border-white/15 bg-white/[0.07] p-4 shadow-2xl shadow-sky-950/60 backdrop-blur-xl">
            <div className="rounded-xl border border-white/10 bg-[#07111f]/90 p-4">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-300">Live Workforce Signals</p>
                  <p className="mt-1 text-sm text-slate-300">Operational events flowing into FOREP</p>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">AI READY</span>
              </div>
              <div className="space-y-3">
                {signalCards.map(([label, body], index) => (
                  <div key={label} className="hero-signal-card opacity-0 rounded-xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.9)]" />
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100">{label}</p>
                      <span className="ml-auto text-xs text-slate-400">0{index + 1}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
