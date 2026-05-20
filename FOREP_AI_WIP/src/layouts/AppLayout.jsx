import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import Sidebar from '../components/app/Sidebar.jsx'
import TopHeader from '../components/app/TopHeader.jsx'

function AppLayout({ title = 'Dashboard', children }) {
  const layoutRef = useRef(null)

  useEffect(() => {
    const root = layoutRef.current
    if (!root) return undefined
    const sidebar = root.querySelector('.sidebar-panel')
    const cards = root.querySelectorAll('.page-animate')
    const animations = [
      sidebar
        ? animate(sidebar, { opacity: [0, 1], translateX: [-28, 0], duration: 600, ease: 'outCubic' })
        : null,
      animate(cards, { opacity: [0, 1], translateY: [22, 0], delay: stagger(70), duration: 560, ease: 'outCubic' }),
    ].filter(Boolean)

    return () => animations.forEach((animation) => animation.pause())
  }, [title])

  return (
    <div ref={layoutRef} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Sidebar />
      <main className="min-h-screen lg:pl-[260px]">
        <TopHeader title={title} />
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}

export default AppLayout
