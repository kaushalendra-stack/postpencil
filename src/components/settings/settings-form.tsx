'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import toast from 'react-hot-toast'
import {
  User, Shield, Bell, Palette, Link2, FileText, Camera,
  Sun, Moon, ChevronRight, Eye, EyeOff, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const CATEGORIES = [
  { id: 'account', label: 'Your account', description: 'Account information, password, and deactivation', icon: User },
  { id: 'privacy', label: 'Privacy and safety', description: 'Manage what you share and who can see it', icon: Shield },
  { id: 'notifications', label: 'Notifications', description: 'Manage your notification preferences', icon: Bell },
  { id: 'appearance', label: 'Accessibility, display, and languages', description: 'Font size, color, and language settings', icon: Palette },
  { id: 'social', label: 'Social links', description: 'Manage your connected social accounts', icon: Link2 },
  { id: 'legal', label: 'Legal', description: 'Terms, privacy policy, and community guidelines', icon: FileText },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="border-b border-border/50 px-4 py-5"><h2 className="text-base font-bold mb-4">{title}</h2>{children}</div>
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between py-3"><div className="pr-4"><p className="text-sm font-medium">{label}</p>{description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}</div>{children}</div>
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={cn("relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full transition-colors duration-200", checked ? "bg-primary" : "bg-input")}>
      <span className={cn("pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-background shadow-sm transition-transform duration-200 mt-[1px] ml-[1px]", checked ? "translate-x-[18px]" : "translate-x-0")} />
    </button>
  )
}

function useUserSettings() {
  return useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const res = await fetch('/api/user-settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  })
}

function useUpdateSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await fetch('/api/user-settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-settings'] })
      toast.success('Setting saved')
    },
    onError: () => toast.error('Failed to save setting'),
  })
}

function SettingsToggle({ field, label, description }: { field: string; label: string; description?: string }) {
  const { data: settings } = useUserSettings()
  const updateMutation = useUpdateSetting()

  const value = settings?.[field] ?? false

  return (
    <SettingRow label={label} description={description}>
      <Toggle
        checked={value}
        onChange={(v) => updateMutation.mutate({ [field]: v })}
      />
    </SettingRow>
  )
}

