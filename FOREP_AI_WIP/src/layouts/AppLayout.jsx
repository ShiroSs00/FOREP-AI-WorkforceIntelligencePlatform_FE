import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import Sidebar from '../components/app/Sidebar.jsx'
import TopHeader from '../components/app/TopHeader.jsx'
import PageTransition from '../components/app/PageTransition.jsx'
import RoleAccessNotice from '../components/app/RoleAccessNotice.jsx'
import { useRole } from '../context/role.js'
import { useLanguage } from '../context/language.js'

const titles = {
  '/dashboard': 'Tổng quan',
  '/tasks': 'Công việc',
  '/employees': 'Nhân viên',
  '/teams': 'Team',
  '/projects': 'Dự án đã import',
  '/sprints': 'Sprint',
  '/events': 'Repository đã import',
  '/analytics': 'Phân tích',
  '/ai-insights': 'Gợi ý AI',
  '/attendance': 'Chấm công',
  '/leave': 'Nghỉ phép',
  '/notifications': 'Thông báo',
  '/settings': 'Cài đặt',
  '/organizations': 'Tổ chức',
  '/users': 'Tài khoản',
  '/integrations': 'Trung tâm tích hợp',
  '/monitoring': 'Lịch sử đồng bộ',
  '/reports': 'Ánh xạ danh tính',
  '/recruitment': 'Tuyển dụng',
  '/profile': 'Hồ sơ',
}

function AppLayout() {
  const layoutRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { availableRoutes } = useRole()
  const { t } = useLanguage()
  const rawTitle = titles[location.pathname] ?? 'Dashboard'
  const title = t(`titles.${rawTitle}`, rawTitle)
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
    <div ref={layoutRef} className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.13),transparent_32%),radial-gradient(circle_at_12%_24%,rgba(79,70,229,0.08),transparent_28%)] dark:bg-[radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.12),transparent_32%),radial-gradient(circle_at_12%_24%,rgba(79,70,229,0.16),transparent_28%)]" />
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
