'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Ceremony {
  id: number
  name_zh: string
  slug: string
  start_at: string
  end_at: string | null
  location: string | null
  deadline_at: string
  status: string
}

/**
 * Get current ceremony - prioritizes active, then draft
 */
export async function getCurrentCeremony(): Promise<Ceremony | null> {
  const supabase = await createClient()
  
  // First try to get active ceremony
  const { data: activeData } = await supabase
    .from('ceremony')
    .select('*')
    .eq('status', 'active')
    .order('start_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (activeData) {
    return activeData
  }
  
  // If no active, try to get draft ceremony
  const { data: draftData } = await supabase
    .from('ceremony')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (draftData) {
    return draftData
  }
  
  // No ceremony found
  return null
}

/**
 * Create a new ceremony in draft status
 */
export async function createCeremony(formData: FormData) {
  const supabase = await createClient()
  
  const nameZh = formData.get('name_zh') as string
  const startAt = formData.get('start_at') as string
  
  // Generate slug even for draft (required by DB)
  let slug = generateSlug(nameZh, startAt)
  
  // Ensure uniqueness
  const { data: existing } = await supabase
    .from('ceremony')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  
  if (existing) {
    // Add timestamp suffix if slug exists
    slug = `${slug}-${Date.now().toString().slice(-6)}`
  }
  
  const ceremonyData = {
    name_zh: nameZh,
    location: formData.get('location') as string || null,
    start_at: startAt,
    end_at: formData.get('end_at') as string || startAt,
    deadline_at: formData.get('deadline_at') as string,
    status: 'draft' as const,
    slug: slug,
    temple_id: 1, // Default temple_id
  }
  
  const { data, error } = await supabase
    .from('ceremony')
    .insert(ceremonyData)
    .select()
    .single()
  
  if (error) {
    return { error: `創建失敗：${error.message}` }
  }
  
  revalidatePath('/admin/ceremonies')
  return { success: '法會已創建！', ceremony: data }
}

/**
 * Generate slug from ceremony name and date
 */
function generateSlug(nameZh: string, startAt: string): string {
  // Extract date part (YYYY-MM-DD)
  const dateStr = startAt.split('T')[0].replace(/-/g, '')
  
  // Convert Chinese name to slug-friendly format
  // Simple approach: use date + simplified name
  const nameSlug = nameZh
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
    .toLowerCase()
    .substring(0, 30)
  
  return `${dateStr}-${nameSlug}`.toLowerCase()
}

/**
 * Activate ceremony: generate slug and set status to active
 */
export async function activateCeremony(ceremonyId: number) {
  const supabase = await createClient()
  
  // First get the ceremony to generate slug
  const { data: ceremony, error: fetchError } = await supabase
    .from('ceremony')
    .select('name_zh, start_at, slug')
    .eq('id', ceremonyId)
    .single()
  
  if (fetchError || !ceremony) {
    return { error: `找不到法會：${fetchError?.message}` }
  }
  
  // Generate slug if not exists
  let slug = ceremony.slug
  if (!slug) {
    slug = generateSlug(ceremony.name_zh, ceremony.start_at)
    
    // Ensure uniqueness by checking if slug exists
    const { data: existing } = await supabase
      .from('ceremony')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    
    if (existing) {
      // Add timestamp suffix if slug exists
      slug = `${slug}-${Date.now().toString().slice(-6)}`
    }
  }
  
  // Update ceremony to active status
  const { data, error } = await supabase
    .from('ceremony')
    .update({
      status: 'active',
      slug: slug,
    })
    .eq('id', ceremonyId)
    .select()
    .single()
  
  if (error) {
    return { error: `激活失敗：${error.message}` }
  }
  
  revalidatePath('/admin/ceremonies')
  return { success: '申請表連結已生成！', ceremony: data }
}

export async function updateCeremony(ceremonyId: number, formData: FormData) {
  const supabase = await createClient()
  
  const updates = {
    name_zh: formData.get('name_zh') as string,
    location: formData.get('location') as string || null,
    start_at: formData.get('start_at') as string,
    end_at: formData.get('end_at') as string || formData.get('start_at') as string,
    deadline_at: formData.get('deadline_at') as string,
  }
  
  const { error } = await supabase
    .from('ceremony')
    .update(updates)
    .eq('id', ceremonyId)
  
  if (error) {
    return { error: `更新失敗：${error.message}` }
  }
  
  revalidatePath('/admin/ceremonies')
  return { success: '法會信息已成功更新！' }
}

/**
 * Get ceremony by slug (for public application form)
 */
export async function getCeremonyBySlug(slug: string): Promise<Ceremony | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ceremony')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()
  
  if (error) {
    console.error('Error fetching ceremony by slug:', error)
    return null
  }
  
  return data
}

/**
 * Clear all ceremonies and applications (FOR TESTING ONLY)
 */
export async function clearAllCeremonies() {
  const supabase = await createClient()
  
  // Delete in correct order (respecting foreign keys)
  // Use .gte('id', 0) to delete all rows (id is always >= 0)
  const { error: namesError } = await supabase
    .from('application_name')
    .delete()
    .gte('id', 0)
  
  if (namesError) {
    console.error('Error deleting application_name:', namesError)
    return { error: `刪除失敗：${namesError.message}` }
  }
  
  const { error: appsError } = await supabase
    .from('application')
    .delete()
    .gte('id', 0)
  
  if (appsError) {
    console.error('Error deleting application:', appsError)
    return { error: `刪除失敗：${appsError.message}` }
  }
  
  const { error: ceremonyError } = await supabase
    .from('ceremony')
    .delete()
    .gte('id', 0)
  
  if (ceremonyError) {
    console.error('Error deleting ceremony:', ceremonyError)
    return { error: `刪除失敗：${ceremonyError.message}` }
  }
  
  revalidatePath('/admin/ceremonies')
  return { success: '所有法會數據已清空！' }
}

