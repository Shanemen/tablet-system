/**
 * Step 4: Cart Review and Submission
 * 
 * Shows all tablets grouped by type
 * Each item can be deleted
 * Shows total count
 * Submit button to complete application
 * 
 * Elder-friendly design with large buttons and clear organization
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, Loader2, CheckCircle } from 'lucide-react'
import {
  getCartTablets,
  getCartTabletsByType,
  removeTabletFromCart,
  getApplicantInfo,
  TabletItem,
} from '@/lib/utils/application-storage'
import { getTabletTypeLabel, getPreviewText, TabletTypeValue } from '@/lib/tablet-types-config'

interface CartReviewStepProps {
  onBack: () => void
  onSubmit: () => Promise<void>
}

export function CartReviewStep({ onBack, onSubmit }: CartReviewStepProps) {
  const [tablets, setTablets] = useState<TabletItem[]>([])
  const [tabletsByType, setTabletsByType] = useState<Record<TabletTypeValue, TabletItem[]>>({})
  const [applicantInfo, setApplicantInfo] = useState<{ name: string; phone: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setTablets(getCartTablets())
    setTabletsByType(getCartTabletsByType())
    setApplicantInfo(getApplicantInfo())
  }

  const handleDelete = (tabletId: string) => {
    if (deleteConfirm === tabletId) {
      removeTabletFromCart(tabletId)
      loadData()
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(tabletId)
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirm(null)
      }, 3000)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onSubmit()
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitting(false)
    }
  }

  const totalCount = tablets.length

  if (totalCount === 0) {
    return (
      <div className="space-y-8">
        <Card className="p-12 text-center">
          <p className="text-2xl text-muted-foreground mb-6">
            清單是空的
          </p>
          <Button onClick={onBack} className="btn-primary-elder h-14 text-lg">
            返回添加牌位
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="form-step-title text-3xl font-bold text-foreground mb-2">
          確認提交申請
        </h2>
        <p className="text-lg text-muted-foreground">
          請檢查您的牌位清單，確認無誤後提交
        </p>
      </div>

      {/* Applicant Info Summary */}
      {applicantInfo && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="text-xl font-semibold text-foreground mb-3">申請人資料</h3>
          <div className="space-y-2 text-lg">
            <p>
              <span className="text-muted-foreground">姓名：</span>
              <span className="font-medium">{applicantInfo.name}</span>
            </p>
            <p>
              <span className="text-muted-foreground">電話：</span>
              <span className="font-medium">{applicantInfo.phone}</span>
            </p>
          </div>
        </Card>
      )}

      {/* Tablets List Grouped by Type */}
      <div className="space-y-6">
        {Object.entries(tabletsByType).map(([type, items]) => (
          <Card key={type} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-foreground">
                {getTabletTypeLabel(type as TabletTypeValue)}
              </h3>
              <div className="bg-primary text-primary-foreground rounded-full px-4 py-1 text-lg font-bold">
                {items.length} 位
              </div>
            </div>

            <div className="space-y-3">
              {items.map((tablet, index) => {
                const displayText = getPreviewText(tablet.tabletType, tablet.formData)
                const isConfirmingDelete = deleteConfirm === tablet.id

                return (
                  <div
                    key={tablet.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3">
                        <span className="text-lg text-muted-foreground">
                          第 {index + 1} 位
                        </span>
                        <span className="text-xl font-semibold text-foreground">
                          {displayText}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleDelete(tablet.id)}
                      variant={isConfirmingDelete ? 'destructive' : 'outline'}
                      className="h-12 px-4 text-base"
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      {isConfirmingDelete ? '確認刪除' : '刪除'}
                    </Button>
                  </div>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Total Summary */}
      <Card className="p-6 bg-primary/10 border-primary">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-foreground">總計</span>
          <span className="text-3xl font-bold text-primary">{totalCount} 位</span>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="h-16 text-lg font-semibold"
          disabled={submitting}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          返回繼續添加
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary-elder h-16 text-lg font-semibold bg-green-600 hover:bg-green-700"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              提交中...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-6 w-6" />
              確認提交申請
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <Card className="p-4 bg-muted/50 border-muted">
        <p className="text-base text-muted-foreground text-center">
          提交後，您將收到確認通知。如需修改，請聯繫寺廟工作人員。
        </p>
      </Card>
    </div>
  )
}

