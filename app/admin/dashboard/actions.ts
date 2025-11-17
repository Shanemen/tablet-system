"use server"

import { Applicant, Stats } from "@/lib/types/application"
import { createClient } from "@/lib/supabase/server"

// Configuration: Set to 'supabase' to use real database, 'mock' for demo data
const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE || 'mock'

// ============================================================================
// SUPABASE DATA FETCHERS
// ============================================================================

async function getApplicationsFromSupabase(): Promise<Applicant[]> {
  const supabase = await createClient()
  
  // Fetch applications with their names, joined from application_name table
  const { data: applications, error } = await supabase
    .from('application')
    .select(`
      id,
      applicant_name,
      phone,
      plaque_type,
      status,
      application_name (
        display_name
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching applications:', error)
    throw new Error('Failed to fetch applications from database')
  }
  
  if (!applications) {
    return []
  }
  
  // Transform Supabase data to Applicant interface
  const applicants: Applicant[] = applications.map((app: any) => {
    const names = app.application_name || []
    const tabletNames = names.map((n: any) => n.display_name)
    
    // Map plaque_type to Chinese display
    const plaqueTypeMap: Record<string, string> = {
      'longevity': '長生祿位',
      'deceased': '往生蓮位',
      'ancestors': '歷代祖先',
      'karmic_creditors': '冤親債主',
      'aborted_spirits': '墮胎嬰靈',
      'land_deity': '地基主'
    }
    
    // Map status to our frontend format
    const statusMap: Record<string, "exported" | "pending" | "problematic"> = {
      'generated': 'exported',
      'pending': 'pending',
      'reviewed': 'pending',
      'problem': 'problematic'
    }
    
    return {
      id: app.id,
      name: app.applicant_name,
      phone: app.phone,
      tablet: `${plaqueTypeMap[app.plaque_type] || app.plaque_type}(${tabletNames.length})`,
      tabletNames,
      total: tabletNames.length,
      status: statusMap[app.status] || 'pending'
    }
  })
  
  return applicants
}

// ============================================================================
// MOCK DATA GENERATOR (for development/demo)
// ============================================================================

async function getApplicationsFromMock(): Promise<Applicant[]> {
  const surnames = ["王", "李", "張", "劉", "陳", "楊", "黃", "趙", "吳", "周", "徐", "孫", "馬", "朱", "胡", "郭", "林", "何", "高", "梁"]
  const givenNames = ["小明", "美玲", "建國", "怡君", "家豪", "佳琪", "志強", "淑芬", "文華", "雅婷", "俊傑", "麗華", "偉明", "秀英", "明哲", "慧珍", "國強", "淑惠", "宗翰", "雅芳"]
  const tabletTypes = [
    { type: "長生", fullName: "長生祿位", count: [1, 2, 3, 4] },
    { type: "往生", fullName: "往生蓮位", count: [1, 2, 3, 5, 8] },
    { type: "祖先", fullName: "歷代祖先", count: [1, 2] },
    { type: "冤親", fullName: "冤親債主", count: [1, 2, 3] },
    { type: "嬰靈", fullName: "墮胎嬰靈", count: [1, 2] },
    { type: "地基主", fullName: "地基主", count: [1] }
  ]
  
  const applicants: Applicant[] = []
  
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
    
    // 80%的申请人有全部6种牌位，20%有部分类型
    const hasAllTypes = seededRandom(i * 23) < 0.8
    
    const selectedTypes: string[] = []
    const tabletNames: string[] = []
    let total = 0
    
    // 遍历所有类型，保持固定顺序
    for (let j = 0; j < tabletTypes.length; j++) {
      const tabletType = tabletTypes[j]
      
      // 如果不是全部类型，随机决定是否包含这个类型
      const includeThisType = hasAllTypes || seededRandom(i * 29 + j * 31) > 0.3
      
      if (includeThisType) {
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
    }
    
    // 状态分布：已导出=25, 待处理=168, 有问题=7 (总共200)
    let status: "exported" | "pending" | "problematic"
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
      tablet: selectedTypes.join("  "),
      tabletNames,
      total,
      status
    })
  }
  
  return applicants
}

// ============================================================================
// PUBLIC API - Main data fetchers
// ============================================================================

/**
 * Fetch all applications (uses configured DATA_SOURCE)
 */
export async function getApplications(): Promise<Applicant[]> {
  if (DATA_SOURCE === 'supabase') {
    return getApplicationsFromSupabase()
  } else {
    return getApplicationsFromMock()
  }
}

/**
 * Calculate statistics from applications
 */
export async function getStats(): Promise<Stats> {
  const applications = await getApplications()
  
  return {
    total: applications.length,
    exported: applications.filter((a) => a.status === "exported").length,
    pending: applications.filter((a) => a.status === "pending").length,
    problematic: applications.filter((a) => a.status === "problematic").length,
  }
}

