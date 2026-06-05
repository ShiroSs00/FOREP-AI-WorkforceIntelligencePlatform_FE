import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate } from 'animejs'

function FinalCTASection() {
  const ref = useRef(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      animate(node.querySelector('.cta-card'), { opacity: [0, 1], translateY: [36, 0], duration: 700, ease: 'outCubic' })
      observer.disconnect()
    }, { threshold: 0.25 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="relative flex min-h-screen items-center overflow-hidden bg-[#020617] px-4 py-24 text-white sm:px-6 lg:px-8">
      <div aria-hidden="true" className="absolute inset-0 landing-grid opacity-35" />
      <div className="cta-card relative mx-auto max-w-4xl rounded-lg border border-sky-400/35 bg-white/[0.10] p-10 text-center opacity-0 shadow-[0_0_80px_rgba(14,165,233,0.16)] backdrop-blur">
        <h2 className="text-5xl font-bold tracking-normal">Ready to explore FOREP?</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-100">Enter the platform interface and review the AI Workforce Intelligence workflow.</p>
        <Link to="/login" className="mt-10 inline-flex rounded-lg bg-[#0ea5e9] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500">Go to Login</Link>
      </div>
    </section>
  )
}

export default FinalCTASection
