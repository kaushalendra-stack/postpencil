'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Mail, Clock, Tag, MessageSquare, Send, CheckCircle2,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Ticket {
  id: string
  subject: string
  category: string
  message: string
  status: string
  priority: string
  adminReply: string | null
  createdAt: string
  user?: { name: string; username: string; email: string }
}

export default function AdminMessagesPage() {
  const queryClient = useQueryClient()
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [reply, setReply] = useState('')
  const [statusFilter, setStatusFilter] = useState('open')

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: () => fetch('/api/tickets').then((res) => res.json()),
  })

  const replyMutation = useMutation({
    mutationFn: ({ id, adminReply }: { id: string; adminReply: string }) =>
      fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, adminReply, status: 'in_progress' }),
      }).then((r) => r.json()),
    onSuccess: () => {
      toast.success('Reply sent')
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] })
      setSelectedTicket(null)
      setReply('')
    },
  })

  const items: Ticket[] = (() => {
    const data = tickets?.data ?? (Array.isArray(tickets) ? tickets : [])
    return data.filter((t: Ticket) => statusFilter === 'all' || t.status === statusFilter)
  })()

  const statusConfig: Record<string, { label: string; className: string }> = {
    open: { label: 'Open', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    in_progress: { label: 'In Progress', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    resolved: { label: 'Resolved', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
    closed: { label: 'Closed', className: 'bg-muted text-muted-foreground' },
  }

  const priorityConfig: Record<string, { color: string }> = {
    low: { color: 'bg-emerald-500' },
    medium: { color: 'bg-amber-500' },
    high: { color: 'bg-red-500' },
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground">Support tickets from users</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['open', 'in_progress', 'resolved', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                statusFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No {statusFilter} tickets</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Ticket List */}
            <div className="lg:col-span-2 space-y-2">
              {items.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => { setSelectedTicket(ticket); setReply('') }}
                  className={cn(
                    'w-full text-left rounded-xl border p-4 transition-all',
                    selectedTicket?.id === ticket.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-border/80'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn('h-2 w-2 rounded-full', priorityConfig[ticket.priority]?.color ?? 'bg-muted')} />
                    <p className="text-sm font-medium truncate flex-1">{ticket.subject}</p>
                    <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', statusConfig[ticket.status]?.className)}>
                      {statusConfig[ticket.status]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{ticket.message}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Tag className="h-3 w-3" />{ticket.category}
                    <Clock className="h-3 w-3" />{formatDate(ticket.createdAt)}
                  </div>
                </button>
              ))}
            </div>

            {/* Ticket Detail */}
            <div className="lg:col-span-3">
              {selectedTicket ? (
                <div className="rounded-xl border border-border bg-card p-5 sticky top-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold">{selectedTicket.subject}</h3>
                    <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', statusConfig[selectedTicket.status]?.className)}>
                      {statusConfig[selectedTicket.status]?.label}
                    </span>
                  </div>

                  {selectedTicket.user && (
                    <p className="text-xs text-muted-foreground mb-3">From: {selectedTicket.user.name} (@{selectedTicket.user.username})</p>
                  )}

                  <div className="rounded-lg bg-muted/30 p-4 mb-4">
                    <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>

                  {selectedTicket.adminReply && (
                    <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 mb-4">
                      <p className="text-[10px] font-medium text-primary mb-1">Admin Reply</p>
                      <p className="text-sm">{selectedTicket.adminReply}</p>
                    </div>
                  )}

                  {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                    <div className="pt-4 border-t border-border/50">
                      <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Write a reply..."
                        rows={3}
                        className="w-full rounded-xl border border-border bg-muted/30 p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => replyMutation.mutate({ id: selectedTicket.id, adminReply: reply })}
                          disabled={!reply.trim() || replyMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" />
                          {replyMutation.isPending ? 'Sending...' : 'Reply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card p-16 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select a ticket to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
