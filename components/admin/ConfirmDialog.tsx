'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, LogOut, RotateCcw } from 'lucide-react'

type DialogType = 'warning' | 'logout' | 'reset'

interface ConfirmDialogProps {
  title: string
  message: string
  type?: DialogType
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

const iconMap = {
  warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
  logout: <LogOut className="h-6 w-6 text-primary" />,
  reset: <RotateCcw className="h-6 w-6 text-amber-500" />,
}

/**
 * 确认对话框
 * 
 * 统一样式的确认弹窗，替代浏览器原生 confirm()
 */
export function ConfirmDialog({
  title,
  message,
  type = 'warning',
  confirmText = '確認',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm p-6 space-y-4">
        {/* Icon and Title */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {iconMap[type]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="btn-primary-large"
          >
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  )
}
