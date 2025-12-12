"use client"

import { useState } from "react"
import { X, Loader, Check, FileText, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SelectedCount } from "@/lib/types/application"

// PDF Result type
export interface PDFResult {
  type: string
  typeName: string
  pdfBase64: string
  count: number
  pageCount: number
}

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-foreground">批量導出 PDF</h3>
            <Button onClick={onCancel} variant="ghost" size="sm" className="hover:bg-muted">
              <X className="h-5 w-5" />
            </Button>
          </div>

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
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{i + 1}. {new Date().toISOString().split('T')[0]}_{ceremonyName}_{file.name}</span>
                    <span className="text-muted-foreground text-xs">({file.paper}打印)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
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
}

export function ExportProgress({ progress }: ExportProgressProps) {
  const files = [
    { name: '長生祿位', count: 300 },
    { name: '往生蓮位', count: 800 },
    { name: '歷代祖先', count: 150 },
    { name: '冤親債主', count: 100 },
    { name: '墮胎嬰靈', count: 50 },
    { name: '地基主', count: 30 }
  ]

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

            {/* Individual File Progress */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="text-base font-medium text-foreground mb-3">當前進度：</div>
              {files.map((item, i) => {
                const itemProgress = Math.max(0, progress - (i * 17))
                const isCompleted = itemProgress >= 100
                const isInProgress = itemProgress > 0 && itemProgress < 100

                return (
                  <div key={i} className="flex items-center justify-between text-base">
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
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {isCompleted ? `${item.count}個` :
                       isInProgress ? `${Math.floor(item.count * itemProgress / 100)}/${item.count}` :
                       '等待中'}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Estimated Time */}
            <div className="text-center text-base text-muted-foreground">
              預計剩餘時間：{Math.max(0, Math.ceil((100 - progress) / 50))} 分鐘
            </div>
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

export function ExportCompletion({ selectedCount, pdfResults, onClose }: ExportCompletionProps) {
  // Track downloaded files
  const [downloadedFiles, setDownloadedFiles] = useState<Set<string>>(new Set())

  // Helper function to download a single PDF
  const downloadPDF = (result: PDFResult) => {
    try {
      // Convert base64 to blob
      const binaryString = atob(result.pdfBase64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'application/pdf' })
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${new Date().toISOString().split('T')[0]}_${result.typeName}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
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

  // Preview PDF in new tab
  const previewPDF = (result: PDFResult) => {
    try {
      // Convert base64 to blob
      const binaryString = atob(result.pdfBase64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'application/pdf' })
      
      // Open in new tab
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      
      // Clean up after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error('Preview failed:', error)
      alert('預覽失敗，請重試')
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-3">
              <Check className="text-primary" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">生成完成！</h3>
            <p className="text-sm text-muted-foreground mt-1">
              已成功生成 {pdfResults.length} 個 PDF 文件
            </p>
          </div>

          <div className="space-y-3">
            {pdfResults.map((result, i) => (
              <div key={i} className="border border-border rounded-lg p-4 hover:bg-muted transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-grow">
                    <FileText className="text-slate-600" size={32} />
                    <div>
                      <div className="font-semibold text-base text-foreground">
                        {new Date().toISOString().split('T')[0]}_{result.typeName}.pdf
                      </div>
                      <div className="text-base text-muted-foreground">
                        {result.count}個牌位 • {result.pageCount}頁 • {getFileSize(result.pdfBase64)} • {PAPER_TYPE_MAP[result.type]}打印
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => previewPDF(result)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      預覽
                    </Button>
                    <Button 
                      onClick={() => handleDownload(result)}
                      size="sm"
                      variant={downloadedFiles.has(result.typeName) ? "outline" : "default"}
                      className={downloadedFiles.has(result.typeName) 
                        ? "" 
                        : "bg-primary hover:bg-primary/85 hover:shadow-md transition-all"
                      }
                    >
                      <Download className="mr-1 h-4 w-4" />
                      {downloadedFiles.has(result.typeName) ? "再次下載" : "下載"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-muted-foreground text-center mt-4 mb-4">
            進度：{downloadedFiles.size}/{pdfResults.length} 已下載
          </div>

          <div className="flex justify-center mt-6">
            <Button onClick={onClose} variant="outline" className="hover:bg-primary/10 hover:border-primary hover:text-primary">
              關閉
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

