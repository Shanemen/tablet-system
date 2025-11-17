'use client'

import { logout } from '@/app/admin/login/actions'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      await logout()
    }
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
    >
      <LogOut className="mr-2 h-4 w-4" />
      退出登录
    </Button>
  )
}

