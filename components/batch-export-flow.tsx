"use client"

import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Search, Upload, FileDown, CheckCircle2, Eye, X, Download, Loader, Check, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Sample data - 使用固定的伪随机种子生成一致的数据
const generateMockApplicants = () => {
  const surnames = ["王", "李", "張", "劉", "陳", "楊", "黃", "趙", "吳", "周", "徐", "孫", "馬", "朱", "胡", "郭", "林", "何", "高", "梁"]
  const givenNames = ["小明", "美玲", "建國", "怡君", "家豪", "佳琪", "志強", "淑芬", "文華", "雅婷", "俊傑", "麗華", "偉明", "秀英", "明哲", "慧珍", "國強", "淑惠", "宗翰", "雅芳"]
  const tabletTypes = [
    { type: "長生祿位", count: [1, 2, 3] },
    { type: "往生蓮位", count: [1, 3, 5, 8, 10] },
    { type: "歷代祖先", count: [1] },
    { type: "冤親債主", count: [1, 2] },
    { type: "墮胎嬰靈", count: [1, 2] },
    { type: "地基主", count: [1] }
  ]
  
  const applicants = []
  
  // 使用固定的伪随机序列（基于索引）
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }
  
  for (let i = 1; i <= 200; i++) {
    const surnameIndex = Math.floor(seededRandom(i * 7) * surnames.length)
    const givenNameIndex = Math.floor(seededRandom(i * 11) * givenNames.length)
    const name = surnames[surnameIndex] + givenNames[givenNameIndex]
    
    // 生成电话号码
    const phoneNum1 = Math.floor(seededRandom(i * 13) * 100).toString().padStart(2, '0')
    const phoneNum2 = Math.floor(seededRandom(i * 17) * 1000).toString().padStart(3, '0')
    const phoneNum3 = Math.floor(seededRandom(i * 19) * 1000).toString().padStart(3, '0')
    const phone = `09${phoneNum1}-${phoneNum2}-${phoneNum3}`
    
    // 随机选择1-3种牌位类型
    const numTypes = Math.floor(seededRandom(i * 23) * 3) + 1
    const selectedTypes = []
    const tabletNames = []
    let total = 0
    
    for (let j = 0; j < numTypes; j++) {
      const typeIndex = Math.floor(seededRandom(i * 29 + j * 31) * tabletTypes.length)
      const tabletType = tabletTypes[typeIndex]
      const countIndex = Math.floor(seededRandom(i * 37 + j * 41) * tabletType.count.length)
      const count = tabletType.count[countIndex]
      selectedTypes.push(`${tabletType.type}(${count})`)
      total += count
      
      // 生成牌位上的名字
      for (let k = 0; k < count; k++) {
        const tSurnameIdx = Math.floor(seededRandom(i * 43 + j * 47 + k * 53) * surnames.length)
        const tGivenNameIdx = Math.floor(seededRandom(i * 59 + j * 61 + k * 67) * givenNames.length)
        tabletNames.push(surnames[tSurnameIdx] + givenNames[tGivenNameIdx])
      }
    }
    
    // 状态分布：已导出=25, 待处理=168, 有问题=7 (总共200)
    let status
    if (i <= 25) {
      status = "exported"
    } else if (i <= 193) {  // 25 + 168 = 193
      status = "pending"
    } else {
      status = "problematic"
    }
    
    applicants.push({
      id: i,
      name,
      phone,
      tablet: selectedTypes.join("、"),
      tabletNames,
      total,
      status
    })
  }
  
  return applicants
}

const applicants = generateMockApplicants()

// Status badge styling - 柔和配色
const statusConfig = {
  exported: { label: "已導出", color: "text-primary bg-primary/10" },
  pending: { label: "待處理", color: "text-muted-foreground bg-muted" },
  problematic: { label: "有問題", color: "text-slate-700 bg-slate-100" },
}

