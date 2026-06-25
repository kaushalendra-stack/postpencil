'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import {
  Upload, Users, Bookmark, TrendingUp, Search, Shield,
  MessageCircle, Heart, Download, GraduationCap, BookOpen,
  ArrowRight, Check, Sparkles, Zap, FolderOpen, BarChart3,
  Globe, Star,
} from 'lucide-react'

/* ── Animation helpers ── */

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold })
    o.observe(el)
    return () => o.disconnect()
  }, [threshold])
  return { ref, v }
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, v } = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: v ? 1 : 0,
      transform: v ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
      transition: `all 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
    }}>{children}</div>
  )
}

function SlideIn({ children, delay = 0, direction = 'left' as 'left' | 'right', className = '' }: { children: React.ReactNode; delay?: number; direction?: 'left' | 'right'; className?: string }) {
  const { ref, v } = useInView()
  const x = direction === 'left' ? -40 : 40
  return (
    <div ref={ref} className={className} style={{
      opacity: v ? 1 : 0,
      transform: v ? 'translateX(0)' : `translateX(${x}px)`,
      transition: `all 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
    }}>{children}</div>
  )
}

function ScaleIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, v } = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: v ? 1 : 0,
      transform: v ? 'scale(1)' : 'scale(0.92)',
      transition: `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
    }}>{children}</div>
  )
}

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0)
  const { ref, v } = useInView(0.3)
  useEffect(() => {
    if (!v) return
    let c = 0
    const s = to / 120
    const t = setInterval(() => { c += s; if (c >= to) { setN(to); clearInterval(t) } else setN(Math.floor(c)) }, 16)
    return () => clearInterval(t)
  }, [v, to])
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>
}

function TypeWriter({ text, className = '' }: { text: string; className?: string }) {
  const [shown, setShown] = useState(0)
  const { ref, v } = useInView(0.5)
  useEffect(() => {
    if (!v || shown >= text.length) return
    const t = setTimeout(() => setShown((s) => s + 1), 40)
    return () => clearTimeout(t)
  }, [v, shown, text.length])
  return (
    <span ref={ref} className={className}>
      {text.slice(0, shown)}
      {shown < text.length && <span className="inline-block w-[2px] h-[0.9em] bg-foreground/60 ml-0.5 animate-pulse align-middle" />}
    </span>
  )
}

function GlowCard({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, v } = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: v ? 1 : 0,
      transform: v ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
      transition: `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
    }}>
      <div className="h-full rounded-2xl border border-border/30 bg-card p-7 sm:p-8 hover:border-border/60 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-300 h-full">
        {children}
      </div>
    </div>
  )
}

/* ── Page ── */

