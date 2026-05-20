import { Link } from 'react-router-dom'

function CTASection() {
  return (
    <section className="bg-[#07111f] px-4 py-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#0ea5e9]">Demo Dashboard</p>
        <h2 className="mt-4 text-5xl font-bold tracking-normal">Ready to explore FOREP?</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          Enter the demo dashboard and experience the AI Workforce Intelligence workflow.
        </p>
        <Link to="/login" className="mt-10 inline-flex rounded-lg bg-[#0ea5e9] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500">
          Login to Demo
        </Link>
      </div>
    </section>
  )
}

export default CTASection