// StatCard component - moved outside to prevent re-creation
const StatCard = ({ label, value, status, activeCard, onCardClick, highlight }) => {
  const isActive = activeCard === status

  return (
    <button
      onClick={() => onCardClick(status)}
      className={`w-full rounded-lg p-6 text-left transition-all ${
        isActive 
          ? "bg-primary text-white shadow-lg" 
          : highlight 
            ? "bg-primary/10 border-2 border-primary/40 animate-pulse" 
            : "bg-white border border-border hover:shadow-md hover:border-primary/50"
      }`}
    >
      <div className={`text-4xl font-bold ${isActive ? "text-white" : "text-primary/70"}`}>
        {value}
      </div>
      <div className={`mt-2 text-sm font-medium ${isActive ? "text-white" : "text-foreground"}`}>
        {label}
      </div>
    </button>
  )
}

// SearchBar component - completely isolated
const SearchBar = ({ searchQuery, onSearchQueryChange, onSearch, onClear, searchActive }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onSearch()
    }
  }

  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索申請人姓名、電話或牌位上親友名字..."
          className="pl-10 bg-white dark:bg-card border border-border"
        />
      </div>
      <Button onClick={onSearch} className="whitespace-nowrap">
        搜索
      </Button>
      {searchActive && (
        <Button onClick={onClear} variant="outline" className="whitespace-nowrap">
          <X className="mr-2 h-4 w-4" />
          清除
        </Button>
      )}
    </div>
  )
}

// Batch Export Section Component
const BatchExportSection = ({ selectedCount, onSelectChange, onExport, stats, pendingApplications }) => {
  // Calculate total tablets for pending applications
  const totalPendingTablets = pendingApplications.reduce((sum, app) => sum + app.total, 0)
  const first100Count = Math.min(100, pendingApplications.length)
  const first100Tablets = pendingApplications.slice(0, first100Count).reduce((sum, app) => sum + app.total, 0)
  
  return (
    <Card className="p-6 bg-primary/5 border-l-4 border-primary">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedCount.applications === 0 ? (
            <>
              <span className="text-sm font-medium text-foreground">選擇要導出的申請：</span>
              <Button
                onClick={() => onSelectChange(first100Count, first100Tablets)}
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                前100個 ({first100Count}份申請，{first100Tablets}個牌位)
              </Button>
              <Button
                onClick={() => onSelectChange(pendingApplications.length, totalPendingTablets)}
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                全部申請 ({pendingApplications.length}份申請，{totalPendingTablets}個牌位)
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm font-semibold text-primary">
                已選擇 {selectedCount.applications} 份申請，共 {selectedCount.tablets} 個牌位
              </span>
              <Button
                onClick={() => onSelectChange(0, 0)}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900 underline hover:no-underline"
              >
                清除選擇
              </Button>
            </>
          )}
        </div>

        <Button
          onClick={onExport}
          disabled={selectedCount.applications === 0}
          className={selectedCount.applications > 0 ? "bg-primary hover:bg-primary/90" : ""}
        >
          <Download className="mr-2 h-4 w-4" />
          批量導出PDF
        </Button>
      </div>
    </Card>
  )
}

