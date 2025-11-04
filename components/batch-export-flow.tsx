"use client"

import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search, Upload, FileDown, CheckCircle2, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Sample data
const applicants = [
  { id: 1, name: "王小明", phone: "0912-345-678", tablet: "牌位A1", status: "exported" },
  { id: 2, name: "李美玲", phone: "0912-345-679", tablet: "牌位A2", status: "pending" },
  { id: 3, name: "張建國", phone: "0912-345-680", tablet: "牌位B1", status: "problematic" },
  { id: 4, name: "陳怡君", phone: "0912-345-681", tablet: "牌位B2", status: "exported" },
  { id: 5, name: "劉家豪", phone: "0912-345-682", tablet: "牌位C1", status: "pending" },
  { id: 6, name: "黃佳琪", phone: "0912-345-683", tablet: "牌位C2", status: "problematic" },
]

// Status badge styling
const statusConfig = {
  exported: { label: "已導出", color: "text-chart-2" },
  pending: { label: "待處理", color: "text-primary" },
  problematic: { label: "有問題", color: "text-destructive" },
}

// StatCard component - moved outside to prevent re-creation
const StatCard = ({ label, value, status, activeCard, onCardClick }) => {
  const isActive = activeCard === status
  const textColor = isActive ? "text-primary" : "text-primary/70"

  return (
    <button
      onClick={() => onCardClick(status)}
      className={`w-full rounded-lg border border-border bg-white p-6 text-left transition-all dark:bg-card ${
        isActive ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-background" : "hover:shadow-md"
      }`}
    >
      <div className={`text-4xl font-bold ${textColor}`}>{value}</div>
      <div className="mt-2 text-sm font-medium text-foreground">{label}</div>
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

// Main step 1 component
const Step1View = ({
  searchQuery,
  onSearchQueryChange,
  searchActive,
  onSearch,
  onClearSearch,
  activeCard,
  onCardClick,
  filterTab,
  onFilterTabChange,
  filtered,
  stats,
  onStepChange,
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
          <StatCard label="全部" value={stats.total} status={null} activeCard={activeCard} onCardClick={onCardClick} />
          <StatCard
            label="已導出"
            value={stats.exported}
            status="exported"
            activeCard={activeCard}
            onCardClick={onCardClick}
          />
          <StatCard
            label="待處理"
            value={stats.pending}
            status="pending"
            activeCard={activeCard}
            onCardClick={onCardClick}
          />
          <StatCard
            label="有問題"
            value={stats.problematic}
            status="problematic"
            activeCard={activeCard}
            onCardClick={onCardClick}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button variant={filterTab === "all" ? "default" : "outline"} onClick={() => onFilterTabChange("all")}>
          全部
        </Button>
        <Button variant={filterTab === "exported" ? "default" : "outline"} onClick={() => onFilterTabChange("exported")}>
          已導出
        </Button>
        <Button variant={filterTab === "pending" ? "default" : "outline"} onClick={() => onFilterTabChange("pending")}>
          待處理
        </Button>
        <Button
          variant={filterTab === "problematic" ? "default" : "outline"}
          onClick={() => onFilterTabChange("problematic")}
        >
          有問題
        </Button>
      </div>

      {/* Data Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-foreground">申請人</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">電話</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">牌位</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">狀態</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted">
                  <td className="px-4 py-3 text-foreground">{item.name}</td>
                  <td className="px-4 py-3 text-foreground">{item.phone}</td>
                  <td className="px-4 py-3 text-foreground">{item.tablet}</td>
                  <td className={`px-4 py-3 font-medium ${statusConfig[item.status].color}`}>
                    {statusConfig[item.status].label}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={() => onStepChange(2)} className="flex-1">
          <Upload className="mr-2 h-4 w-4" />
          導入資料
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          <FileDown className="mr-2 h-4 w-4" />
          批量導出
        </Button>
      </div>
    </div>
  )
}

// Step 2 component
const Step2View = ({ onStepChange }) => {
  return (
    <div className="space-y-6">
      <div className="pb-6">
        <h1 className="text-3xl font-bold text-foreground">匯入資料</h1>
        <p className="mt-2 text-sm text-muted-foreground">請選擇要匯入的檔案</p>
      </div>

      <Card className="border-2 border-dashed border-border p-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="font-semibold text-foreground">點擊或拖放檔案到此</p>
            <p className="text-sm text-muted-foreground">支持 CSV、Excel 格式</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => onStepChange(1)} variant="outline" className="flex-1">
          返回
        </Button>
        <Button className="flex-1">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          確認匯入
        </Button>
      </div>
    </div>
  )
}

// Main component
const BatchExportFlow = () => {
  const [step, setStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchActive, setSearchActive] = useState(false)
  const [filterTab, setFilterTab] = useState("all")
  const [activeCard, setActiveCard] = useState(null)

  // Filter logic
  const filterData = () => {
    let result = applicants

    // Search filter - only active when searchActive is true
    if (searchActive && searchQuery.trim()) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.phone.includes(searchQuery) ||
          item.tablet.includes(searchQuery)
      )
    }

    // Status filter
    if (filterTab !== "all") {
      result = result.filter((item) => item.status === filterTab)
    }

    // Active card filter
    if (activeCard) {
      result = result.filter((item) => item.status === activeCard)
    }

    return result
  }

  // Statistics
  const stats = {
    total: applicants.length,
    exported: applicants.filter((a) => a.status === "exported").length,
    pending: applicants.filter((a) => a.status === "pending").length,
    problematic: applicants.filter((a) => a.status === "problematic").length,
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
            filterTab={filterTab}
            onFilterTabChange={setFilterTab}
            filtered={filtered}
            stats={stats}
            onStepChange={setStep}
          />
        )}
        {step === 2 && <Step2View onStepChange={setStep} />}
      </div>
    </div>
  )
}

export default BatchExportFlow
