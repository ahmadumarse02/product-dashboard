'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // Only check auth once per session
      if (hasCheckedAuth) {
        setIsLoading(false)
        return
      }

      try {
        const session = await authClient.getSession()
        if (session.data) {
          setIsAuthenticated(true)
          setHasCheckedAuth(true)
        } else {
          router.replace('/login')
          return
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.replace('/login')
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, hasCheckedAuth])

  // Show loading while checking authentication (only on first load)
  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard layout if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Only render dashboard layout if authenticated
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCollapsedChange={setIsSidebarCollapsed}
        onMobileOpenChange={setIsMobileSidebarOpen}
      />
      <div
        className={cn(
          'min-w-0 transition-all duration-300',
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        <DashboardHeader />
        <main className="w-full min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
