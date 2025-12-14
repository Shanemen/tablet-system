/**
 * Preview Confirm Step - Show all tablets before final submission
 * 
 * Features:
 * - Display all added tablets grouped by type
 * - Show preview images for each tablet
 * - Buttons: 返回修改 + 確認提交
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import {
  getApplicantInfo,
  getCartTablets,
  getCartCount,
  TabletItem,
} from '@/lib/utils/application-storage'
import {
  getTabletTypeLabel,
  TabletTypeValue,
} from '@/lib/tablet-types-config'

interface PreviewConfirmStepProps {
  onBack: () => void
  onConfirm: () => Promise<void>
}

export function PreviewConfirmStep({ onBack, onConfirm }: PreviewConfirmStepProps) {
  const [tablets, setTablets] = useState<TabletItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setTablets(getCartTablets())
    setTotalCount(getCartCount())
  }, [])

  // Group tablets by type
  const tabletsByType: Record<string, TabletItem[]> = {}
  tablets.forEach((tablet) => {
    if (!tabletsByType[tablet.tabletType]) {
      tabletsByType[tablet.tabletType] = []
    }
    tabletsByType[tablet.tabletType].push(tablet)
  })

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error('Confirmation error:', error)
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Title - same layout as ApplicationDetailsPage */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg text-muted-foreground font-normal">
            請仔細檢查確認無誤後提交：總計 {totalCount} 位
          </h2>
        </div>

        {/* Preview Images Grouped by Type */}
        {Object.entries(tabletsByType).map(([tabletType, items]) => {
          const typeLabel = getTabletTypeLabel(tabletType as TabletTypeValue)
          
          return (
            <div key={tabletType} className="space-y-4">
              <h2 className="text-xl font-bold text-primary border-b pb-2">
                {typeLabel} ({items.length} 位)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
                {items.map((tablet) => {
                  const displayText = tablet.displayText || Object.values(tablet.formData).filter(v => v).join('，')
                  
                  // CRITICAL: Only use the saved Supabase Storage URL
                  // This MUST be the same image the user approved in the form
                  // NO dynamic generation - consistency is the core requirement!
                  const imageUrl = tablet.previewUrl
                  
                  if (!imageUrl) {
                    // If no image URL, this is a data integrity issue
                    console.error('Missing image URL for tablet:', tablet.id, displayText)
                    return (
                      <div key={tablet.id} className="space-y-3 flex flex-col items-center">
                        <div className="relative bg-red-50 border-2 border-red-300 rounded-lg p-8 text-center">
                          <p className="text-red-600 font-semibold">圖片缺失</p>
                          <p className="text-sm text-red-500 mt-2">請刪除此牌位並重新添加</p>
                        </div>
                        <p className="font-medium text-lg">{displayText}</p>
                      </div>
                    )
                  }
                  
                  return (
                    <div key={tablet.id} className="space-y-3 flex flex-col items-center">
                      <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-md border border-gray-200 transition-transform hover:scale-105">
                        <img 
                          src={imageUrl} 
                          alt={`Tablet for ${displayText}`} 
                          className="h-[400px] w-auto object-contain"
                          onError={(e) => {
                            // Image load failed - show error instead of generating new image
                            console.error('Image load error for saved URL:', imageUrl)
                            e.currentTarget.style.display = 'none'
                            const errorDiv = document.createElement('div')
                            errorDiv.className = 'p-8 text-center text-red-600'
                            errorDiv.innerHTML = `
                              <p class="font-semibold">圖片加載失敗</p>
                              <p class="text-sm mt-2">URL: ${imageUrl.substring(0, 50)}...</p>
                            `
                            e.currentTarget.parentElement?.appendChild(errorDiv)
                          }}
                        />
                      </div>
                      <p className="font-medium text-lg">{displayText}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="btn-secondary-elder w-full sm:w-auto"
            disabled={submitting}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            返回
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={submitting}
            className="btn-primary-elder w-full sm:w-auto sm:flex-1 bg-green-600 hover:bg-green-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                確認提交（{totalCount}位）
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

