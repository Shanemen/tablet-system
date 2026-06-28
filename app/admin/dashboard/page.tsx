"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/admin/PageLayout"
import { PageHeader } from "@/components/admin/PageHeader"
import { ApplicationStats } from "@/components/admin/ApplicationStats"
import { ApplicationSearch } from "@/components/admin/ApplicationSearch"
import { ApplicationTable } from "@/components/admin/ApplicationTable"
import { ExportConfirmation, ExportProgress, ExportCompletion, PDFResult } from "@/components/admin/ExportDialog"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { NotificationDialog } from "@/components/admin/NotificationDialog"
import { Applicant, Stats, SelectedCount, ApplicationStatus, ExportPlanItem } from "@/lib/types/application"
import { getApplications } from "./actions"
import { getExportPlan, exportSingleType, markApplicationsDownloaded } from "./export-actions"
import { resetApplicationsToPending, resetAllExportedToPending } from "./test-actions"
import { getCurrentCeremony, type Ceremony } from "../ceremonies/actions"
import { convertToTraditional } from "@/lib/utils/chinese-converter-client"

export default function AdminDashboardPage() {
  // Data state
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCeremony, setCurrentCeremony] = useState<Ceremony | null>(null)
  
  // UI state
  const [step, setStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [convertedQuery, setConvertedQuery] = useState("") // Traditional Chinese version of query
  const [searchActive, setSearchActive] = useState(false)
  const [activeCard, setActiveCard] = useState<ApplicationStatus | null>("pending")
  const [selectedCount, setSelectedCount] = useState<SelectedCount>({ applications: 0, tablets: 0 })
  const [exportProgress, setExportProgress] = useState(0)
  const [highlightExported, setHighlightExported] = useState(false)
  const [highlightPending, setHighlightPending] = useState(false)
  
  // Export state
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<number[]>([])
  const [pdfResults, setPdfResults] = useState<PDFResult[]>([])
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportPlan, setExportPlan] = useState<ExportPlanItem[]>([])
  const [completedTypes, setCompletedTypes] = useState<Set<string>>(new Set())
  const [activeType, setActiveType] = useState<string | null>(null)
  
  // Statistics state
  const [stats, setStats] = useState<Stats>({
    total: 0,
    exported: 0,
    pending: 0,
    problematic: 0,
  })

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean
    title: string
    message: string
    onConfirm: () => void
  } | null>(null)

  // Notification dialog state
  const [notification, setNotification] = useState<string | null>(null)

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getApplications()
        setApplicants(data)
        
        // Calculate stats
        setStats({
          total: data.length,
          exported: data.filter((a) => a.status === "exported").length,
          pending: data.filter((a) => a.status === "pending").length,
          problematic: data.filter((a) => a.status === "problematic").length,
        })
        
        // Load current ceremony
        const ceremony = await getCurrentCeremony()
        setCurrentCeremony(ceremony)
        console.log('[Dashboard] Loaded ceremony:', ceremony?.name_zh)
        
        setLoading(false)
      } catch (error) {
        console.error("Failed to load applications:", error)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Real export process: drive generation per tablet type so progress is real.
  useEffect(() => {
    if (step !== 3 || selectedApplicationIds.length === 0) return

    let cancelled = false

    async function runExport() {
      // Reset progress state for this run
      setExportProgress(0)
      setExportError(null)
      setExportPlan([])
      setCompletedTypes(new Set())
      setActiveType(null)
      setPdfResults([])

      try {
        // 1) Get the real plan: which tablet types exist and how many in each
        const plan = await getExportPlan(selectedApplicationIds)
        if (cancelled) return
        setExportPlan(plan)

        const totalTablets = plan.reduce((sum, item) => sum + item.count, 0)
        const results: PDFResult[] = []
        let doneTablets = 0

        // 2) Generate one PDF per type, updating progress as each finishes
        for (const item of plan) {
          if (cancelled) return
          setActiveType(item.type)

          const result = await exportSingleType(
            selectedApplicationIds,
            item.type,
            currentCeremony?.name_zh || '法會'
          )
          if (cancelled) return

          results.push(result)
          doneTablets += item.count
          setPdfResults([...results])
          setCompletedTypes(prev => new Set(prev).add(item.type))
          setExportProgress(totalTablets > 0 ? Math.round((doneTablets / totalTablets) * 100) : 100)
        }

        setActiveType(null)

        // Do NOT mark as downloaded here. Generating a PDF is not the same as
        // downloading it — applications are marked only after the user actually
        // downloads every PDF (see ExportCompletion onAllDownloaded below).
        setExportProgress(100)
        setTimeout(() => {
          if (!cancelled) setStep(4)
        }, 400)
      } catch (error: any) {
        if (cancelled) return
        console.error('Export failed:', error)
        setExportError(error.message || '導出失敗，請重試')
        setExportProgress(0)
        alert(`導出失敗：${error.message || '未知錯誤'}`)
        setStep(1)
      }
    }

    runExport()

    return () => {
      cancelled = true
    }
  }, [step, selectedApplicationIds])

  // Filter logic
  const filterData = () => {
    let result = applicants

    // Search filter (uses converted traditional Chinese query)
    if (searchActive && convertedQuery) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(convertedQuery) ||
          item.phone.includes(searchQuery) ||
          item.tabletNames.some(name => name.toLowerCase().includes(convertedQuery))
      )
    }

    // Active card filter
    if (activeCard) {
      result = result.filter((item) => item.status === activeCard)
    }

    // Sort by priority when showing all
    if (!activeCard && !searchActive) {
      const statusPriority = { pending: 1, problematic: 2, exported: 3 }
      result = [...result].sort((a, b) => statusPriority[a.status] - statusPriority[b.status])
    }

    return result
  }

  const filtered = filterData()

  // Event handlers
  const handleSearch = async () => {
    // Convert simplified to traditional for searching
    const traditional = await convertToTraditional(searchQuery)
    setConvertedQuery(traditional.toLowerCase().trim())
    setSearchActive(true)
  }

  const handleClearSearch = () => {
    setSearchActive(false)
    setSearchQuery("")
    setConvertedQuery("")
  }

  const handleCardClick = (status: ApplicationStatus | null) => {
    setActiveCard(activeCard === status ? null : status)
    setSearchActive(false)
    setSearchQuery("")
    setConvertedQuery("")
    setSelectedCount({ applications: 0, tablets: 0 })
  }

  const handleSelectChange = (applications: number, tablets: number) => {
    setSelectedCount({ applications, tablets })
    
    // Get IDs of the first N pending applications
    if (applications > 0) {
      const pendingApps = filtered.filter(app => app.status === "pending")
      const selectedIds = pendingApps.slice(0, applications).map(app => app.id)
      setSelectedApplicationIds(selectedIds)
    } else {
      setSelectedApplicationIds([])
    }
  }

  const handleCloseStep4 = async () => {
    // Reload data from database to get updated stats
    setLoading(true)
    try {
      const data = await getApplications()
      setApplicants(data)
      
      // Recalculate stats from fresh data
      setStats({
        total: data.length,
        exported: data.filter((a) => a.status === "exported").length,
        pending: data.filter((a) => a.status === "pending").length,
        problematic: data.filter((a) => a.status === "problematic").length,
      })
    } catch (error) {
      console.error("Failed to reload applications:", error)
    } finally {
      setLoading(false)
    }
    
    setStep(1)
    setSelectedCount({ applications: 0, tablets: 0 })
    setExportProgress(0)
    setPdfResults([])
    setExportPlan([])
    setCompletedTypes(new Set())
    setActiveType(null)

    // Trigger highlight animation
    setHighlightExported(true)
    setHighlightPending(true)
    setTimeout(() => {
      setHighlightExported(false)
      setHighlightPending(false)
    }, 3000)
  }

  // Reset ALL exported applications to pending (for emergency recovery)
  const handleResetAllExported = () => {
    setConfirmDialog({
      show: true,
      title: '重置所有已下載圖片申請',
      message: '確定要將所有已下載圖片申請重置為待處理狀態嗎？',
      onConfirm: async () => {
        setConfirmDialog(null)
        setLoading(true)
        try {
          await resetAllExportedToPending()
          
          // Reload data
          const data = await getApplications()
          setApplicants(data)
          
          // Recalculate stats
          setStats({
            total: data.length,
            exported: data.filter((a) => a.status === "exported").length,
            pending: data.filter((a) => a.status === "pending").length,
            problematic: data.filter((a) => a.status === "problematic").length,
          })
      
          setNotification('已重置所有已下載圖片申請')
        } catch (error) {
          console.error("Failed to reset applications:", error)
          setNotification('重置失敗')
        } finally {
          setLoading(false)
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">載入中...</div>
      </div>
    )
  }

  return (
    <PageLayout>
      {/* Main Dashboard View */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Header */}
          <PageHeader 
            title="牌位管理" 
            subtitle={currentCeremony 
              ? `当前法会：${new Date(currentCeremony.start_at).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })} ${currentCeremony.name_zh}`
              : undefined
            }
          />

            {/* Search Bar */}
            <ApplicationSearch
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onSearch={handleSearch}
              onClear={handleClearSearch}
              searchActive={searchActive}
            />

            {/* Statistics */}
            <ApplicationStats
              stats={stats}
              activeCard={activeCard}
              onCardClick={handleCardClick}
              highlightExported={highlightExported}
              highlightPending={highlightPending}
            />

            {/* Application Table - with integrated batch export section */}
            <ApplicationTable
              applications={filtered}
              searchActive={searchActive}
              activeCard={activeCard}
              showBatchExport={activeCard === "pending" && stats.pending > 0 && !searchActive}
              selectedCount={selectedCount}
              onSelectChange={handleSelectChange}
              onExport={() => setStep(2)}
              stats={stats}
              onResetAllExported={handleResetAllExported}
              templeId={currentCeremony?.temple_id}
            />
          </div>
        )}

        {/* Export Dialogs */}
        {step === 2 && (
          <ExportConfirmation
            selectedCount={selectedCount}
            ceremonyName={currentCeremony?.name_zh}
            onCancel={() => setStep(1)}
            onConfirm={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <ExportProgress
            progress={exportProgress}
            plan={exportPlan}
            completedTypes={completedTypes}
            activeType={activeType}
          />
        )}
        {step === 4 && pdfResults.length > 0 && (
          <ExportCompletion
            selectedCount={selectedCount}
            pdfResults={pdfResults}
            onClose={handleCloseStep4}
            onAllDownloaded={() => markApplicationsDownloaded(selectedApplicationIds)}
          />
        )}

        {/* Confirm Dialog */}
        {confirmDialog && (
          <ConfirmDialog
            title={confirmDialog.title}
            message={confirmDialog.message}
            type="reset"
            confirmText="確認"
            cancelText="取消"
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
          />
        )}

        {/* Notification Dialog */}
        {notification && (
          <NotificationDialog
            message={notification}
            onClose={() => setNotification(null)}
          />
        )}
    </PageLayout>
  )
}

