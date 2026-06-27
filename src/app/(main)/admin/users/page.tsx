'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Users, Search, ExternalLink, ChevronLeft, ChevronRight,
  Calendar, FileText, UserX, UserCheck,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [confirmBan, setConfirmBan] = useState<{ id: string; name: string; banned: boolean } | null>(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: () => fetch(`/api/admin/users?page=${page}&limit=12${search ? `&search=${encodeURIComponent(search)}` : ''}`).then((res) => res.json()),
  })

  const banMutation = useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) =>
      fetch(`/api/admin/users/${id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned }),
      }).then((res) => res.json()),
    onSuccess: () => {
      toast.success('User updated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setConfirmBan(null)
    },
  })

  const items = (users ?? []).filter((u: { role: string; isBanned: boolean }) => {
    if (roleFilter === 'admin') return u.role === 'admin'
    if (roleFilter === 'banned') return u.isBanned
    if (roleFilter === 'regular') return u.role !== 'admin' && !u.isBanned
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">Manage all platform users</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name, username, or email..."
              className="w-full h-10 rounded-xl border border-border bg-muted/30 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'regular', 'admin', 'banned'].map((f) => (
              <button
                key={f}
                onClick={() => { setRoleFilter(f); setPage(1) }}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                  roleFilter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((user: { id: string; name: string | null; username: string; image: string | null; role: string; isBanned: boolean; postsCount: number; followersCount: number; createdAt: string }) => (
              <div key={user.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 shrink-0">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{user.name || 'Anonymous'}</p>
                      {user.role === 'admin' && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">Admin</Badge>
                      )}
                      {user.isBanned && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Banned</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">@{user.username}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{user.postsCount ?? 0} posts</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{user.followersCount ?? 0} followers</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                  <Link
                    href={`/user/${user.username}`}
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-muted/50 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View
                  </Link>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => setConfirmBan({ id: user.id, name: user.name || user.username, banned: user.isBanned })}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium transition-colors',
                        user.isBanned
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                      )}
                    >
                      {user.isBanned ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                      {user.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {items.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">Page {page}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={items.length < 12}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Ban Modal */}
        {confirmBan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold mb-2">{confirmBan.banned ? 'Unban' : 'Ban'} user?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {confirmBan.banned
                  ? `${confirmBan.name} will regain access to the platform.`
                  : `${confirmBan.name} will lose access to the platform.`}
              </p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setConfirmBan(null)} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                <button
                  onClick={() => banMutation.mutate({ id: confirmBan.id, banned: !confirmBan.banned })}
                  disabled={banMutation.isPending}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                    confirmBan.banned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                  )}
                >
                  {confirmBan.banned ? 'Unban' : 'Ban'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