export default function RootPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  useEffect(() => { if (status === 'authenticated') router.push('/home') }, [status, router])
  if (status === 'loading') return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  if (status === 'authenticated') return null

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes float-y { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
      `}</style>

      {/* ─── Nav ─── */}
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between h-16 border-b border-border/20">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="PostPencil" className="h-10 w-auto dark:brightness-0 dark:invert" />
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/login" className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Log in
              </Link>
              <Link href="/register" className="rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors ml-1">
                Get started
              </Link>
            </div>
          </div>
        </div>
        {/* backdrop fill for scrolling */}
        <div className="absolute inset-0 -z-10 bg-background/80 backdrop-blur-xl -mx-6 sm:mx-0" />
      </header>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 overflow-hidden">
        {/* Animated bg */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '48px 48px', color: 'oklch(0.5 0 0 / 0.025)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          <div className="absolute top-20 left-[15%] h-[500px] w-[500px] rounded-full bg-foreground/[0.02] blur-[100px]" style={{ animation: 'float-y 10s ease-in-out infinite' }} />
          <div className="absolute top-40 right-[10%] h-[400px] w-[400px] rounded-full bg-foreground/[0.02] blur-[100px]" style={{ animation: 'float-y 10s ease-in-out 5s infinite' }} />
        </div>

        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/30 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              The social learning platform for students
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="text-5xl sm:text-7xl lg:text-[6.5rem] font-black tracking-tight leading-[1] max-w-4xl">
              <TypeWriter text="Share notes." className="block" />
              <span className="text-muted-foreground block mt-1"><TypeWriter text="Discover knowledge." /></span>
              <span className="bg-gradient-to-r from-foreground via-foreground/70 to-foreground/40 bg-clip-text text-transparent block mt-1"><TypeWriter text="Learn together." /></span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Upload PDFs, notes, presentations and assignments. Follow creators,
              bookmark resources, and discover trending study materials.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-3">
              <Link href="/register" className="rounded-xl bg-foreground px-7 py-3 text-sm font-semibold text-background hover:bg-foreground/90 transition-all inline-flex items-center gap-2 group">
                Get started free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/explore" className="rounded-xl border border-border/50 px-7 py-3 text-sm font-semibold hover:bg-muted/50 transition-all">
                Browse resources
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> Free forever</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> Instant access</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Marquee ─── */}
      <div className="border-y border-border/30 bg-muted/20 overflow-hidden py-3">
        <div className="flex whitespace-nowrap" style={{ animation: 'marquee 25s linear infinite' }}>
          {Array.from({ length: 2 }).map((_, set) => (
            <div key={set} className="flex items-center gap-8 mr-8">
              {['Upload PDFs', 'Follow Creators', 'Bookmark Resources', 'Trending Feed', 'Discuss & Learn', 'Track Downloads', 'Smart Search', 'Privacy Controls', 'Collections', 'Course Tags'].map((t, i) => (
                <span key={`${set}-${i}`} className="flex items-center gap-2 text-sm font-medium text-muted-foreground/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />{t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Bento Features ─── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <Reveal>
          <div className="mb-14 text-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to<br /><span className="text-muted-foreground">share and discover knowledge.</span></h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          {/* Upload — 4 cols */}
          <Reveal className="sm:col-span-4">
            <div className="rounded-2xl border border-border/30 bg-card p-7 sm:p-8 h-full relative overflow-hidden group hover:border-border/60 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 transition-all">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-foreground/[0.02] group-hover:scale-150 transition-transform duration-700" />
              <Upload className="h-8 w-8 text-foreground mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-2">Effortless Uploads</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">Drag, drop, done. Support for PDFs, Word docs, PowerPoint, images, and archives. Previews and thumbnails generated automatically.</p>
              <div className="mt-5 flex gap-2">
                {[{ l: 'PDF', c: 'text-red-500' }, { l: 'DOCX', c: 'text-blue-500' }, { l: 'PPTX', c: 'text-orange-500' }, { l: 'IMG', c: 'text-violet-500' }, { l: 'ZIP', c: 'text-emerald-500' }].map((f) => (
                  <span key={f.l} className={`text-[11px] font-mono font-medium ${f.c} bg-muted/50 rounded-md px-2 py-1`}>{f.l}</span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Trending — 2 cols */}
          <Reveal delay={0.05} className="sm:col-span-2">
            <div className="rounded-2xl border border-border/30 bg-card p-7 sm:p-8 h-full group hover:border-border/60 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 transition-all">
              <TrendingUp className="h-8 w-8 text-foreground mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-2">Trending</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">See what&apos;s popular right now based on real engagement.</p>
              <div className="mt-5 flex items-end gap-1 h-14">
                {[25, 50, 40, 70, 55, 85, 65, 92, 78, 95].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-foreground/10" style={{ height: `${h}%`, transition: `height 0.6s ease ${i * 60}ms` }} />
                ))}
              </div>
            </div>
          </Reveal>

          {/* Bookmarks — 2 cols */}
          <Reveal className="sm:col-span-2">
            <div className="rounded-2xl border border-border/30 bg-card p-7 sm:p-8 h-full group hover:border-border/60 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 transition-all">
              <FolderOpen className="h-8 w-8 text-foreground mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-2">Collections</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Organize bookmarks into custom collections. Find anything in seconds.</p>
              <div className="mt-5 space-y-2">
                {['Sem 3 Notes', 'DSA Resources', 'Interview Prep'].map((n, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2"><Bookmark className="h-3 w-3 text-muted-foreground/60" /><span className="text-xs text-muted-foreground">{n}</span><span className="ml-auto text-[10px] text-muted-foreground/40">{[12, 8, 15][i]}</span></div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Search — 2 cols */}
          <Reveal delay={0.05} className="sm:col-span-2">
            <div className="rounded-2xl border border-border/30 bg-card p-7 sm:p-8 h-full group hover:border-border/60 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 transition-all">
              <Search className="h-8 w-8 text-foreground mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-2">Smart Search</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Find by subject, course, semester, or keyword.</p>
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2.5"><Search className="h-3.5 w-3.5 text-muted-foreground/40" /><div className="h-2 w-20 rounded bg-foreground/10" /></div>
                <div className="flex gap-1.5">{['DSA', 'OS', 'DBMS', 'CN'].map((t) => <span key={t} className="rounded-full bg-muted/50 px-2.5 py-0.5 text-[10px] text-muted-foreground/60">{t}</span>)}</div>
              </div>
            </div>
          </Reveal>

          {/* Community — 2 cols */}
          <Reveal delay={0.1} className="sm:col-span-2">
            <div className="rounded-2xl border border-border/30 bg-card p-7 sm:p-8 h-full group hover:border-border/60 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 transition-all">
              <Users className="h-8 w-8 text-foreground mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-2">Follow Creators</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Build your learning network with students and educators.</p>
              <div className="mt-5 flex -space-x-2">
                {[{ c: 'bg-pink-500', n: 'P' }, { c: 'bg-blue-500', n: 'R' }, { c: 'bg-emerald-500', n: 'S' }, { c: 'bg-amber-500', n: 'A' }, { c: 'bg-violet-500', n: 'D' }].map((u, i) => (
                  <div key={i} className={`h-8 w-8 rounded-full ${u.c} border-2 border-background flex items-center justify-center text-[9px] font-bold text-white`}>{u.n}</div>
                ))}
                <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground">+42</div>
              </div>
            </div>
          </Reveal>

          {/* Discussion — 4 cols */}
          <Reveal className="sm:col-span-4">
            <div className="rounded-2xl border border-border/30 bg-card p-7 sm:p-8 h-full relative overflow-hidden group hover:border-border/60 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 transition-all">
              <div className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-foreground/[0.02] group-hover:scale-150 transition-transform duration-700" />
              <MessageCircle className="h-8 w-8 text-foreground mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-2">Discuss &amp; Learn</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">Every resource becomes a conversation. Comment, ask questions, and help each other understand the material better.</p>
              <div className="mt-5 space-y-3 max-w-md">
                {[{ n: 'Ankit', t: 'This saved me hours before the exam! 🙏', d: '2h ago' }, { n: 'Sneha', t: 'Could you share the tutorial solutions too?', d: '5h ago' }, { n: 'Deepak', t: 'Perfect notes for the viva. Clear and concise.', d: '1d ago' }].map((c, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0">{c.n[0]}</div>
                    <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-xs font-medium">{c.n}</span><span className="text-[10px] text-muted-foreground/50">{c.d}</span></div><p className="text-xs text-muted-foreground/70 mt-0.5">{c.t}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Privacy — 3 cols */}
          <Reveal delay={0.05} className="sm:col-span-3">
            <div className="rounded-2xl border border-border/30 bg-card p-7 sm:p-8 h-full group hover:border-border/60 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 transition-all">
              <Shield className="h-8 w-8 text-foreground mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-2">Privacy Controls</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">Make your profile private, hide your email, control search visibility. Your space, your rules.</p>
              <div className="space-y-2">
                {[{ l: 'Private profile', on: true }, { l: 'Hide email', on: true }, { l: 'Search visibility', on: false }].map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2"><span className="text-xs text-muted-foreground">{s.l}</span><div className={`h-4 w-7 rounded-full flex items-center px-0.5 transition-colors ${s.on ? 'bg-foreground justify-end' : 'bg-muted justify-start'}`}><div className="h-3 w-3 rounded-full bg-background shadow-sm" /></div></div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Education — 3 cols */}
          <Reveal delay={0.1} className="sm:col-span-3">
            <div className="rounded-2xl border border-border/30 bg-card p-7 sm:p-8 h-full group hover:border-border/60 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 transition-all">
              <GraduationCap className="h-8 w-8 text-foreground mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-bold mb-2">Built for Education</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">Every resource tagged by subject, course, and semester. Built for how students actually study.</p>
              <div className="rounded-xl bg-muted/40 p-4">
                <div className="flex items-center gap-2 mb-2"><BookOpen className="h-3.5 w-3.5 text-muted-foreground/60" /><span className="text-xs font-medium">Data Structures &amp; Algorithms</span></div>
                <div className="flex flex-wrap gap-1.5">{['B.Tech CSE', 'Sem 3', 'PDF', 'Notes'].map((t) => <span key={t} className="rounded-md bg-background px-2 py-0.5 text-[10px] text-muted-foreground border border-border/40">{t}</span>)}</div>
              </div>
            </div>
          </Reveal>

          {/* Engagement — 6 cols */}
          <Reveal className="sm:col-span-6">
            <div className="rounded-2xl border border-border/30 bg-card p-7 sm:p-8 group hover:border-border/60 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <BarChart3 className="h-8 w-8 text-foreground mb-4" strokeWidth={1.5} />
                  <h3 className="text-lg font-bold mb-2">Track Engagement</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">See how your resources perform. Likes, comments, downloads, and views — all at a glance.</p>
                </div>
                <div className="grid grid-cols-4 gap-3 sm:w-80">
                  {[{ i: Heart, l: 'Likes', v: '2.4K' }, { i: MessageCircle, l: 'Comments', v: '890' }, { i: Download, l: 'Downloads', v: '5.1K' }, { i: Globe, l: 'Views', v: '12K' }].map((m) => (
                    <div key={m.l} className="rounded-xl bg-muted/40 p-3 text-center"><m.i className="h-4 w-4 text-muted-foreground/60 mx-auto mb-1.5" /><p className="text-sm font-semibold">{m.v}</p><p className="text-[10px] text-muted-foreground/60 mt-0.5">{m.l}</p></div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="border-y border-border/30 bg-muted/20">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <Reveal><div className="text-center mb-12"><h2 className="text-2xl font-bold tracking-tight">Trusted by students nationwide</h2></div></Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
            {[{ v: 10000, s: '+', l: 'Resources shared' }, { v: 2500, s: '+', l: 'Active students' }, { v: 500, s: '+', l: 'Educators' }, { v: 50000, s: '+', l: 'Total downloads' }].map((s) => (
              <Reveal key={s.l}>
                <p className="text-3xl sm:text-4xl font-black tracking-tight"><CountUp to={s.v} suffix={s.s} /></p>
                <p className="mt-2 text-sm text-muted-foreground">{s.l}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <Reveal><div className="text-center mb-12"><h2 className="text-2xl font-bold tracking-tight">What students say</h2></div></Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[{ n: 'Priya Sharma', r: 'B.Tech CSE, Sem 5', t: 'PostPencil changed how I study. Notes, previous year papers, and presentations — all in one place.' }, { n: 'Rahul Verma', r: 'B.Tech ECE, Sem 7', t: 'I share my notes here and the feedback helps me improve. Bookmark collections are a lifesaver.' }, { n: 'Sneha Patel', r: 'MCA, Sem 2', t: 'Clean interface, great search, and trending content. Way better than random WhatsApp groups.' }].map((t, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="rounded-2xl border border-border/30 bg-card p-6 h-full hover:border-border/60 transition-colors">
                <div className="flex items-center gap-1 mb-3">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-foreground text-foreground" />)}</div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{t.t}&rdquo;</p>
                <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{t.n[0]}</div><div><p className="text-xs font-medium">{t.n}</p><p className="text-[10px] text-muted-foreground">{t.r}</p></div></div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <Reveal>
          <div className="rounded-3xl border border-border/30 bg-card p-12 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px', color: 'oklch(0.5 0 0 / 0.02)' }} />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Start sharing knowledge today</h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">Join thousands of students already using PostPencil to learn and teach.</p>
              <div className="mt-8">
                <Link href="/register" className="rounded-full bg-foreground px-8 py-3.5 text-sm font-semibold text-background hover:bg-foreground/90 transition-all inline-flex items-center justify-center gap-2 group">
                  Create your account <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/30">
        <div className="max-w-6xl mx-auto px-6">
          {/* Top section — brand + newsletter */}
          <div className="py-14 border-b border-border/30">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
              <div className="max-w-sm">
                <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
                  <img src="/logo.svg" alt="PostPencil" className="h-8 w-auto dark:brightness-0 dark:invert" />
                </Link>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The social learning platform where students share educational resources, discover study materials, and connect with creators.
                </p>
                <div className="flex items-center gap-2.5 mt-5">
                  {[
                    { label: 'Twitter', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                    { label: 'GitHub', path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' },
                    { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                  ].map((s) => (
                    <a key={s.label} href="#" target="_blank" rel="noopener" aria-label={s.label}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200 hover:scale-105">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.path} /></svg>
                    </a>
                  ))}
                </div>
              </div>

              <div className="max-w-sm w-full">
                <h4 className="text-sm font-semibold mb-1">Stay in the loop</h4>
                <p className="text-xs text-muted-foreground mb-3">Get notified when we launch new features.</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="you@example.com" className="flex-1 h-10 rounded-xl border border-border/50 bg-muted/20 px-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all" />
                  <button className="h-10 px-5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors shrink-0">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Link columns */}
          <div className="py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Product</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Explore', href: '/explore' },
                  { label: 'Trending', href: '/home' },
                  { label: 'Upload', href: '/upload' },
                  { label: 'Bookmarks', href: '/bookmarks' },
                ].map((l) => (
                  <li key={l.href}><a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Company</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'About', href: '/' },
                  { label: 'Blog', href: '/' },
                  { label: 'Careers', href: '/' },
                  { label: 'Contact', href: 'mailto:support@postpencil.com' },
                ].map((l) => (
                  <li key={l.label}><a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Resources</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Help Center', href: '/help' },
                  { label: 'Community', href: '/guidelines' },
                  { label: 'Settings', href: '/settings' },
                  { label: 'Status', href: '/' },
                ].map((l) => (
                  <li key={l.label}><a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Cookie Policy', href: '/cookies' },
                  { label: 'Guidelines', href: '/guidelines' },
                ].map((l) => (
                  <li key={l.href}><a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="py-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>&copy; {new Date().getFullYear()} PostPencil</span>
              <span className="hidden sm:inline">&middot;</span>
              <span className="hidden sm:inline">All rights reserved</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
