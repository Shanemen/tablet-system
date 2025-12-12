"use client"

import { Stats, ApplicationStatus } from "@/lib/types/application"

interface StatCardProps {
  label: string
  value: number
  status: ApplicationStatus | null
  activeCard: ApplicationStatus | null
  onCardClick: (status: ApplicationStatus | null) => void
  highlight: boolean
}

const StatCard = ({ label, value, status, activeCard, onCardClick, highlight }: StatCardProps) => {
  const isActive = activeCard === status

  return (
    <button
      onClick={() => onCardClick(status)}
      className={`w-full rounded-lg p-4 sm:p-6 text-left transition-colors border-2 ${
        isActive 
          ? "bg-primary text-white shadow-lg border-primary" 
          : highlight 
            ? "stat-card-pulse border-primary/40 shadow-lg" 
            : "bg-white border-border/50 hover:shadow-md hover:border-primary/30"
      }`}
    >
      <div className={`text-3xl sm:text-4xl font-bold ${highlight ? "stat-number-animate" : ""} ${isActive ? "text-white" : "text-primary/70"}`}>
        {value}
      </div>
      <div className={`mt-2 text-sm sm:text-base font-semibold ${isActive ? "text-white" : "text-foreground"}`}>
        {label}
      </div>
    </button>
  )
}

interface ApplicationStatsProps {
  stats: Stats
  activeCard: ApplicationStatus | null
  onCardClick: (status: ApplicationStatus | null) => void
  highlightExported?: boolean
  highlightPending?: boolean
}

export function ApplicationStats({ 
  stats, 
  activeCard, 
  onCardClick,
  highlightExported = false,
  highlightPending = false
}: ApplicationStatsProps) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">統計總覽</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
        <StatCard
          label="已下載圖片"
          value={stats.exported}
          status="exported"
          activeCard={activeCard}
          onCardClick={onCardClick}
          highlight={highlightExported}
        />
        <StatCard 
          label="全部申請" 
          value={stats.total} 
          status={null} 
          activeCard={activeCard} 
          onCardClick={onCardClick}
          highlight={false}
        />
      </div>
    </div>
  )
}

