import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

const traditional = ['Employee CRUD', 'Static records', 'Manual reporting', 'Limited operational visibility']
const forep = ['Workflow intelligence', 'Operational event timeline', 'Workload analysis', 'Burnout signal detection', 'AI-driven insights']

function AboutSection() {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      animate(node.querySelectorAll('.compare-card'), { opacity: [0, 1], translateY: [34, 0], delay: stagger(140), duration: 750, ease: 'outCubic' })
      observer.disconnect()
    }, { threshold: 0.25 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" ref={ref} className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#0ea5e9]">The Difference</p>
          <h2 className="mt-4 text-4xl font-bold tracking-normal text-[#0f172a]">FOREP goes beyond static HR records.</h2>
          <p className="mt-5 text-lg leading-8 text-[#64748b]">It reads the operational pulse of daily work, turning activity into context managers can actually use.</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="compare-card opacity-0 rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#0f172a]">Traditional HRM</h3>
            <div className="mt-6 space-y-3">{traditional.map((item) => <p key={item} className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-[#64748b]">{item}</p>)}</div>
          </div>
          <div className="compare-card opacity-0 rounded-lg border border-sky-100 bg-white p-6 shadow-xl shadow-sky-100/60">
            <h3 className="text-xl font-semibold text-[#0f172a]">FOREP</h3>
            <div className="mt-6 space-y-3">{forep.map((item) => <p key={item} className="rounded-lg bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">{item}</p>)}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
