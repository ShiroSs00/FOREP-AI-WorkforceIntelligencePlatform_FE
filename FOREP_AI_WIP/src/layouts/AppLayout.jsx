import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import Sidebar from '../components/app/Sidebar.jsx'
import TopHeader from '../components/app/TopHeader.jsx'
import PageTransition from '../components/app/PageTransition.jsx'
import RoleAccessNotice from '../components/app/RoleAccessNotice.jsx'
import { useRole } from '../context/role.js'

const titles = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Tasks',
  '/employees': 'Employees',
  '/teams': 'Teams',
  '/sprints': 'Sprints',
  '/events': 'Events Timeline',
  '/analytics': 'Analytics',
  '/ai-insights': 'AI Insights',
  '/attendance': 'Attendance',
  '/leave': 'Leave Requests',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/organizations': 'Organizations',
  '/users': 'Users',
  '/integrations': 'Integrations',
  '/monitoring': 'System Monitoring',
  '/reports': 'Reports',
  '/recruitment': 'Recruitment',
  '/profile': 'Profile',
}

function AppLayout() {
  const layoutRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { availableRoutes } = useRole()
  const title = titles[location.pathname] ?? 'Dashboard'
  const hasAccess = availableRoutes.includes(location.pathname)

  useEffect(() => {
    const root = layoutRef.current
    if (!root) return undefined
    const cards = root.querySelectorAll('.page-animate')
    const animations = [
      animate(cards, { opacity: [0, 1], translateY: [22, 0], delay: stagger(70), duration: 560, ease: 'outCubic' }),
    ].filter(Boolean)

    return () => animations.forEach((animation) => animation.pause())
  }, [title])

  useEffect(() => {
    const handleAuthExpired = () => navigate('/login', { replace: true })
    window.addEventListener('forep-auth-expired', handleAuthExpired)
    return () => window.removeEventListener('forep-auth-expired', handleAuthExpired)
  }, [navigate])

  return (
    <div ref={layoutRef} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Sidebar />
      <main className="min-h-screen lg:pl-[260px]">
        <TopHeader title={title} />
        <PageTransition>
          {hasAccess ? <Outlet /> : <RoleAccessNotice />}
        </PageTransition>
      </main>
    </div>
  )
}

export default AppLayout
