import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

const stack = [
  'Frontend Prototype: React + Vite',
  'Production Direction: Next.js 14+ App Router',
  'Spring Boot 3',
  'Java 21',
  'PostgreSQL',
  'Redis',
  'Spring Security + JWT',
  'FastAPI',
  'Ollama',
  'OpenAI fallback',
  'GitHub API',
  'Google OAuth',
  'Docker Compose',
  'Nginx reverse proxy later',
  'No Kubernetes for MVP',
]

function TechStackOrbit() {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      animate(node.querySelector('.architecture-card'), { opacity: [0, 1], scale: [0.92, 1], duration: reduced ? 1 : 700, ease: 'outCubic' })
      animate(node.querySelectorAll('.orbit-badge'), { opacity: [0, 1], scale: [0.9, 1], delay: stagger(reduced ? 0 : 55), duration: reduced ? 1 : 620, ease: 'outCubic' })
      if (!reduced) animate(node.querySelectorAll('.orbit-badge'), { translateY: (_, index) => [0, index % 2 ? -10 : 10], duration: 3200, direction: 'alternate', loop: true, delay: stagger(80), ease: 'inOutSine' })
      observer.disconnect()
    }, { threshold: 0.25 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="overflow-hidden bg-[var(--surface)] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative mx-auto hidden h-[620px] max-w-6xl place-items-center md:grid">
          <div className="architecture-card grid h-60 w-60 place-items-center rounded-full border border-sky-100 bg-sky-50 text-center opacity-0 shadow-2xl shadow-sky-100 dark:border-sky-900 dark:bg-sky-950/30 dark:shadow-none">
            <div><p className="text-sm font-bold uppercase tracking-[0.22em] text-[#0ea5e9]">FOREP</p><h2 className="mt-3 text-2xl font-bold text-[var(--text)]">MVP Architecture</h2></div>
          </div>
          {stack.map((item, index) => {
            const angle = (index / stack.length) * Math.PI * 2
            return <span key={item} className="orbit-badge absolute max-w-56 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-center text-xs font-semibold text-[var(--text)] opacity-0 shadow-sm" style={{ left: `calc(50% + ${Math.cos(angle) * 420}px)`, top: `calc(50% + ${Math.sin(angle) * 245}px)`, transform: 'translate(-50%, -50%)' }}>{item}</span>
          })}
        </div>
        <div className="md:hidden">
          <h2 className="text-3xl font-bold text-[var(--text)]">FOREP MVP Architecture</h2>
          <div className="mt-6 grid gap-3">{stack.map((item) => <span key={item} className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold">{item}</span>)}</div>
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-[var(--muted)]">Current prototype uses React + Vite for fast development. Production frontend may migrate to Next.js App Router for SSR and SEO.</p>
      </div>
    </section>
  )
}

export default TechStackOrbit
