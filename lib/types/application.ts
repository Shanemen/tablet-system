// Application and tablet types for the admin dashboard

export interface TabletName {
  display_name: string
  image_url: string | null // Permanent URL from Supabase Storage
  tablet_type: string
}

export interface Applicant {
  id: number
  name: string
  phone: string
  email?: string
  tablet: string
  tabletNames: string[]
  tabletDetails: TabletName[] // Full details including image_url for each tablet
  total: number
  status: "exported" | "pending" | "problematic"
  notes?: string // Problem notes when marked as problematic
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
  exported: { label: "已下載", color: "text-slate-700 bg-muted" },
  pending: { label: "待處理", color: "text-primary bg-primary/10" },
  problematic: { label: "有問題", color: "text-[#770002] bg-[#770002]/10" },
} as const

