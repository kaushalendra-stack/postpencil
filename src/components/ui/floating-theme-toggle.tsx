'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'pp-theme-corner'
type Corner = 'tl' | 'tr' | 'bl' | 'br'

function getCornerPos(c: Corner, w: number, h: number) {
  switch (c) {
    case 'tl': return { x: 16, y: 16 }
    case 'tr': return { x: w - 56, y: 16 }
    case 'bl': return { x: 16, y: h - 56 }
    case 'br': return { x: w - 56, y: h - 56 }
  }
}

function nearestCorner(cx: number, cy: number, w: number, h: number): Corner {
  const corners: [Corner, number][] = [
    ['tl', cx * cx + cy * cy],
    ['tr', (w - cx) * (w - cx) + cy * cy],
    ['bl', cx * cx + (h - cy) * (h - cy)],
    ['br', (w - cx) * (w - cx) + (h - cy) * (h - cy)],
  ]
  return corners.reduce((a, b) => (b[1] < a[1] ? b : a))[0]
}

export function FloatingThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [corner, setCorner] = useState<Corner>('br')
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const didMove = useRef(false)
  const posRef = useRef({ x: 0, y: 0 })
  const initDone = useRef(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const winRef = useRef({ w: 0, h: 0 })

  useEffect(() => {
    if (initDone.current) return
    initDone.current = true
    const w = window.innerWidth
    const h = window.innerHeight
    winRef.current = { w, h }
    let c: Corner = 'br'
    try { c = (localStorage.getItem(STORAGE_KEY) as Corner) || 'br' } catch {}
    setCorner(c)
    const p = getCornerPos(c, w, h)
    setPos(p)
    posRef.current = p
    requestAnimationFrame(() => setReady(true))

    const onResize = () => {
      const nw = window.innerWidth
      const nh = window.innerHeight
      winRef.current = { w: nw, h: nh }
      const newP = getCornerPos(c, nw, nh)
      setPos(newP)
      posRef.current = newP
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (ready) try { localStorage.setItem(STORAGE_KEY, corner) } catch {}
  }, [corner, ready])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const snapTo = useCallback((c: Corner) => {
    const { w, h } = winRef.current
    setCorner(c)
    setPos(getCornerPos(c, w, h))
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    didMove.current = false
    const startPos = posRef.current
    const startClient = { mx: e.clientX, my: e.clientY }
    dragging.current = true

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startClient.mx
      const dy = ev.clientY - startClient.my
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didMove.current = true
      if (!didMove.current) return
      setOpen(false)
      const newX = Math.max(8, Math.min(winRef.current.w - 48, startPos.x + dx))
      const newY = Math.max(8, Math.min(winRef.current.h - 48, startPos.y + dy))
      posRef.current = { x: newX, y: newY }
      setPos({ x: newX, y: newY })
    }

    const onUp = () => {
      dragging.current = false
      if (didMove.current) {
        const finalPos = posRef.current
        snapTo(nearestCorner(finalPos.x, finalPos.y, winRef.current.w, winRef.current.h))
      }
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const handleClick = () => {
    if (didMove.current) return
    setOpen((v) => !v)
  }

  if (!ready) return null
  const isDark = theme === 'dark'
  const isSystem = theme === 'system'

  return (
    <div
      ref={panelRef}
      className="fixed z-[9999] select-none touch-none"
      style={{
        left: pos.x,
        top: pos.y,
        transition: dragging.current
          ? undefined
          : 'left 0.3s cubic-bezier(0.22,1,0.36,1), top 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {open && (
        <div
          className={`absolute flex flex-col rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl shadow-black/5 overflow-hidden min-w-[120px] ${
            corner.includes('t')
              ? `top-full mt-2 ${corner.includes('r') ? 'right-0' : 'left-0'}`
              : `bottom-full mb-2 ${corner.includes('r') ? 'right-0' : 'left-0'}`
          }`}
          style={{ animation: 'nextdev-in 0.15s cubic-bezier(0.22,1,0.36,1)' }}
        >
          {([
            { value: 'light' as const, icon: Sun, label: 'Light', active: !isDark && !isSystem },
            { value: 'dark' as const, icon: Moon, label: 'Dark', active: isDark && !isSystem },
            { value: 'system' as const, icon: Monitor, label: 'System', active: isSystem },
          ]).map(({ value, icon: Icon, label, active }) => (
            <button
              key={value}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setTheme(value); setOpen(false) }}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors duration-100 ${active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}

      <button
        onPointerDown={onPointerDown}
        onClick={handleClick}
        className="flex items-center justify-center h-10 w-10 rounded-full border border-border/60 bg-background/95 backdrop-blur-xl shadow-md shadow-black/5 hover:shadow-lg hover:border-border/80 active:scale-90 transition-all duration-200 cursor-grab active:cursor-grabbing"
        aria-label="Toggle theme"
      >
        <Sun className={`h-4 w-4 text-amber-500 transition-all duration-300 ${isDark ? 'rotate-90 scale-0 absolute' : 'rotate-0 scale-100'}`} />
        <Moon className={`h-4 w-4 text-blue-400 transition-all duration-300 ${isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0 absolute'}`} />
      </button>

      <style>{`
        @keyframes nextdev-in {
          from { opacity: 0; transform: translateY(6px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
