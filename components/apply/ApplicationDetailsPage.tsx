/**
 * Application Details Page (Main Menu)
 * 
 * Combines Type Selector + Summary Page into one unified page.
 * Shows:
 * - Applicant Info (editable)
 * - All tablet type cards with [Add] button
 * - Added entries displayed under each type
 * - [Go Back] + [Finish & Submit X]
 * 
 * IMPORTANT: 保留所有原来的样式，只改变骨架结构
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Plus, Trash2, ShoppingCart, CheckCircle, Loader2 } from 'lucide-react'
import {
  getTabletTypeOptions,
  TabletTypeValue,
  getPreviewText,
  getTabletTypeLabel,
} from '@/lib/tablet-types-config'
import {
  getApplicantInfo,
  getCartTabletsByType,
  getCartCount,
  removeTabletFromCart,
  TabletItem,
} from '@/lib/utils/application-storage'

interface ApplicationDetailsPageProps {
  onBack: () => void
  onEditApplicant: () => void
  onAddTablet: (type: TabletTypeValue) => void
  onSubmit: () => Promise<void>
}

export function ApplicationDetailsPage({
  onBack,
  onEditApplicant,
  onAddTablet,
  onSubmit,
}: ApplicationDetailsPageProps) {
  const [applicantInfo, setApplicantInfo] = useState<{ name: string; phone: string } | null>(null)
  const [tabletsByType, setTabletsByType] = useState<Partial<Record<TabletTypeValue, TabletItem[]>>>({})
  const [totalCount, setTotalCount] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const tabletTypes = getTabletTypeOptions()

  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = () => {
    setApplicantInfo(getApplicantInfo())
    setTabletsByType(getCartTabletsByType())
    setTotalCount(getCartCount())
  }

  const handleDelete = (tabletId: string) => {
    if (deleteConfirm === tabletId) {
      removeTabletFromCart(tabletId)
      refreshData()
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(tabletId)
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

  return (
    <div className="space-y-8">
      {/* Title with cart indicator - 复用 TabletTypeSelector 的样式 */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg text-muted-foreground font-normal mb-2">
            申請詳情
          </h2>
        </div>
        
        {totalCount > 0 && (
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
            <ShoppingCart className="h-5 w-5" />
            <span className="text-lg font-semibold">{totalCount} 位</span>
          </div>
        )}
      </div>

      {/* All Cards - Applicant Info + Tablet Types */}
      <div className="space-y-4">
        {/* Applicant Info Summary - 复用 CartReviewStep 的样式 */}
        {applicantInfo && (
          <Card className="p-4 sm:p-5 bg-primary/5 border-primary/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="section-title mb-3">申請人資料</h3>
                <div className="space-y-2 text-lg">
                  <p>
                    <span className="text-muted-foreground">姓名：</span>
                    <span className="font-medium text-muted-foreground">{applicantInfo.name}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">電話：</span>
                    <span className="font-medium text-muted-foreground">{applicantInfo.phone}</span>
                  </p>
                </div>
              </div>
              <Button
                onClick={onEditApplicant}
                variant="outline"
                className="h-12 px-4 text-base"
              >
                編輯
              </Button>
            </div>
          </Card>
        )}

        {/* Tablet Type Cards with Add button and entries - 复用 TabletTypeSelector 的卡片样式 */}
        {tabletTypes.map((type) => {
          const tablets = tabletsByType[type.value] || []
          const count = tablets.length

          return (
            <Card key={type.value} className="p-4 sm:p-5 gap-2 sm:gap-4">
              {/* Header row with type name and Add button */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="section-title mb-3">
                    {type.label}
                  </h3>
                  {/* Description */}
                  <p className="text-base text-muted-foreground leading-relaxed mb-0">
                    {type.description}
                  </p>
                </div>
                <Button
                  onClick={() => onAddTablet(type.value)}
                  className="btn-primary-elder"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  添加
                </Button>
              </div>

              {/* Added entries list - 使用分隔线设计，参考 Admin 表格 */}
              {count > 0 && (
                <div className="mt-2 divide-y divide-border">
                  {tablets.map((tablet, index) => {
                    const displayText = getPreviewText(tablet.tabletType, tablet.formData)
                    const isConfirmingDelete = deleteConfirm === tablet.id

                    return (
                      <div
                        key={tablet.id}
                        className="flex items-center justify-between py-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-baseline gap-3">
                            <span className="text-base text-muted-foreground">
                              {index + 1}.
                            </span>
                            <span className="text-lg font-semibold text-primary">
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
              )}
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {totalCount > 0 && (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary-elder w-full sm:flex-1 bg-green-600 hover:bg-green-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                確認提交申請 ({totalCount} 位)
              </>
            )}
          </Button>
        )}
        <Button
          onClick={onBack}
          variant="ghost"
          className="btn-secondary-elder w-full sm:w-auto"
          disabled={submitting}
        >
          返回
        </Button>
      </div>
    </div>
  )
}

