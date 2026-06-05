import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { animate } from 'animejs'

function PageTransition({ children }) {
  const location = useLocation()
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const animation = animate(node, {
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 220,
      ease: 'outCubic',
    })
    return () => animation.pause()
  }, [location.pathname])

  return (
    <div ref={ref} key={location.pathname} className="min-h-[calc(100vh-73px)] px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </div>
  )
}

export default PageTransition
