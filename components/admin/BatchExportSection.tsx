"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Applicant, Stats, SelectedCount } from "@/lib/types/application"

interface BatchExportSectionProps {
  selectedCount: SelectedCount
  onSelectChange: (applications: number, tablets: number) => void
  onExport: () => void
  stats: Stats
  pendingApplications: Applicant[]
}

export function BatchExportSection({ 
  selectedCount, 
  onSelectChange, 
  onExport, 
  stats, 
  pendingApplications 
}: BatchExportSectionProps) {
  // Calculate total tablets for pending applications
  const totalPendingTablets = pendingApplications.reduce((sum, app) => sum + app.total, 0)
  const first100Count = Math.min(100, pendingApplications.length)
  const first100Tablets = pendingApplications.slice(0, first100Count).reduce((sum, app) => sum + app.total, 0)
  
  return (
    <div className="mb-4 p-4 bg-muted/30 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedCount.applications === 0 ? (
            <>
              <span className="text-lg font-semibold text-foreground">選擇要導出的申請：</span>
              <Button
                onClick={() => onSelectChange(first100Count, first100Tablets)}
                variant="outline"
                size="lg"
                className="border-2 border-primary/50 text-primary hover:bg-primary/10 text-lg"
              >
                前100份 ({first100Tablets}個牌位)
              </Button>
              <Button
                onClick={() => onSelectChange(pendingApplications.length, totalPendingTablets)}
                variant="outline"
                size="lg"
                className="border-2 border-primary/50 text-primary hover:bg-primary/10 text-lg"
              >
                全部 ({pendingApplications.length}份，{totalPendingTablets}個牌位)
              </Button>
            </>
          ) : (
            <>
              <span className="text-lg font-bold text-primary">
                已選擇 {selectedCount.applications} 份申請，共 {selectedCount.tablets} 個牌位
              </span>
              <Button
                onClick={() => onSelectChange(0, 0)}
                variant="ghost"
                size="lg"
                className="text-slate-600 hover:text-slate-900 hover:bg-muted underline hover:no-underline"
              >
                清除選擇
              </Button>
            </>
          )}
        </div>

        <Button
          onClick={onExport}
          disabled={selectedCount.applications === 0}
          size="lg"
          className={selectedCount.applications > 0 ? "bg-primary hover:bg-primary/90 text-lg" : "text-lg"}
        >
          <Download className="mr-2 h-5 w-5" />
          批量導出PDF
        </Button>
      </div>
    </div>
  )
}

