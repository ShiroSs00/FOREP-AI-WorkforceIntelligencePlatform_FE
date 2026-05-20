import { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { animate, stagger } from 'animejs'

const steps = [
  ['Workflow Data', 'Collect task, attendance, leave and tool activity from internal and external platforms.'],
  ['Operational Events', 'Convert actions into structured events such as task created, task overdue, PR merged or response delayed.'],
  ['Analytics', 'Analyze workload distribution, productivity patterns, overdue trends and team performance.'],
  ['AI Insights', 'Generate summaries, burnout signals and workflow recommendations using organizational context.'],
  ['Manager Actions', 'Support managers in making clearer workload and team decisions.'],
]

function WorkflowPipeline() {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      animate(node.querySelectorAll('.pipeline-card'), { opacity: [0, 1], translateY: [30, 0], delay: stagger(130), duration: 700, ease: 'outCubic' })
      animate(node.querySelectorAll('.pipeline-arrow'), { opacity: [0.2, 1], translateX: [-12, 0], delay: stagger(160, { start: 250 }), duration: 700, ease: 'outCubic' })
      observer.disconnect()
    }, { threshold: 0.25 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="workflow" ref={ref} className="relative overflow-hidden border-y border-[#e2e8f0] bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="relative mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#0ea5e9]">Workflow Pipeline</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-normal text-[#0f172a]">From scattered activity to operational intelligence.</h2>
        <div className="mt-12 grid gap-4 lg:grid-cols-5">
          {steps.map(([title, text], index) => (
            <div key={title} className="relative">
              <article className="pipeline-card h-full opacity-0 rounded-lg border border-[#e2e8f0] bg-white/90 p-5 shadow-sm backdrop-blur">
                <h3 className="font-semibold text-[#0f172a]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#64748b]">{text}</p>
              </article>
              {index < steps.length - 1 ? <ArrowRight className="pipeline-arrow absolute -right-6 top-1/2 hidden -translate-y-1/2 text-[#0ea5e9] lg:block" size={24} /> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WorkflowPipeline
