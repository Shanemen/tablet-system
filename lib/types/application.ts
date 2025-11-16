// Application and tablet types for the admin dashboard

export interface Applicant {
  id: number
  name: string
  phone: string
  tablet: string
  tabletNames: string[]
  total: number
  status: "exported" | "pending" | "problematic"
}

export interface Stats {
  total: number
  exported: number
  pending: number
  problematic: number
}

export interface SelectedCount {
  applications: number
  tablets: number
}

export type ApplicationStatus = "exported" | "pending" | "problematic"

// Status configuration for UI display
export const statusConfig = {
  exported: { label: "已導出", color: "text-slate-700 bg-muted" },
  pending: { label: "待處理", color: "text-primary bg-primary/10" },
  problematic: { label: "有問題", color: "text-[#770002] bg-[#770002]/10" },
} as const

