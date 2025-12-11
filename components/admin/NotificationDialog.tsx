'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface NotificationDialogProps {
  message: string
  onClose: () => void
}

/**
 * 通知对话框
 * 
 * 居中显示的成功通知弹窗，样式与删除确认弹窗一致
 */
export function NotificationDialog({
  message,
  onClose,
}: NotificationDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm p-6 space-y-4">
        {/* Success Icon and Message */}
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
          <p className="text-base text-foreground">
            {message}
          </p>
        </div>

        {/* OK Button */}
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="btn-primary-large"
            autoFocus
          >
            OK
          </Button>
        </div>
      </Card>
    </div>
  )
}
