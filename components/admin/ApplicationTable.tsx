"use client"

import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Applicant, statusConfig, ApplicationStatus, SelectedCount, Stats } from "@/lib/types/application"
import { BatchExportSection } from "./BatchExportSection"

interface ApplicationTableProps {
  applications: Applicant[]
  searchActive: boolean
  activeCard: ApplicationStatus | null
  // Batch export props - optional, only shown when viewing pending
  showBatchExport?: boolean
  selectedCount?: SelectedCount
  onSelectChange?: (applications: number, tablets: number) => void
  onExport?: () => void
  stats?: Stats
}

export function ApplicationTable({ 
  applications, 
  searchActive, 
  activeCard,
  showBatchExport = false,
  selectedCount,
  onSelectChange,
  onExport,
  stats
}: ApplicationTableProps) {
  const getTableTitle = () => {
    if (searchActive) return `搜索結果：找到 ${applications.length} 個結果`
    if (!activeCard) return "全部申請表格"
    if (activeCard === "exported") return "已導出申請表格"
    if (activeCard === "pending") return "待處理申請表格"
    if (activeCard === "problematic") return "有問題申請表格"
    return "申請表格"
  }

  return (
    <Card className="p-6">
      {/* Batch Export Section - shown at top when applicable */}
      {showBatchExport && selectedCount && onSelectChange && onExport && stats && (
        <div className="mb-8">
          <BatchExportSection
            selectedCount={selectedCount}
            onSelectChange={onSelectChange}
            onExport={onExport}
            stats={stats}
            pendingApplications={applications}
          />
        </div>
      )}
      
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-foreground">
          {getTableTitle()}
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 pt-1 pb-3 text-left text-base font-bold text-foreground">申請人</th>
              <th className="px-4 pt-1 pb-3 text-left text-base font-bold text-foreground">電話</th>
              <th className="px-4 pt-1 pb-3 text-left text-base font-bold text-foreground">牌位詳情</th>
              <th className="px-4 pt-1 pb-3 text-left text-base font-bold text-foreground">總數</th>
              <th className="px-4 pt-1 pb-3 text-left text-base font-bold text-foreground">狀態</th>
              <th className="px-4 pt-1 pb-3 text-left text-base font-bold text-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {searchActive ? "未找到匹配的申請" : "暫無申請"}
                </td>
              </tr>
            ) : (
              applications.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted">
                  <td className="px-4 py-3 text-base text-foreground font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-base text-foreground">{item.phone}</td>
                  <td className="px-4 py-3 text-base text-foreground">{item.tablet}</td>
                  <td className="px-4 py-3 text-base text-foreground">{item.total}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-sm rounded-full font-medium whitespace-nowrap ${statusConfig[item.status].color}`}>
                      {statusConfig[item.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:border-primary hover:text-primary cursor-pointer">
                      <Eye className="h-4 w-4 mr-1" />
                      查看
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