export function SettingsForm() {
  const { data: session } = useSession()
  const [activeCategory, setActiveCategory] = useState('account')
  const [mobileShowContent, setMobileShowContent] = useState(false)

  const handleCategoryClick = (id: string) => {
    setActiveCategory(id)
    setMobileShowContent(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Settings</h1>
        <div className="flex gap-6">
          {/* Mobile */}
          <div className="w-full lg:hidden">
            {!mobileShowContent ? (
              <div className="space-y-0.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button key={cat.id} onClick={() => handleCategoryClick(cat.id)} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-colors">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 text-left"><p className="text-sm font-medium">{cat.label}</p><p className="text-xs text-muted-foreground">{cat.description}</p></div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <button onClick={() => setMobileShowContent(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                  Back
                </button>
                <SettingsContent category={activeCategory} />
              </div>
            )}
          </div>

          {/* Desktop */}
          <div className="hidden w-[380px] shrink-0 lg:block border-r border-border/50 pr-6">
            <nav className="space-y-0.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={cn("flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all text-left", activeCategory === cat.id ? "bg-accent" : "hover:bg-accent/50")}>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1"><p className="text-sm font-medium">{cat.label}</p><p className="text-xs text-muted-foreground">{cat.description}</p></div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="min-w-0 flex-1 hidden lg:block"><SettingsContent category={activeCategory} /></div>
        </div>
      </div>
    </div>
  )
}

function SettingsContent({ category }: { category: string }) {
  switch (category) {
    case 'account': return <AccountSettings />
    case 'privacy': return <PrivacySettings />
    case 'notifications': return <NotificationSettings />
    case 'appearance': return <AppearanceSettings />
    case 'social': return <SocialLinksSettings />
    case 'legal': return <LegalSettings />
    default: return null
  }
}

function AccountSettings() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name ?? '')
  const [bio, setBio] = useState((session?.user as any)?.bio ?? '')
  const [college, setCollege] = useState((session?.user as any)?.college ?? '')
  const [course, setCourse] = useState((session?.user as any)?.course ?? '')
  const [semester, setSemester] = useState((session?.user as any)?.semester ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const saveMutation = useMutation({
    mutationFn: (data: any) => fetch('/api/user-settings/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { toast.success('Profile updated'); update(); },
    onError: () => toast.error('Failed to update profile'),
  })

  const passwordMutation = useMutation({
    mutationFn: (data: any) => fetch('/api/user-settings/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { toast.success('Password changed'); setCurrentPassword(''); setNewPassword(''); },
    onError: () => toast.error('Failed to change password'),
  })

  return (
    <div>
      <Section title="Profile information">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16"><AvatarImage src={session?.user?.image ?? undefined} /><AvatarFallback className="text-lg">{session?.user?.name?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback></Avatar>
            <div><p className="text-sm font-medium">{session?.user?.name}</p><p className="text-xs text-muted-foreground">@{(session?.user as any)?.username || 'user'}</p></div>
          </div>
          <div className="space-y-1.5"><Label className="text-sm font-medium">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-xl bg-muted/30" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-medium">Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} placeholder="Write a bio..." className="rounded-xl bg-muted/30 min-h-[72px]" /><p className="text-xs text-muted-foreground text-right">{bio.length}/300</p></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-sm font-medium">College</Label><Input value={college} onChange={(e) => setCollege(e.target.value)} placeholder="Your college" className="h-10 rounded-xl bg-muted/30" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">Course</Label><Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. B.Tech CSE" className="h-10 rounded-xl bg-muted/30" /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-sm font-medium">Semester</Label><Input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="e.g. 3rd Semester" className="h-10 rounded-xl bg-muted/30" /></div>
          <Button onClick={() => saveMutation.mutate({ name, bio, college, course, semester })} disabled={saveMutation.isPending} className="rounded-xl">{saveMutation.isPending ? 'Saving...' : 'Save Profile'}</Button>
        </div>
      </Section>
      <Section title="Email">
        <div className="flex items-center justify-between">
          <p className="text-sm">{session?.user?.email}</p>
          <span className="text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">Verified</span>
        </div>
      </Section>
      <Section title="Change Password">
        <div className="space-y-3">
          <div className="space-y-1.5"><Label className="text-sm font-medium">Current Password</Label><div className="relative"><Input type={showCurrentPw ? 'text' : 'password'} placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="h-10 rounded-xl bg-muted/30 pr-10" /><button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground">{showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
          <div className="space-y-1.5"><Label className="text-sm font-medium">New Password</Label><div className="relative"><Input type={showNewPw ? 'text' : 'password'} placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-10 rounded-xl bg-muted/30 pr-10" /><button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground">{showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
          <Button onClick={() => passwordMutation.mutate({ currentPassword, newPassword })} disabled={passwordMutation.isPending || !currentPassword || !newPassword} variant="outline" className="rounded-xl">Update Password</Button>
        </div>
      </Section>
      <Section title="Danger Zone">
        <p className="text-sm text-muted-foreground mb-3">Once you delete your account, there is no going back.</p>
        {!showDeleteConfirm ? (
          <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => setShowDeleteConfirm(true)}>
            Delete Account
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-destructive font-medium">Are you sure? This cannot be undone.</p>
            <Button variant="destructive" size="sm" className="rounded-xl" onClick={() => {
              toast.error('Account deletion is not yet implemented')
              setShowDeleteConfirm(false)
            }}>
              Confirm Delete
            </Button>
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
          </div>
        )}
      </Section>
    </div>
  )
}

function PrivacySettings() {
  return (
    <div>
      <Section title="Audience and tagging">
        <SettingsToggle field="isPrivate" label="Protect your posts" description="Only approved followers can see your resources" />
        <SettingsToggle field="showEmail" label="Show email address" description="Display email on your public profile" />
        <SettingsToggle field="showFollowers" label="Show followers list" />
      </Section>
      <Section title="Content visibility">
        <SettingsToggle field="allowComments" label="Allow comments" description="Let others comment on your resources" />
        <SettingsToggle field="appearInSearch" label="Appear in search" description="Allow your profile to appear in search results" />
      </Section>
    </div>
  )
}

function NotificationSettings() {
  return (
    <div>
      <Section title="Push notifications">
        <SettingsToggle field="pushNotifications" label="Enable push notifications" />
      </Section>
      <Section title="Email notifications">
        <SettingsToggle field="emailNotifications" label="Enable email notifications" />
      </Section>
      <Section title="Activity">
        <SettingsToggle field="likeNotifications" label="Likes" />
        <SettingsToggle field="commentNotifications" label="Comments" />
        <SettingsToggle field="followNotifications" label="New followers" />
        <SettingsToggle field="downloadNotifications" label="Downloads" />
      </Section>
    </div>
  )
}

function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const { data: settings } = useUserSettings()
  const updateMutation = useUpdateSetting()

  return (
    <div>
      <Section title="Display">
        <p className="text-sm text-muted-foreground mb-4">Customize how PostPencil looks on your device.</p>
        <div className="grid grid-cols-3 gap-3">
          {[{ value: 'light', label: 'Light', icon: Sun }, { value: 'dark', label: 'Dark', icon: Moon }, { value: 'system', label: 'System', icon: () => <Monitor className="h-5 w-5" /> }].map((t) => {
            const Icon = t.icon
            return (
              <button key={t.value} onClick={() => { setTheme(t.value); updateMutation.mutate({ theme: t.value }); }} className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all", theme === t.value ? "border-foreground" : "border-border hover:border-foreground/50")}>
                <Icon />
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            )
          })}
        </div>
      </Section>
      <Section title="Languages">
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-medium">Language</p><p className="text-xs text-muted-foreground">English</p></div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </Section>
    </div>
  )
}

