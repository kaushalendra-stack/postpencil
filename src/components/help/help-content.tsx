'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Search,
  ChevronRight,
  Plus,
  Mail,
  Clock,
  FileText,
  Upload,
  Users,
  Settings,
  Shield,
  Lightbulb,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Send,
  Tag,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

const CATEGORIES = [
  { id: 'getting-started', label: 'Getting Started', icon: Lightbulb },
  { id: 'content', label: 'Uploading Content', icon: Upload },
  { id: 'account', label: 'Account & Settings', icon: Settings },
  { id: 'community', label: 'Community & Social', icon: Users },
  { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
  { id: 'billing', label: 'Policies & Legal', icon: FileText },
]

const TICKET_CATEGORIES = [
  { value: 'bug', label: 'Bug Report', description: 'Something isn\'t working correctly' },
  { value: 'feature', label: 'Feature Request', description: 'Suggest a new feature or improvement' },
  { value: 'account', label: 'Account Issue', description: 'Login, password, or profile problems' },
  { value: 'content', label: 'Content Report', description: 'Report inappropriate or infringing content' },
  { value: 'general', label: 'General Inquiry', description: 'Anything else we can help with' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-emerald-500' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
]

const FAQ_ITEMS = [
  { category: 'getting-started', question: 'What is PostPencil?', answer: 'PostPencil is a social learning platform where students and educators share educational resources like PDFs, notes, presentations, assignments, and question papers.' },
  { category: 'getting-started', question: 'How do I create an account?', answer: 'Click "Sign Up" on the login page. You can register with your email or sign in using Google or GitHub. Verify your email to unlock all features.' },
  { category: 'getting-started', question: 'How do I set up my profile?', answer: 'Go to Settings > Your Account to update your name, bio, college, course, and semester. Add social links in Settings > Social Links.' },
  { category: 'content', question: 'How do I upload a resource?', answer: 'Click the "Upload" button in the sidebar or bottom nav. Drag and drop files or click to browse. Fill in details and click "Publish".' },
  { category: 'content', question: 'What file types are supported?', answer: 'PDF, DOC, DOCX, PPT, PPTX, images (.jpg, .png, .webp), and ZIP files. Maximum size is 50MB per file.' },
  { category: 'content', question: 'How do I edit or delete my post?', answer: 'Open your post and click the three-dot menu. Select "Edit" or "Delete" as needed.' },
  { category: 'content', question: 'How does trending work?', answer: 'Posts are ranked by engagement — likes, comments, downloads, and views. More recent engagement means higher trending position.' },
  { category: 'account', question: 'How do I change my password?', answer: 'Go to Settings > Your Account > Change Password. Enter current and new password, then click "Update Password".' },
  { category: 'account', question: 'How do I change my theme?', answer: 'Go to Settings > Appearance. Choose Light, Dark, or System theme.' },
  { category: 'account', question: 'How do I manage notifications?', answer: 'Go to Settings > Notifications to control push and email notification preferences.' },
  { category: 'account', question: 'Can I delete my account?', answer: 'Yes. Go to Settings > Your Account > Danger Zone > Delete Account. This is permanent.' },
  { category: 'community', question: 'How do I follow other users?', answer: 'Visit a profile and click "Follow". Their posts appear in your Following feed.' },
  { category: 'community', question: 'How do bookmarks work?', answer: 'Click the bookmark icon on any post. Organize bookmarks into collections from the Bookmarks page.' },
  { category: 'community', question: 'How do I comment on a post?', answer: 'Open a post and scroll to comments. Type your comment and click send. Reply to start a thread.' },
  { category: 'privacy', question: 'How do I make my account private?', answer: 'Go to Settings > Privacy > Protect your posts. Only approved followers will see your content.' },
  { category: 'privacy', question: 'How do I report content?', answer: 'Click the three-dot menu on any post and select "Report". Choose a reason and submit.' },
  { category: 'privacy', question: 'How do I control profile visibility?', answer: 'Go to Settings > Privacy to toggle email, followers list, and search visibility.' },
  { category: 'billing', question: 'Is PostPencil free?', answer: 'Yes. PostPencil is completely free with no premium tiers or hidden fees.' },
  { category: 'billing', question: 'Where can I find legal documents?', answer: 'Settings > Legal, or visit Privacy Policy, Terms, Guidelines, and Cookie Policy links.' },
]

function TicketModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('medium')
  const [message, setMessage] = useState('')

  const mutation = useMutation({
    mutationFn: (data: { subject: string; category: string; priority: string; message: string }) =>
      fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      toast.success('Request submitted')
      setStep(3)
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
    onError: () => toast.error('Failed to submit'),
  })

  const handleSubmit = () => {
    if (subject.trim() && message.trim() && category) {
      mutation.mutate({ subject, category, priority, message })
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep(1)
      setSubject('')
      setCategory('')
      setPriority('medium')
      setMessage('')
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        {step === 1 && (
          <>
            <div className="px-6 pt-6 pb-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-base">What can we help with?</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Choose a category that best describes your issue.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="px-6 pb-6 space-y-2">
              {TICKET_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => { setCategory(cat.value); setStep(2); }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border transition-all hover:border-foreground/20",
                    category === cat.value ? "border-foreground bg-muted/30" : "border-border/40"
                  )}
                >
                  <p className="text-sm font-medium">{cat.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="px-6 pt-6 pb-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-base">Describe your issue</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  <button onClick={() => setStep(1)} className="hover:underline inline-flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 rotate-180" />
                    {TICKET_CATEGORIES.find(c => c.value === category)?.label}
                  </button>
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPriority(p.value)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                        priority === p.value
                          ? "border-foreground bg-muted/30"
                          : "border-border/40 hover:border-border"
                      )}
                    >
                      <div className={cn("h-2 w-2 rounded-full", p.color)} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  className="h-10 rounded-xl bg-muted/20 border-border/40 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">Description</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide as much detail as possible..."
                  rows={4}
                  className="rounded-xl bg-muted/20 border-border/40 resize-none text-sm"
                />
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/30">
                <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Include steps to reproduce, expected vs actual behavior, and your device/browser info for faster resolution.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="rounded-xl h-10 flex-1"
                  size="sm"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!subject.trim() || !message.trim() || !category || mutation.isPending}
                  className="rounded-xl h-10 flex-1"
                  size="sm"
                >
                  {mutation.isPending ? 'Sending...' : (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-base font-semibold mb-1">Request submitted</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              We&apos;ll review your request and get back to you within 24 hours.
            </p>
            <Button onClick={handleClose} className="rounded-xl h-10" size="sm">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface Ticket {
  id: string
  subject: string
  category: string
  message: string
  status: string
  priority: string
  adminReply: string | null
  createdAt: string
}

function MyTickets() {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const res = await fetch('/api/tickets')
      const json = await res.json()
      return json
    },
  })


  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const items: Ticket[] = (() => {
    if (Array.isArray(tickets)) return tickets
    if (tickets?.data && Array.isArray(tickets.data)) return tickets.data
    return []
  })()

  if (items.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 mx-auto mb-3">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-foreground">No requests yet</p>
        <p className="text-xs text-muted-foreground mt-1">Your support requests will appear here</p>
      </div>
    )
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    open: { label: 'Open', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    in_progress: { label: 'In Progress', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    resolved: { label: 'Resolved', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    closed: { label: 'Closed', className: 'bg-muted text-muted-foreground' },
  }

  return (
    <div className="space-y-3">
      {items.map((ticket) => {
        const status = statusConfig[ticket.status] || statusConfig.open
        const createdAt = ticket.createdAt
          ? formatDate(String(ticket.createdAt))
          : ''
        return (
          <div key={ticket.id} className="rounded-xl border border-border/40 p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-2">{ticket.message}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {ticket.category && (
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {ticket.category}
                    </span>
                  )}
                  {createdAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {createdAt}
                    </span>
                  )}
                </div>
              </div>
              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0", status.className)}>
                {status.label}
              </span>
            </div>
            {ticket.adminReply && (
              <div className="mt-3 rounded-lg bg-muted/40 p-3">
                <p className="text-[11px] font-medium text-muted-foreground mb-1">Reply</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{ticket.adminReply}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function FAQItem({ item, isOpen, onToggle }: { item: typeof FAQ_ITEMS[number]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        className="w-full text-left py-4 flex items-center gap-3 group"
        onClick={onToggle}
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
        <span className="text-sm text-foreground group-hover:opacity-80 transition-opacity">{item.question}</span>
      </button>
      {isOpen && (
        <div className="pb-4 pl-6.5">
          <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  )
}

export function HelpContent() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [ticketModalOpen, setTicketModalOpen] = useState(false)

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory = !activeCategory || item.category === activeCategory
    const matchesSearch =
      !search ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Help</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Find answers or contact support.
            </p>
          </div>
          <Button
            onClick={() => setTicketModalOpen(true)}
            className="rounded-xl h-10 shrink-0"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Raise Ticket
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="pl-10 h-11 rounded-xl bg-muted/20 border-border/40 text-sm"
          />
        </div>

        {/* Categories */}
        {!search && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors",
                    activeCategory === cat.id
                      ? "bg-foreground text-background"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {cat.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Active filter */}
        {activeCategory && !search && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">
              {CATEGORIES.find(c => c.id === activeCategory)?.label}
            </span>
            <button
              onClick={() => setActiveCategory(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        )}

        {/* FAQ */}
        <div className="mb-10">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No results found.</p>
          ) : (
            <div>
              {filteredItems.map((item, i) => (
                <FAQItem
                  key={i}
                  item={item}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-border/40" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Your Requests</span>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        {/* Tickets */}
        <MyTickets />

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <a href="mailto:support@postpencil.com" className="hover:text-foreground transition-colors">
                support@postpencil.com
              </a>
              <span className="mx-1">·</span>
              <Clock className="h-3 w-3" />
              <span>Replies within 24h</span>
            </div>
            <div className="flex items-center gap-3">
              {[
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
                { label: 'Guidelines', href: '/guidelines' },
                { label: 'Cookies', href: '/cookies' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      <TicketModal open={ticketModalOpen} onOpenChange={setTicketModalOpen} />
    </div>
  )
}
