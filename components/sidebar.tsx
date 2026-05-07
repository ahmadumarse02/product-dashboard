'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronLeft, Package, Home, Menu, BarChart3, Settings, Grid, Users } from 'lucide-react'

type SidebarProps = {
  isCollapsed: boolean
  isMobileOpen: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onMobileOpenChange: (open: boolean) => void
}

export function Sidebar({
  isCollapsed,
  isMobileOpen,
  onCollapsedChange,
  onMobileOpenChange,
}: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      label: 'Products',
      href: '/dashboard/products',
      icon: Package,
    },
    {
      label: 'Categories',
      href: '/dashboard/categories',
      icon: Grid,
    },
    {
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      label: 'Users',
      href: '/dashboard/users',
      icon: Users,
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => onMobileOpenChange(true)}
        className={cn(
          "fixed bottom-5 right-5 z-40 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-colors hover:bg-blue-700 lg:hidden",
          isMobileOpen && "hidden"
        )}
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 transition-all duration-300 lg:z-30',
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className={cn('flex items-center gap-2', isCollapsed && 'lg:hidden')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Admin</span>
          </div>
          <button
            type="button"
            onClick={() => onCollapsedChange(!isCollapsed)}
            className={cn(
              'hidden p-1 text-white/60 transition-colors hover:text-white lg:flex',
              isCollapsed && 'mx-auto'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={cn(
                'w-5 h-5 transition-transform duration-300',
                isCollapsed && 'rotate-180'
              )}
            />
          </button>
        </div>

        {/* Sidebar content */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onMobileOpenChange(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                  isCollapsed && 'lg:justify-center',
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={cn('font-medium max-lg:inline', isCollapsed ? 'lg:hidden' : 'lg:inline')}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => onMobileOpenChange(false)}
        />
      )}
    </>
  )
}
