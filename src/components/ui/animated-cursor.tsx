'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

type CursorState = 'default' | 'hover' | 'text' | 'click' | 'grab'

export function AnimatedCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [outerPos, setOuterPos] = useState({ x: -100, y: -100 })
  const [state, setState] = useState<CursorState>('default')
  const [isVisible, setIsVisible] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const rafRef = useRef<number>(0)
  const posRef = useRef({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: MouseEvent) => {
    posRef.current = { x: e.clientX, y: e.clientY }
    setPosition({ x: e.clientX, y: e.clientY })
    setIsVisible(true)

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      setOuterPos({ x: e.clientX, y: e.clientY })
    })
  }, [])

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    const isInteractive =
      target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') ||
      target.closest('button') || target.closest('[role="button"]') ||
      target.closest('input[type="submit"]') || target.closest('input[type="text"]') ||
      target.closest('input[type="password"]') || target.closest('textarea') ||
      target.closest('[contenteditable]')

    if (isInteractive) {
      const isInput = target.closest('input') || target.closest('textarea') || target.closest('[contenteditable]')
      setState(isInput ? 'text' : 'hover')
    } else {
      setState('default')
    }
  }, [])

  const handleMouseDown = useCallback(() => setIsPressed(true), [])
  const handleMouseUp = useCallback(() => setIsPressed(false), [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', () => setIsVisible(false))
    document.addEventListener('mouseenter', () => setIsVisible(true))

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseOver, handleMouseDown, handleMouseUp])

  if (!isVisible) return null

  return (
    <>
      {/* Outer ring — follows with delay */}
      <div
        className="pointer-events-none fixed z-[9998]"
        style={{
          left: outerPos.x,
          zIndex: 9999,
          top: outerPos.y,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.3s ease, height 0.3s ease, border-color 0.3s ease, background-color 0.3s ease, opacity 0.2s ease',
        }}
      >
        <div
          className={cn(
            'rounded-full border transition-all duration-300',
            state === 'hover' && 'h-12 w-12 border-foreground/20 bg-foreground/[0.03]',
            state === 'text' && 'h-8 w-1 border-foreground/40 bg-foreground/10 rounded-none',
            state === 'click' && 'h-6 w-6 border-foreground/30 bg-foreground/10',
            state === 'default' && 'h-8 w-8 border-foreground/10 bg-foreground/[0.02]',
          )}
        />
      </div>

      {/* Inner dot — follows exactly */}
      <div
        className="pointer-events-none fixed z-[9999]"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          transition: 'transform 0.08s ease-out',
        }}
      >
        <div
          className={cn(
            'rounded-full transition-all duration-150 ease-out',
            state === 'default' && !isPressed && 'h-2 w-2 bg-foreground/80',
            state === 'hover' && !isPressed && 'h-3 w-3 bg-foreground',
            state === 'text' && 'h-[3px] w-5 bg-foreground rounded-sm',
            state === 'click' && 'h-1.5 w-1.5 bg-foreground scale-150',
            isPressed && 'h-1.5 w-1.5 bg-foreground scale-75',
          )}
        />
      </div>
    </>
  )
}
