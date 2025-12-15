'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Raleway } from 'next/font/google'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { DiamondPlus } from 'lucide-react'

const raleway = Raleway({ 
  subsets: ['latin'],
  weight: ['600', '700'],
  adjustFontFallback: false
})

export default function LoginPage() {
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        router.push('/admin/dashboard')
      } else {
        // Only show login form if user is NOT logged in
        setCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [router])

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await login(formData)
      
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
        setIsLoading(false)
      } else if (result?.success) {
        // Redirect on success
        router.push('/admin/dashboard')
        // Don't set loading to false here to prevent UI flash during redirect
      }
    } catch (error) {
      setMessage({ type: 'error', text: '发生错误，请重试' })
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  // Header component
  const Header = () => (
    <header className="absolute top-0 left-0 right-0 z-10 py-4 px-6">
      <div className="flex items-center justify-center gap-2">
        <DiamondPlus className="h-6 w-6 text-primary" />
        <span className={`text-lg font-semibold text-primary ${raleway.className}`}>
          Online Tablet System
        </span>
      </div>
    </header>
  )

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-breathe"
          style={{ 
            backgroundImage: 'url(/backgrounds/lotus_pond.png)',
            filter: 'blur(2px)',
            transform: 'scale(1.05)'
          }}
        />
        <div className="absolute inset-0 bg-black/10" /> {/* Light overlay */}
      <Header />
      <Card className="relative w-full max-w-md p-8 shadow-2xl bg-white/95 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">
            牌位管理系統
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>驗證中...</span>
          </div>
        </div>
      </Card>
      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-primary/80">
          © {new Date().getFullYear()} Made with Metta 🪷
        </p>
      </footer>
    </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-breathe"
        style={{ 
          backgroundImage: 'url(/backgrounds/lotus_pond.png)',
          filter: 'blur(2px)',
          transform: 'scale(1.05)' // Prevent blur edge artifacts
        }}
      />
      <div className="absolute inset-0 bg-black/10" /> {/* Light overlay */}
      <Header />
      <Card className="relative w-full max-w-md p-8 shadow-2xl bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            牌位管理系統
          </h1>
          <p className="text-muted-foreground">
            管理员登录
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-50 border border-red-200 text-red-800' 
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Login Form */}
        <form action={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              邮箱地址
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@example.com"
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              密码
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="输入密码"
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/85 hover:shadow-md transition-all text-lg h-12"
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            需要账号？请联系系统管理员
          </p>
        </div>
      </Card>
      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-primary/80">
          © {new Date().getFullYear()} Made with Metta 🪷
        </p>
      </footer>
    </div>
  )
}