// Main step 1 component
const Step1View = ({
  searchQuery,
  onSearchQueryChange,
  searchActive,
  onSearch,
  onClearSearch,
  activeCard,
  onCardClick,
  filtered,
  stats,
  onStepChange,
  selectedCount,
  onSelectChange,
  highlightExported,
  highlightPending,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6">
        <h1 className="text-3xl font-bold text-foreground">牌位申請管理</h1>
        <p className="mt-2 text-sm text-muted-foreground">當前法會：2024年3月15日 三時繫念法會</p>
      </div>

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        onSearch={onSearch}
        onClear={onClearSearch}
        searchActive={searchActive}
      />

      {/* Statistics Grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">統計總覽</h2>
        <div className="grid grid-cols-4 gap-4">
          <StatCard 
            label="全部申請" 
            value={stats.total} 
            status={null} 
            activeCard={activeCard} 
            onCardClick={onCardClick}
            highlight={false}
          />
          <StatCard
            label="已導出"
            value={stats.exported}
            status="exported"
            activeCard={activeCard}
            onCardClick={onCardClick}
            highlight={highlightExported}
          />
          <StatCard
            label="待處理"
            value={stats.pending}
            status="pending"
            activeCard={activeCard}
            onCardClick={onCardClick}
            highlight={highlightPending}
          />
          <StatCard
            label="有問題"
            value={stats.problematic}
            status="problematic"
            activeCard={activeCard}
            onCardClick={onCardClick}
            highlight={false}
          />
        </div>
      </div>

      {/* Batch Export Section - Only show when viewing pending status and not searching */}
      {activeCard === "pending" && stats.pending > 0 && !searchActive && (
        <BatchExportSection
          selectedCount={selectedCount}
          onSelectChange={onSelectChange}
          onExport={() => onStepChange(2)}
          stats={stats}
          pendingApplications={filtered}
        />
      )}

      {/* Data Table */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {searchActive && `搜索結果：找到 ${filtered.length} 個結果`}
            {!searchActive && !activeCard && "全部申請表格"}
            {!searchActive && activeCard === "exported" && "已導出申請表格"}
            {!searchActive && activeCard === "pending" && "待處理申請表格"}
            {!searchActive && activeCard === "problematic" && "有問題申請表格"}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-foreground">申請人</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">電話</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">牌位詳情</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">總數</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">狀態</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {searchActive ? "未找到匹配的申請" : "暫無申請"}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted">
                    <td className="px-4 py-3 text-foreground font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-foreground">{item.phone}</td>
                    <td className="px-4 py-3 text-foreground text-sm">{item.tablet}</td>
                    <td className="px-4 py-3 text-foreground">{item.total}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusConfig[item.status].color}`}>
                        {statusConfig[item.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// Step 2 - Export Confirmation Modal
const Step2View = ({ onStepChange, selectedCount }) => {
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
            <Button onClick={() => onStepChange(1)} variant="ghost" size="sm">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Selection Summary */}
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">已選擇申請：</span>
                <span className="font-bold text-primary">{selectedCount.applications} 份</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground">總牌位數：</span>
                <span className="font-bold text-primary">{selectedCount.tablets} 個</span>
              </div>
            </div>

            {/* Processing Rules */}
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-sm font-medium text-foreground mb-2">📋 自動處理規則：</div>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• 按6種牌位類型自動分組</li>
                <li>• 同類型牌位按申請人姓名拼音排序</li>
                <li>• 每頁排版 6-8 個牌位，自動分頁</li>
              </ul>
            </div>

            {/* Files to Generate */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="font-medium mb-2 text-sm text-foreground">將生成以下文件：</div>
              <div className="space-y-1.5">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{i + 1}. 2024-03-15_觀音法會_{file.name}</span>
                    <span className="text-muted-foreground text-[10px]">({file.paper}打印)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button onClick={() => onStepChange(1)} variant="outline" className="flex-1">
              取消
            </Button>
            <Button onClick={() => onStepChange(3)} className="flex-1 bg-primary hover:bg-primary/90">
              開始生成
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Step 3 - Generation Progress Modal
const Step3View = ({ exportProgress }) => {
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
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-foreground">整體進度</span>
                <span className="text-primary font-bold">{exportProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300 rounded-full" 
                  style={{ width: `${exportProgress}%` }} 
                />
              </div>
            </div>

            {/* Individual File Progress */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="text-sm font-medium text-foreground mb-3">當前進度：</div>
              {files.map((item, i) => {
                const itemProgress = Math.max(0, exportProgress - (i * 17))
                const isCompleted = itemProgress >= 100
                const isInProgress = itemProgress > 0 && itemProgress < 100

                return (
                  <div key={i} className="flex items-center justify-between text-sm">
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
                    <span className="text-xs text-muted-foreground">
                      {isCompleted ? `${item.count}個` :
                       isInProgress ? `${Math.floor(item.count * itemProgress / 100)}/${item.count}` :
                       '等待中'}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Estimated Time */}
            <div className="text-center text-sm text-muted-foreground">
              預計剩餘時間：{Math.max(0, Math.ceil((100 - exportProgress) / 50))} 分鐘
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Step 4 - Completion Modal
const Step4View = ({ onClose, selectedCount }) => {
  const files = [
    { name: '長生祿位.pdf', count: 300, size: '8.2MB', paper: '紅紙' },
    { name: '往生蓮位.pdf', count: 800, size: '21.5MB', paper: '黃紙' },
    { name: '歷代祖先.pdf', count: 150, size: '4.1MB', paper: '黃紙' },
    { name: '冤親債主.pdf', count: 100, size: '2.8MB', paper: '黃紙' },
    { name: '墮胎嬰靈.pdf', count: 50, size: '1.4MB', paper: '黃紙' },
    { name: '地基主.pdf', count: 30, size: '0.9MB', paper: '黃紙' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-3">
              <Check className="text-primary" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">生成完成！</h3>
            <p className="text-sm text-muted-foreground mt-1">已成功生成 6 個 PDF 文件</p>
          </div>

          <div className="space-y-3">
            {files.map((file, i) => (
              <div key={i} className="border border-border rounded-lg p-4 hover:bg-muted transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-grow">
                    <FileText className="text-slate-600" size={32} />
                    <div>
                      <div className="font-medium text-foreground">2024-03-15_觀音法會_{file.name}</div>
                      <div className="text-sm text-muted-foreground">{file.count}個牌位 • {file.size} • {file.paper}打印</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1 h-4 w-4" />
                      預覽
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Download className="mr-1 h-4 w-4" />
                      下載
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button className="flex-1 bg-primary hover:bg-primary/90">
              <Download className="mr-2 h-5 w-5" />
              全部下載 (ZIP)
            </Button>
            <Button onClick={onClose} variant="outline">
              關閉
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Main component
const BatchExportFlow = () => {
  const [step, setStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchActive, setSearchActive] = useState(false)
  const [activeCard, setActiveCard] = useState(null)
  const [selectedCount, setSelectedCount] = useState({ applications: 0, tablets: 0 })
  const [exportProgress, setExportProgress] = useState(0)
  const [highlightExported, setHighlightExported] = useState(false)
  const [highlightPending, setHighlightPending] = useState(false)
  
  // Statistics state
  const [stats, setStats] = useState({
    total: applicants.length,
    exported: applicants.filter((a) => a.status === "exported").length,
    pending: applicants.filter((a) => a.status === "pending").length,
    problematic: applicants.filter((a) => a.status === "problematic").length,
  })

  // Simulate export progress and update stats
  useEffect(() => {
    if (step === 3) {
      setExportProgress(0) // Reset progress when entering step 3
      const interval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            // Update stats when export completes
            const exportedApplications = selectedCount.applications
            const exportedTablets = selectedCount.tablets
            setStats(prevStats => ({
              ...prevStats,
              exported: prevStats.exported + exportedApplications,
              pending: prevStats.pending - exportedApplications
            }))
            setTimeout(() => setStep(4), 500) // Move to step 4 after completion
            return 100
          }
          return prev + 2
        })
      }, 100)
     
      return () => clearInterval(interval)
    }
  }, [step, selectedCount])

  // Filter logic
  const filterData = () => {
    let result = applicants

    // Search filter - only active when searchActive is true
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

  const handleCardClick = (status) => {
    setActiveCard(activeCard === status ? null : status)
    setSearchActive(false)
    setSearchQuery("")
    setSelectedCount({ applications: 0, tablets: 0 }) // Clear selection when changing card
  }

  const handleSelectChange = (applications, tablets) => {
    setSelectedCount({ applications, tablets })
  }

  const handleCloseStep4 = () => {
    setStep(1)
    setSelectedCount({ applications: 0, tablets: 0 })
    setExportProgress(0)
    // Trigger highlight animation
    setHighlightExported(true)
    setHighlightPending(true)
    setTimeout(() => {
      setHighlightExported(false)
      setHighlightPending(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        {step === 1 && (
          <Step1View
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            searchActive={searchActive}
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
            activeCard={activeCard}
            onCardClick={handleCardClick}
            filtered={filtered}
            stats={stats}
            onStepChange={setStep}
            selectedCount={selectedCount}
            onSelectChange={handleSelectChange}
            highlightExported={highlightExported}
            highlightPending={highlightPending}
          />
        )}
        {step === 2 && <Step2View onStepChange={setStep} selectedCount={selectedCount} />}
        {step === 3 && <Step3View exportProgress={exportProgress} />}
        {step === 4 && <Step4View onClose={handleCloseStep4} selectedCount={selectedCount} />}
      </div>
    </div>
  )
}

export default BatchExportFlow
