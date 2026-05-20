import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import ThemeToggle from '../app/ThemeToggle.jsx'

const words = 'Turn daily workflow activity into AI-powered operational intelligence.'.split(' ')

function HeroSection() {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const copy = root.querySelectorAll('.hero-reveal')
    const wordNodes = root.querySelectorAll('.headline-word')

    const copyAnimation = animate([...copy, ...wordNodes], { opacity: [0, 1], translateY: [18, 0], delay: stagger(reduced ? 0 : 65, { start: reduced ? 0 : 750 }), duration: reduced ? 1 : 650, ease: 'outCubic' })
    return () => {
      copyAnimation.pause()
    }
  }, [])

  return (
    <section ref={ref} className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#020617] px-4 text-white sm:px-6 lg:px-8">
      <div aria-hidden="true" className="absolute inset-0 -z-10 landing-grid opacity-60" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_35%,rgba(14,165,233,0.22),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0.25),#020617)]" />
      <div className="absolute right-4 top-4 z-20 sm:right-6 lg:right-8">
        <ThemeToggle />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="max-w-5xl">
          <p className="hero-reveal opacity-0 text-sm font-bold uppercase tracking-[0.3em] text-[#0ea5e9]">FOREP</p>
          <p className="hero-reveal mt-4 opacity-0 text-lg font-semibold text-slate-300">AI Workforce Intelligence Platform</p>
          <h1 className="mt-7 max-w-5xl text-5xl font-bold leading-tight tracking-normal sm:text-7xl">
            {words.map((word, index) => <span key={`${word}-${index}`} className="headline-word mr-3 inline-block opacity-0">{word}</span>)}
          </h1>
          <p className="hero-reveal mt-6 max-w-3xl opacity-0 text-lg leading-8 text-slate-300">
            FOREP transforms tasks, attendance, collaboration signals and operational events into workload analytics and AI insights for better team decisions.
          </p>
          <div className="hero-reveal mt-10 flex flex-col gap-3 opacity-0 sm:flex-row">
            <button type="button" onClick={() => document.getElementById('parallax-workflow')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-lg bg-[#0ea5e9] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500">Explore Workflow</button>
            <Link to="/login" className="rounded-lg border border-white/15 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15">Login</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
