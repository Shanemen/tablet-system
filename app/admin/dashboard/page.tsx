"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/admin/PageLayout"
import { PageHeader } from "@/components/admin/PageHeader"
import { ApplicationStats } from "@/components/admin/ApplicationStats"
import { ApplicationSearch } from "@/components/admin/ApplicationSearch"
import { ApplicationTable } from "@/components/admin/ApplicationTable"
import { ExportConfirmation, ExportProgress, ExportCompletion, PDFResult } from "@/components/admin/ExportDialog"
import { Applicant, Stats, SelectedCount, ApplicationStatus } from "@/lib/types/application"
import { getApplications } from "./actions"
import { exportTabletsToPDF } from "./export-actions"

export default function AdminDashboardPage() {
  // Data state
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  
  // UI state
  const [step, setStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
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
  
  // Statistics state
  const [stats, setStats] = useState<Stats>({
    total: 0,
    exported: 0,
    pending: 0,
    problematic: 0,
  })

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
        
        setLoading(false)
      } catch (error) {
        console.error("Failed to load applications:", error)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Real export process
  useEffect(() => {
    if (step === 3 && selectedApplicationIds.length > 0) {
      // Start export
      setExportProgress(0)
      setExportError(null)
      
      // Simulate progress during export
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 5, 90)) // Cap at 90% until real completion
      }, 200)
      
      // Call actual export function
      exportTabletsToPDF(selectedApplicationIds)
        .then((results) => {
          clearInterval(progressInterval)
          setPdfResults(results)
          setExportProgress(100)
          
          // Move to completion step after a brief delay
          setTimeout(() => {
            setStep(4)
          }, 500)
        })
        .catch((error) => {
          clearInterval(progressInterval)
          console.error('Export failed:', error)
          setExportError(error.message || '導出失敗，請重試')
          setExportProgress(0)
          
          // Show error and go back to step 1
          alert(`導出失敗：${error.message || '未知錯誤'}`)
          setStep(1)
        })
      
      return () => clearInterval(progressInterval)
    }
  }, [step, selectedApplicationIds])

  // Filter logic
  const filterData = () => {
    let result = applicants

    // Search filter
    if (searchActive && searchQuery.trim()) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.phone.includes(searchQuery) ||
          item.tabletNames.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
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
  const handleSearch = () => {
    setSearchActive(true)
  }

  const handleClearSearch = () => {
    setSearchActive(false)
    setSearchQuery("")
  }

  const handleCardClick = (status: ApplicationStatus | null) => {
    setActiveCard(activeCard === status ? null : status)
    setSearchActive(false)
    setSearchQuery("")
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

  const handleCloseStep4 = () => {
    // Update stats after export
    const exportedCount = selectedCount.applications
    setStats(prevStats => ({
      ...prevStats,
      exported: prevStats.exported + exportedCount,
      pending: Math.max(0, prevStats.pending - exportedCount)
    }))
    
    setStep(1)
    setSelectedCount({ applications: 0, tablets: 0 })
    setExportProgress(0)
    
    // Trigger highlight animation
    setHighlightExported(true)
    setHighlightPending(true)
    setTimeout(() => {
      setHighlightExported(false)
      setHighlightPending(false)
    }, 3000)
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
            subtitle="当前法会：2024年3月15日 三時繫念法會"
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
            />
          </div>
        )}

        {/* Export Dialogs */}
        {step === 2 && (
          <ExportConfirmation
            selectedCount={selectedCount}
            onCancel={() => setStep(1)}
            onConfirm={() => setStep(3)}
          />
        )}
        {step === 3 && <ExportProgress progress={exportProgress} />}
        {step === 4 && pdfResults.length > 0 && (
          <ExportCompletion
            selectedCount={selectedCount}
            pdfResults={pdfResults}
            onClose={handleCloseStep4}
          />
        )}
    </PageLayout>
  )
}