function Monitor({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
}

function SocialLinksSettings() {
  const { data: settings } = useUserSettings()
  const [twitter, setTwitter] = useState((settings as any)?.twitterUrl ?? '')
  const [github, setGithub] = useState((settings as any)?.githubUrl ?? '')
  const [linkedin, setLinkedin] = useState((settings as any)?.linkedinUrl ?? '')
  const [website, setWebsite] = useState((settings as any)?.websiteUrl ?? '')
  const updateMutation = useUpdateSetting()

  useEffect(() => {
    if (settings) {
      setTwitter((settings as any)?.twitterUrl ?? '')
      setGithub((settings as any)?.githubUrl ?? '')
      setLinkedin((settings as any)?.linkedinUrl ?? '')
      setWebsite((settings as any)?.websiteUrl ?? '')
    }
  }, [settings])

  const handleSave = () => {
    updateMutation.mutate({ twitterUrl: twitter, githubUrl: github, linkedinUrl: linkedin, websiteUrl: website })
  }

  return (
    <div>
      <Section title="Social links">
        <p className="text-sm text-muted-foreground mb-4">Add links to your social profiles.</p>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label className="text-sm font-medium">Twitter / X</Label><Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/username" className="h-10 rounded-xl bg-muted/30" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-medium">GitHub</Label><Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/username" className="h-10 rounded-xl bg-muted/30" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-medium">LinkedIn</Label><Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" className="h-10 rounded-xl bg-muted/30" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-medium">Website</Label><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yoursite.com" className="h-10 rounded-xl bg-muted/30" /></div>
        </div>
        <div className="mt-4">
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="rounded-xl">{updateMutation.isPending ? 'Saving...' : 'Save Social Links'}</Button>
        </div>
      </Section>
    </div>
  )
}

function LegalSettings() {
  return (
    <div className="py-2">
      {[{ href: '/privacy', title: 'Privacy Policy', desc: 'How we collect and use your data' },
        { href: '/terms', title: 'Terms of Service', desc: 'Rules and guidelines for using PostPencil' },
        { href: '/cookies', title: 'Cookie Policy', desc: 'How we use cookies and tracking' },
        { href: '/guidelines', title: 'Community Guidelines', desc: 'Standards for behavior and content' }].map((item) => (
        <Link key={item.href} href={item.href} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-accent/50 transition-colors">
          <div className="flex-1"><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </Link>
      ))}
      <p className="text-xs text-muted-foreground mt-4 px-4">PostPencil v1.0.0</p>
    </div>
  )
}
