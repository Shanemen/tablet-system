"use client"

import { useState } from "react"
import JSZip from "jszip"
import { X, Loader, Check, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SelectedCount, ExportPlanItem, PDFResult } from "@/lib/types/application"

// Re-export so existing importers (e.g. dashboard page) keep working
export type { PDFResult }

// Step 2 - Export Confirmation
interface ExportConfirmationProps {
  selectedCount: SelectedCount
  ceremonyName?: string
  onCancel: () => void
  onConfirm: () => void
}

export function ExportConfirmation({ selectedCount, ceremonyName = '法會', onCancel, onConfirm }: ExportConfirmationProps) {
  const files = [
    { name: '長生祿位.pdf', paper: '紅紙' },
    { name: '往生蓮位.pdf', paper: '黃紙' },
    { name: '歷代祖先.pdf', paper: '黃紙' },
    { name: '冤親債主.pdf', paper: '黃紙' },
    { name: '墮胎嬰靈.pdf', paper: '黃紙' },
    { name: '地基主.pdf', paper: '黃紙' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Fixed header */}
        <div className="p-6 pb-4 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">批量導出 PDF</h3>
            <Button onClick={onCancel} variant="ghost" size="sm" className="hover:bg-muted">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="px-6 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-4">
            {/* Selection Summary */}
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
              <div className="flex justify-between text-base mb-2">
                <span className="text-foreground">已選擇申請：</span>
                <span className="font-bold text-primary">{selectedCount.applications} 份</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-foreground">總牌位數：</span>
                <span className="font-bold text-primary">{selectedCount.tablets} 個</span>
              </div>
            </div>

            {/* Processing Rules */}
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-base font-medium text-foreground mb-2">📋 自動處理規則：</div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• 按6種牌位類型自動分組</li>
                <li>• 每頁排版 5 個牌位（橫列單行），自動分頁</li>
                <li>• A4 尺寸含 3mm 出血區，適合專業印刷</li>
              </ul>
            </div>

            {/* Files to Generate */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="font-medium mb-2 text-base text-foreground">將生成以下文件：</div>
              <div className="space-y-1.5">
                {files.map((file, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 text-sm">
                    <span className="text-foreground break-all">{i + 1}. {new Date().toISOString().split('T')[0]}_{ceremonyName}_{file.name}</span>
                    <span className="text-muted-foreground text-xs shrink-0">({file.paper}打印)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed footer - Action Buttons */}
        <div className="p-6 pt-4 shrink-0">
          <div className="flex gap-3">
            <Button onClick={onCancel} variant="outline" className="flex-1 hover:bg-muted hover:text-foreground">
              取消
            </Button>
            <Button onClick={onConfirm} className="flex-1 bg-primary hover:bg-primary/85 hover:shadow-md transition-all">
              開始生成
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Step 3 - Generation Progress
interface ExportProgressProps {
  progress: number
  plan: ExportPlanItem[]
  completedTypes: Set<string>
  activeType: string | null
}

export function ExportProgress({ progress, plan, completedTypes, activeType }: ExportProgressProps) {
  // Real totals derived from the selected applications
  const totalTablets = plan.reduce((sum, item) => sum + item.count, 0)
  const doneTablets = plan
    .filter(item => completedTypes.has(item.type))
    .reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-3">
              <Loader className="animate-spin text-primary" size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground">正在生成牌位...</h3>
            <p className="text-sm text-muted-foreground mt-1">請稍候，這可能需要幾分鐘</p>
          </div>

          <div className="space-y-4">
            {/* Overall Progress */}
            <div>
              <div className="flex justify-between text-base mb-2">
                <span className="font-medium text-foreground">整體進度</span>
                <span className="text-primary font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Per-type Progress (real data) */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="text-base font-medium text-foreground mb-3">當前進度：</div>
              {plan.length === 0 ? (
                <div className="flex items-center gap-2 text-base text-muted-foreground">
                  <Loader size={16} className="animate-spin text-primary" />
                  正在準備...
                </div>
              ) : (
                plan.map((item) => {
                  const isCompleted = completedTypes.has(item.type)
                  const isInProgress = !isCompleted && activeType === item.type

                  return (
                    <div key={item.type} className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <Check size={16} className="text-primary" />
                        ) : isInProgress ? (
                          <Loader size={16} className="animate-spin text-primary" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className={
                          isCompleted ? 'text-primary' :
                          isInProgress ? 'text-primary font-medium' :
                          'text-muted-foreground'
                        }>
                          {item.typeName}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {isCompleted ? `${item.count}個 ✓` :
                         isInProgress ? `生成中… (${item.count}個)` :
                         `${item.count}個 等待中`}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            {/* Real tablet completion count */}
            {totalTablets > 0 && (
              <div className="text-center text-base text-muted-foreground">
                已生成 {doneTablets}/{totalTablets} 個牌位
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

// Step 4 - Completion
interface ExportCompletionProps {
  selectedCount: SelectedCount
  pdfResults: PDFResult[]
  onClose: () => void
  // Called once every PDF has actually been downloaded — the only moment the
  // selected applications should be marked as downloaded. Generating alone does
  // not count, and a partial download (close before all are fetched) does not call this.
  onAllDownloaded?: () => void | Promise<void>
}

// Paper type mapping
const PAPER_TYPE_MAP: Record<string, string> = {
  'longevity': '紅紙',
  'long-living': '紅紙',
  'deceased': '黃紙',
  'ancestors': '黃紙',
  'karmic_creditors': '黃紙',
  'karmic-creditors': '黃紙',
  'aborted_spirits': '黃紙',
  'aborted-spirits': '黃紙',
  'land_deity': '黃紙',
  'land-deity': '黃紙'
}

export function ExportCompletion({ selectedCount, pdfResults, onClose, onAllDownloaded }: ExportCompletionProps) {
  // Track downloaded files
  const [downloadedFiles, setDownloadedFiles] = useState<Set<string>>(new Set())
  // Show close warning dialog
  const [showCloseWarning, setShowCloseWarning] = useState(false)
  // Whether a ZIP bundle is currently being built
  const [zipping, setZipping] = useState(false)

  const datePrefix = new Date().toISOString().split('T')[0]

  // Handle close button click
  const handleCloseClick = async () => {
    const remainingCount = pdfResults.length - downloadedFiles.size
    if (remainingCount > 0) {
      // Not everything was downloaded → warn; closing voids the batch and leaves
      // the applications as "待處理" (onAllDownloaded is intentionally NOT called).
      setShowCloseWarning(true)
    } else {
      // Every PDF was downloaded → now it counts as downloaded.
      await onAllDownloaded?.()
      onClose()
    }
  }

  // Decode a base64 PDF into raw bytes
  const base64ToBytes = (base64: string) => {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  // Trigger a browser download for a given blob + filename
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Helper function to download a single PDF
  const downloadPDF = (result: PDFResult) => {
    try {
      const blob = new Blob([base64ToBytes(result.pdfBase64)], { type: 'application/pdf' })
      triggerDownload(blob, `${datePrefix}_${result.typeName}.pdf`)
    } catch (error) {
      console.error('Download failed:', error)
      alert('下載失敗，請重試')
    }
  }

  // Handle download with state tracking
  const handleDownload = (result: PDFResult) => {
    downloadPDF(result)
    setDownloadedFiles(prev => new Set(prev).add(result.typeName))
  }

  // Bundle every PDF into a single ZIP and download it in one click
  const handleDownloadAll = async () => {
    if (zipping || pdfResults.length === 0) return
    setZipping(true)
    try {
      const zip = new JSZip()
      for (const result of pdfResults) {
        zip.file(`${datePrefix}_${result.typeName}.pdf`, base64ToBytes(result.pdfBase64))
      }
      const blob = await zip.generateAsync({ type: 'blob' })

      // Derive a ceremony label from a result's typeName (`${ceremony}_${type}`)
      const ceremonyLabel = (pdfResults[0]?.typeName.replace(/_[^_]*$/, '') || '法會').trim()
      triggerDownload(blob, `${datePrefix}_${ceremonyLabel}.zip`)

      // All files are now in the user's hands
      setDownloadedFiles(new Set(pdfResults.map(r => r.typeName)))
    } catch (error) {
      console.error('ZIP download failed:', error)
      alert('打包下載失敗，請重試')
    } finally {
      setZipping(false)
    }
  }

  // Calculate file sizes (rough estimate: base64 length / 1.37 to get original size)
  const getFileSize = (base64: string): string => {
    const sizeInBytes = (base64.length * 3) / 4
    const sizeInMB = sizeInBytes / (1024 * 1024)
    return sizeInMB < 1 
      ? `${(sizeInBytes / 1024).toFixed(1)}KB`
      : `${sizeInMB.toFixed(1)}MB`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="max-w-2xl w-full relative max-h-[90vh] flex flex-col">
        {/* Close button - top right (always visible: card is capped at 90vh) */}
        <Button
          onClick={handleCloseClick}
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 hover:bg-muted z-10 h-10 w-10"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Fixed header: title + one-click ZIP download */}
        <div className="p-6 pb-0 shrink-0">
          <div className="flex flex-col items-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-3">
              <Check className="text-primary" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-foreground text-center">已生成 {pdfResults.length} 個 PDF</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              {downloadedFiles.size}/{pdfResults.length} 已下載
            </p>
          </div>

          {/* One-click: download every PDF as a single ZIP */}
          <Button
            onClick={handleDownloadAll}
            disabled={zipping}
            size="lg"
            className="w-full h-14 mb-5 text-lg bg-primary hover:bg-primary/85 hover:shadow-md transition-all"
          >
            {zipping ? (
              <>
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                打包中…
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                全部下載 (ZIP)
              </>
            )}
          </Button>
        </div>

        {/* Scrollable file list */}
        <div className="px-6 pb-6 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-3">
            {pdfResults.map((result, i) => (
              <div key={i} className="border border-border rounded-lg p-4 hover:bg-muted transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-grow min-w-0">
                    <FileText className="text-slate-600 shrink-0" size={32} />
                    <div className="min-w-0">
                      <div className="font-semibold text-base text-foreground break-all">
                        {datePrefix}_{result.typeName}.pdf
                      </div>
                      <div className="text-base text-muted-foreground">
                        {result.count}個牌位 • {result.pageCount}頁 • {getFileSize(result.pdfBase64)} • {PAPER_TYPE_MAP[result.type]}打印
                      </div>
                      {result.skippedCount > 0 && (
                        <div className="text-sm text-[#770002] mt-0.5">
                          ⚠️ {result.skippedCount} 張缺圖已跳過
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(result)}
                    size="sm"
                    variant={downloadedFiles.has(result.typeName) ? "outline" : "default"}
                    className={`shrink-0 ${downloadedFiles.has(result.typeName)
                      ? ""
                      : "bg-primary hover:bg-primary/85 hover:shadow-md transition-all"
                    }`}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    {downloadedFiles.has(result.typeName) ? "再次下載" : "下載"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Warning Dialog */}
        {showCloseWarning && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
            <div className="bg-background border border-border rounded-lg p-6 mx-4 shadow-lg">
              <h4 className="text-lg font-bold text-foreground mb-2">確定要關閉嗎？</h4>
              <p className="text-muted-foreground mb-4">
                尚有 {pdfResults.length - downloadedFiles.size} 個 PDF 未下載，關閉後將會被清除。本次導出的申請會保持「待處理」。
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={onClose} 
                  variant="outline" 
                  className="flex-1"
                >
                  確認關閉
                </Button>
                <Button 
                  onClick={() => setShowCloseWarning(false)} 
                  className="flex-1 bg-primary hover:bg-primary/85"
                >
                  返回下載
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

