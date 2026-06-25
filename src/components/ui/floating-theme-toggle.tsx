'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const STORAGE_KEY = 'pp-theme-side'
const SIZE = 36
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

function getStoredSide(): 'left' | 'right' {
  try { return (localStorage.getItem(STORAGE_KEY) as 'left' | 'right') || 'right' } catch { return 'right' }
}

export function FloatingThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [side, setSide] = useState<'left' | 'right'>('right')
  const [y, setY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [ready, setReady] = useState(false)
  const startRef = useRef({ my: 0, sy: 0 })
  const didMove = useRef(false)
  const initDone = useRef(false)

  useEffect(() => {
    if (initDone.current) return
    initDone.current = true
    const s = getStoredSide()
    setSide(s)
    setY(Math.max(16, Math.min(window.innerHeight - SIZE - 16, window.innerHeight / 2 - SIZE / 2)))
    requestAnimationFrame(() => setReady(true))
  }, [])

  // Snap X based on side
  const snapX = side === 'left' ? 12 : (typeof window !== 'undefined' ? window.innerWidth - SIZE - 12 : 9999)

  // Save side preference
  useEffect(() => {
    if (ready) try { localStorage.setItem(STORAGE_KEY, side) } catch {}
  }, [side, ready])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    didMove.current = false
    startRef.current = { my: e.clientY, sy: y }
    setDragging(true)

    const onMove = (ev: PointerEvent) => {
      const dy = ev.clientY - startRef.current.my
      if (Math.abs(dy) > 2) didMove.current = true
      const ny = Math.max(12, Math.min(window.innerHeight - SIZE - 12, startRef.current.sy + dy))
      setY(ny)
    }

    const onUp = () => {
      setDragging(false)
      // Only snap to opposite edge if user actually dragged
      if (didMove.current) {
        setSide(side === 'left' ? 'right' : 'left')
      }
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const toggle = () => {
    if (didMove.current) return
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  if (!ready) return null

  const isDark = theme === 'dark'

  return (
    <div
      onPointerDown={onPointerDown}
      onClick={toggle}
      className={cn(
        "fixed z-[9999] flex items-center justify-center rounded-full",
        "border border-black/10 dark:border-white/10",
        "backdrop-blur-xl cursor-grab select-none touch-none",
        "active:cursor-grabbing",
        dragging
          ? "bg-white dark:bg-zinc-800 shadow-xl scale-110"
          : "bg-white/90 dark:bg-zinc-800/90 shadow-md hover:shadow-lg hover:scale-105",
        "transition-transform transition-shadow duration-200",
      )}
      style={{
        width: SIZE,
        height: SIZE,
        left: snapX,
        top: y,
        transition: dragging
          ? 'transform 0.15s, box-shadow 0.15s'
          : `left 0.3s ${EASE}, top 0.3s ${EASE}, transform 0.2s, box-shadow 0.2s`,
      }}
    >
      <Sun className={cn(
        "h-4 w-4 text-amber-500 transition-all duration-200",
        isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
      )} />
      <Moon className={cn(
        "absolute h-4 w-4 text-blue-400 transition-all duration-200",
        isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
      )} />
    </div>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
