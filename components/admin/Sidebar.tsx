'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Users, LogOut } from 'lucide-react'
import { logout } from '@/app/admin/login/actions'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'

// Manual avatar assignments - add users here!
// Available: boba, cheesecake, daffodil, fairy-jar, grapefruit, hyacinth, 
//            latte, lily-pad, lotus, pearl, pine, pinwheel, tea, tomato
const USER_AVATARS: Record<string, string> = {
  'shanemen@gmail.com': 'pearl.png',
  // Add more users here:
  // 'another@example.com': 'lotus.png',
}

// Default avatar for users not in the list
const DEFAULT_AVATAR = 'lotus.png'

// Get avatar image path for a user
function getAvatarForEmail(email: string): string {
  const avatar = USER_AVATARS[email.toLowerCase()] || DEFAULT_AVATAR
  return `/avatars/${avatar}`
}

interface TempleInfo {
  name_zh: string
  logo_url?: string | null
}

interface SidebarProps {
  userEmail: string
  templeInfo?: TempleInfo | null
}

export function Sidebar({ userEmail, templeInfo }: SidebarProps) {
  const pathname = usePathname()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    setShowLogoutConfirm(false)
    await logout()
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

  // Get avatar image for this user
  const avatarSrc = getAvatarForEmail(userEmail)

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      {/* Header: Temple Branding + System Title */}
      <div className="p-6">
        {/* Temple Branding - shown above system title */}
        {templeInfo && (
          <div className="mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              {templeInfo.logo_url && (
                <Image 
                  src={templeInfo.logo_url} 
                  alt={templeInfo.name_zh} 
                  width={40} 
                  height={40}
                  className="rounded-md object-contain"
                />
              )}
              <p className="text-sm font-medium text-foreground leading-tight">
                {templeInfo.name_zh}
              </p>
            </div>
          </div>
        )}
        
        {/* System Title */}
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
          {/* Avatar Circle with cute image */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary p-1.5">
            <Image
              src={avatarSrc}
              alt="User avatar"
              width={52}
              height={52}
              className="object-contain"
            />
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

      {/* Logout Confirm Dialog */}
      {showLogoutConfirm && (
        <ConfirmDialog
          title="退出登錄"
          message="確定要退出登錄嗎？"
          type="logout"
          confirmText="確認"
          cancelText="取消"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  )
}

