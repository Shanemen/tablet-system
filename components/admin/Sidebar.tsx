'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Users, LogOut } from 'lucide-react'
import { logout } from '@/app/admin/login/actions'

interface SidebarProps {
  userEmail: string
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  
  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      await logout()
    }
  }

  const navigation = [
    {
      name: '表格編輯',
      href: '/admin/ceremonies',
      icon: Calendar,
    },
    {
      name: '牌位管理',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: '常随信众',
      href: '/admin/devotees',
      icon: Users,
    },
  ]

  // Get first letter of email for avatar
  const initial = userEmail.charAt(0).toUpperCase()

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">牌位管理系統</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 px-4 pb-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="p-4">
        <div className="flex flex-col items-center gap-3">
          {/* Avatar Circle */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold">
            {initial}
          </div>
          
          {/* Email */}
          <div className="text-center">
            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {userEmail}
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </button>
        </div>
      </div>
    </div>
  )
}

