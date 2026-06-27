'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  AlertTriangle, CheckCircle, XCircle, Clock, Users, Filter,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function AdminReportsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'resolve' | 'dismiss'; reason: string } | null>(null)

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => fetch('/api/admin/reports').then((res) => res.json()),
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/reports/${id}/resolve`, { method: 'POST' }).then((r) => r.json()),
    onSuccess: () => { toast.success('Report resolved'); queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] }); setConfirmAction(null) },
  })

  const dismissMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/reports/${id}/dismiss`, { method: 'POST' }).then((r) => r.json()),
    onSuccess: () => { toast.success('Report dismissed'); queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] }); setConfirmAction(null) },
  })

  const items = (reports ?? []).filter((r: any) => statusFilter === 'all' || r.status === statusFilter)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Review and manage user reports</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['pending', 'resolved', 'dismissed', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                statusFilter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="h-12 w-12 text-green-500/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No {statusFilter} reports</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((report: any) => (
              <div key={report.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
                    report.status === 'pending' ? 'bg-orange-500/10' : report.status === 'resolved' ? 'bg-green-500/10' : 'bg-muted/50'
                  )}>
                    <AlertTriangle className={cn(
                      'h-5 w-5',
                      report.status === 'pending' ? 'text-orange-500' : report.status === 'resolved' ? 'text-green-500' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{report.reason}</p>
                      <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'} className="text-[10px]">
                        {report.status}
                      </Badge>
                    </div>
                    {report.description && (
                      <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{report.reporter?.username}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                  {report.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setConfirmAction({ id: report.id, action: 'resolve', reason: report.reason })}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Resolve
                      </button>
                      <button
                        onClick={() => setConfirmAction({ id: report.id, action: 'dismiss', reason: report.reason })}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold mb-2">{confirmAction.action === 'resolve' ? 'Resolve' : 'Dismiss'} report?</h3>
              <p className="text-sm text-muted-foreground mb-6">"{confirmAction.reason}"</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setConfirmAction(null)} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                <button
                  onClick={() => confirmAction.action === 'resolve' ? resolveMutation.mutate(confirmAction.id) : dismissMutation.mutate(confirmAction.id)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    confirmAction.action === 'resolve' ? 'bg-green-500 hover:bg-green-600' : 'bg-muted hover:bg-muted/80 text-foreground'
                  )}
                >
                  {confirmAction.action === 'resolve' ? 'Resolve' : 'Dismiss'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
