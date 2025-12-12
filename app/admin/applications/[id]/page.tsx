/**
 * Application Detail Page
 * 
 * Shows full application details when admin clicks "查看" button.
 * Reuses visual elements from the apply flow.
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageLayout } from '@/components/admin/PageLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { Applicant, statusConfig } from '@/lib/types/application'
import { getApplicationById, markAsProblematic, markAsExported } from './actions'
import { getTabletTypeLabel, TabletTypeValue } from '@/lib/tablet-types-config'

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = Number(params.id)
  
  const [application, setApplication] = useState<Applicant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Dialog states
  const [showProblematicDialog, setShowProblematicDialog] = useState(false)
  const [showExportedDialog, setShowExportedDialog] = useState(false)
  const [problemNote, setProblemNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadApplication() {
      try {
        const data = await getApplicationById(applicationId)
        if (data) {
          setApplication(data)
        } else {
          setError('申請不存在')
        }
      } catch (err) {
        console.error('Failed to load application:', err)
        setError('載入失敗')
      } finally {
        setLoading(false)
      }
    }
    
    if (applicationId) {
      loadApplication()
    }
  }, [applicationId])

  // Handle mark as problematic
  const handleMarkProblematic = async () => {
    if (!problemNote.trim()) return
    
    setIsSubmitting(true)
    const result = await markAsProblematic(applicationId)
    setIsSubmitting(false)
    
    if (result.success) {
      setShowProblematicDialog(false)
      setProblemNote('')
      // Refresh application data
      const data = await getApplicationById(applicationId)
      if (data) setApplication(data)
    } else {
      alert('操作失敗：' + result.error)
    }
  }

  // Handle mark as exported
  const handleMarkExported = async () => {
    setIsSubmitting(true)
    const result = await markAsExported(applicationId)
    setIsSubmitting(false)
    
    if (result.success) {
      setShowExportedDialog(false)
      // Refresh application data
      const data = await getApplicationById(applicationId)
      if (data) setApplication(data)
    } else {
      alert('操作失敗：' + result.error)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-muted-foreground">載入中...</div>
        </div>
      </PageLayout>
    )
  }

  if (error || !application) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            className="mb-4 hover:bg-primary/10 hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div className="text-center py-20">
            <div className="text-lg text-red-600">{error || '申請不存在'}</div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Group tablets by type (same logic as PreviewConfirmStep)
  const tabletsByType: Record<string, typeof application.tabletDetails> = {}
  application.tabletDetails.forEach((tablet) => {
    const type = tablet.tablet_type || 'unknown'
    if (!tabletsByType[type]) {
      tabletsByType[type] = []
    }
    tabletsByType[type].push(tablet)
  })

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          onClick={() => router.back()} 
          variant="outline" 
          className="hover:bg-primary/10 hover:border-primary hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回列表
        </Button>

        {/* Page Header */}
        <div className="mt-2">
          <PageHeader title="申請詳情" />
        </div>

        {/* Applicant Info Card - reduce top margin */}
        <Card className="p-4 sm:p-5 bg-primary/5 border-primary/20 -mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-lg">
            <p>
              <span className="text-muted-foreground">申請人姓名：</span>
              <span className="font-medium text-foreground">{application.name}</span>
            </p>
            <p>
              <span className="text-muted-foreground">電話：</span>
              <span className="font-medium text-foreground">{application.phone}</span>
            </p>
            <p>
              <span className="text-muted-foreground">牌位總數：</span>
              <span className="font-medium text-foreground">{application.total} 位</span>
            </p>
            <p>
              <span className="text-muted-foreground">狀態：</span>
              <span className={`inline-block px-2 py-1 text-sm rounded-full font-medium ml-1 ${statusConfig[application.status].color}`}>
                {statusConfig[application.status].label}
              </span>
            </p>
          </div>
          
          {/* Action Buttons - show based on current status */}
          <div className="flex gap-3 mt-4">
            {/* Show "Mark as Problematic" for: pending, exported */}
            {(application.status === 'pending' || application.status === 'exported') && (
              <Button
                variant="outline"
                onClick={() => setShowProblematicDialog(true)}
                className="hover:bg-primary/10 hover:border-primary hover:text-primary"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                標記為有問題
              </Button>
            )}
            {/* Show "Mark as Downloaded" for: pending, problematic */}
            {(application.status === 'pending' || application.status === 'problematic') && (
              <Button
                variant="outline"
                onClick={() => setShowExportedDialog(true)}
                className="hover:bg-primary/10 hover:border-primary hover:text-primary"
              >
                <Check className="h-4 w-4 mr-1" />
                標記為已下載
              </Button>
            )}
          </div>
        </Card>

        {/* Tablets Preview - Same layout as PreviewConfirmStep */}
        <div className="space-y-8">
          {/* Preview Images Grouped by Type - Exact same structure as PreviewConfirmStep */}
          {Object.entries(tabletsByType).map(([tabletType, items]) => {
            const typeLabel = getTabletTypeLabel(tabletType as TabletTypeValue)
            
            return (
              <div key={tabletType} className="space-y-4">
                <h2 className="text-xl font-bold text-primary border-b pb-2">
                  {typeLabel} ({items.length} 位)
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
                  {items.map((tablet, index) => {
                    const imageUrl = tablet.image_url
                    
                    if (!imageUrl) {
                      return (
                        <div key={index} className="space-y-3 flex flex-col items-center">
                          <div className="relative bg-red-50 border-2 border-red-300 rounded-lg p-8 text-center">
                            <p className="text-red-600 font-semibold">圖片缺失</p>
                            <p className="text-sm text-red-500 mt-2">此牌位沒有保存圖片</p>
                          </div>
                          <p className="font-medium text-lg">{tablet.display_name}</p>
                        </div>
                      )
                    }
                    
                    return (
                      <div key={index} className="space-y-3 flex flex-col items-center">
                        <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-md border border-gray-200 transition-transform hover:scale-105">
                          <img 
                            src={imageUrl} 
                            alt={`Tablet for ${tablet.display_name}`} 
                            className="h-[400px] w-auto object-contain"
                          />
                        </div>
                        <p className="font-medium text-lg">{tablet.display_name}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Problematic Dialog with Note Input */}
      {showProblematicDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  標記為有問題
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  請說明問題原因，方便日後處理。
                </p>
              </div>
            </div>
            
            <textarea
              value={problemNote}
              onChange={(e) => setProblemNote(e.target.value)}
              placeholder="請輸入備註..."
              className="w-full h-24 px-3 py-2 border border-border rounded-md text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowProblematicDialog(false)
                  setProblemNote('')
                }}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button
                type="button"
                onClick={handleMarkProblematic}
                disabled={!problemNote.trim() || isSubmitting}
                className="bg-primary hover:bg-primary/85"
              >
                {isSubmitting ? '處理中...' : '確認標記'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Exported Confirmation Dialog */}
      {showExportedDialog && (
        <ConfirmDialog
          title="標記為已下載"
          message="確定將此申請標記為已下載嗎？"
          type="warning"
          confirmText={isSubmitting ? '處理中...' : '確認'}
          cancelText="取消"
          onConfirm={handleMarkExported}
          onCancel={() => setShowExportedDialog(false)}
        />
      )}
    </PageLayout>
  )
}

