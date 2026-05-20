import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, stagger } from 'animejs'

const concepts = ['Task Activity', 'Workload Signal', 'Attendance Event', 'Pull Request', 'Email Delay', 'AI Insight']

function HeroSection() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const curtains = root.querySelectorAll('.curtain-panel')
    const cards = root.querySelectorAll('.floating-concept-card')
    const title = root.querySelectorAll('.hero-copy')

    const curtainAnimation = animate(curtains, {
      translateX: (_, i) => (i === 0 ? '-105%' : '105%'),
      duration: 1300,
      delay: 350,
      ease: 'inOutCubic',
    })
    const copyAnimation = animate(title, {
      opacity: [0, 1],
      translateY: [24, 0],
      delay: stagger(120, { start: 900 }),
      duration: 750,
      ease: 'outCubic',
    })
    const floatingAnimation = animate(cards, {
      translateY: (_, i) => [0, i % 2 ? -24 : 24],
      translateX: (_, i) => [0, i % 2 ? 18 : -18],
      rotate: (_, i) => [0, i % 2 ? 3 : -3],
      duration: 4200,
      direction: 'alternate',
      loop: true,
      delay: stagger(140),
      ease: 'inOutSine',
    })

    return () => {
      curtainAnimation.pause()
      copyAnimation.pause()
      floatingAnimation.pause()
    }
  }, [])

  return (
    <section ref={rootRef} className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#07111f] px-4 text-white sm:px-6 lg:px-8">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(14,165,233,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.12)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_35%,rgba(14,165,233,0.22),transparent_34%),linear-gradient(180deg,rgba(7,17,31,0.2),#07111f)]" />
      <div aria-hidden="true" className="curtain-panel absolute inset-y-0 left-0 z-30 w-1/2 bg-slate-950" />
      <div aria-hidden="true" className="curtain-panel absolute inset-y-0 right-0 z-30 w-1/2 bg-slate-950" />

      <div className="absolute inset-0 mx-auto max-w-7xl">
        {concepts.map((concept, index) => (
          <div
            key={concept}
            className="floating-concept-card absolute hidden rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-sky-100 shadow-2xl shadow-slate-950/30 backdrop-blur md:block"
            style={{
              left: `${[6, 72, 12, 78, 18, 68][index]}%`,
              top: `${[20, 22, 62, 58, 38, 76][index]}%`,
            }}
          >
            {concept}
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="max-w-4xl">
          <p className="hero-copy opacity-0 text-sm font-bold uppercase tracking-[0.28em] text-[#0ea5e9]">FOREP</p>
          <p className="hero-copy mt-4 opacity-0 text-lg font-semibold text-slate-300">AI Workforce Intelligence Platform</p>
          <h1 className="hero-copy mt-7 opacity-0 text-5xl font-bold leading-tight tracking-normal sm:text-7xl">
            Turn daily workflow activity into AI-powered operational intelligence.
          </h1>
          <p className="hero-copy mt-6 max-w-3xl opacity-0 text-lg leading-8 text-slate-300">
            FOREP helps teams collect workflow data, transform it into operational events, analyze team performance and generate AI insights for better management decisions.
          </p>
          <div className="hero-copy mt-10 flex flex-col gap-3 opacity-0 sm:flex-row">
            <button type="button" onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-lg bg-[#0ea5e9] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500">
              Explore Workflow
            </button>
            <Link to="/login" className="rounded-lg border border-white/15 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15">
              Login Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
