import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

function CurtainReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const panels = ref.current?.querySelectorAll('.curtain-panel')
    if (!panels?.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const animation = animate(panels, { translateX: (_, index) => (index === 0 ? '-105%' : '105%'), duration: 1250, delay: 260, ease: 'inOutCubic' })
    return () => animation.pause()
  }, [])

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80]">
      <div className="curtain-panel absolute inset-y-0 left-0 w-1/2 bg-[#020617]" />
      <div className="curtain-panel absolute inset-y-0 right-0 w-1/2 bg-[#020617]" />
    </div>
  )
}

export default CurtainReveal
