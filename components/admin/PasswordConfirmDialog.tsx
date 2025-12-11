'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface PasswordConfirmDialogProps {
  onConfirm: (password: string) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

/**
 * 密码确认对话框
 * 
 * 用于删除操作前的密码验证，提高安全性
 */
export function PasswordConfirmDialog({
  onConfirm,
  onCancel,
  isLoading = false,
}: PasswordConfirmDialogProps) {
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password) {
      await onConfirm(password)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        {/* Warning Icon and Title */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-2">
              確認刪除表格
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              此操作將永久刪除：
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>法會信息</li>
              <li>所有相關的申請記錄</li>
              <li>申請表單鏈接將失效</li>
            </ul>
            <p className="text-sm font-semibold text-red-600 mt-3">
              此操作無法撤銷！
            </p>
          </div>
        </div>

        {/* Password Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              請輸入您的密碼以確認刪除
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入密碼"
              className="w-full"
              disabled={isLoading}
              required
              autoFocus
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="btn-secondary-large"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !password}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-base font-semibold rounded-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  刪除中...
                </>
              ) : (
                '確認刪除'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
