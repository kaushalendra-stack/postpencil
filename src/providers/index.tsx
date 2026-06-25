'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'react-hot-toast'
import { FloatingThemeToggle } from '@/components/ui/floating-theme-toggle'
import { AuthProvider } from './auth-provider'
import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryProvider>
          <TooltipProvider>
            {children}
            <Toaster />
            <FloatingThemeToggle />
          </TooltipProvider>
        </QueryProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
