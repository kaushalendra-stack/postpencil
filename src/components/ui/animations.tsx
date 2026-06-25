'use client'

import { useRef, useState, useEffect } from 'react'

export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const observed = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || observed.current) return
    observed.current = true

    // Wait one frame for layout to settle
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setVisible(true)
        return
      }

      const o = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          o.disconnect()
        }
      }, { threshold, rootMargin: '100px' })
      o.observe(el)
    })
  }, [threshold])

  return { ref, visible }
}

export function FadeIn({ children, delay = 0, className = '', y = 24 }: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  const { ref, visible } = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
    }}>{children}</div>
  )
}

export function ScaleIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1)' : 'scale(0.95)',
      transition: `all 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
    }}>{children}</div>
  )
}
