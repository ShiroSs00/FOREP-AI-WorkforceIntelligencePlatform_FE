import { Link, useLocation } from 'react-router-dom'

const scrollToSection = (id) => {
  const element = document.getElementById(id)
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Navbar() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e2e8f0]/80 bg-white/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 font-semibold text-[#0f172a]">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0ea5e9] text-sm font-bold text-white shadow-sm">
            AI
          </span>
          <span>AI Workforce</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-[#64748b] md:flex">
          {[
            ['About', 'about'],
            ['Features', 'features'],
            ['Insights', 'insights'],
          ].map(([label, id]) => (
            <button
              key={id}
              type="button"
              onClick={() => (isLanding ? scrollToSection(id) : null)}
              className="transition hover:text-[#0ea5e9]"
            >
              {label}
            </button>
          ))}
          <Link to="/login" className="rounded-lg bg-[#0ea5e9] px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-sky-600">
            Login
          </Link>
        </div>
        <Link to="/login" className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm font-semibold text-[#0f172a] md:hidden">
          Login
        </Link>
      </nav>
    </header>
  )
}

export default Navbar
