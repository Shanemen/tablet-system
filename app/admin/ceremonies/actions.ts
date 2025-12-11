'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { unstable_noStore as noStore } from 'next/cache'

export interface Ceremony {
  id: number
  name_zh: string
  presiding_monk: string | null
  slug: string
  start_at: string
  end_at: string | null
  location: string | null
  deadline_at: string
  status: string
  show_donation: boolean
  donation_url: string | null
}

/**
 * Get current ceremony - prioritizes active, then draft
 */
export async function getCurrentCeremony(): Promise<Ceremony | null> {
  noStore() // Disable caching to always get fresh data
  const supabase = await createClient()
  
  // First try to get active ceremony
  const { data: activeData } = await supabase
    .from('ceremony')
    .select('*')
    .eq('status', 'active')
    .order('start_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  console.log('[getCurrentCeremony] Active ceremony:', activeData?.id, activeData?.name_zh)
  
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
  
  console.log('[getCurrentCeremony] Draft ceremony:', draftData?.id, draftData?.name_zh)
  
  if (draftData) {
    return draftData
  }
  
  // No ceremony found
  console.log('[getCurrentCeremony] No ceremony found')
  return null
}

/**
 * Create a new ceremony in active status (with link and QR code)
 */
export async function createCeremony(formData: FormData) {
  const supabase = await createClient()
  
  const nameZh = formData.get('name_zh') as string
  const startAt = formData.get('start_at') as string
  
  // Generate slug for the application form link
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
    presiding_monk: formData.get('presiding_monk') as string || null,
    location: formData.get('location') as string || null,
    start_at: startAt,
    end_at: formData.get('end_at') as string || startAt,
    deadline_at: formData.get('deadline_at') as string,
    show_donation: formData.get('show_donation') === 'true',
    donation_url: formData.get('donation_url') as string || null,
    status: 'active' as const, // Directly create as active
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
  return { success: '申請表格已創建！鏈接和二維碼已生成。', ceremony: data }
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
    .trim() // Remove leading/trailing spaces first
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
    .replace(/-+$/, '') // Remove trailing dashes
    .replace(/^-+/, '') // Remove leading dashes
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
    presiding_monk: formData.get('presiding_monk') as string || null,
    location: formData.get('location') as string || null,
    start_at: formData.get('start_at') as string,
    end_at: formData.get('end_at') as string || formData.get('start_at') as string,
    deadline_at: formData.get('deadline_at') as string,
    show_donation: formData.get('show_donation') === 'true',
    donation_url: formData.get('donation_url') as string || null,
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
  noStore() // Disable caching
  const supabase = await createClient()
  
  // Decode URL-encoded slug (e.g., %E4%BD%9B -> 佛)
  const decodedSlug = decodeURIComponent(slug)
  console.log('[getCeremonyBySlug] Looking for slug:', decodedSlug)
  
  const { data, error } = await supabase
    .from('ceremony')
    .select('*')
    .eq('slug', decodedSlug)
    .eq('status', 'active')
    .single()
  
  console.log('[getCeremonyBySlug] Result - data:', data?.id, data?.name_zh, 'error:', error?.message)
  
  if (error) {
    console.error('Error fetching ceremony by slug:', error)
    return null
  }
  
  return data
}

/**
 * Delete a specific ceremony and all its applications (with password verification)
 */
export async function verifyPasswordAndDelete(ceremonyId: number, password: string) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: '請先登錄' }
  }
  
  // Verify password by attempting to sign in
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: password,
  })
  
  if (authError) {
    return { error: '密碼錯誤，請重試' }
  }
  
  // Password verified, proceed with deletion
  // Delete in correct order (respecting foreign keys)
  // First, get all applications for this ceremony
  const { data: applications } = await supabase
    .from('application')
    .select('id')
    .eq('ceremony_id', ceremonyId)
  
  if (applications && applications.length > 0) {
    const applicationIds = applications.map(app => app.id)
    
    // Delete application names
    const { error: namesError } = await supabase
      .from('application_name')
      .delete()
      .in('application_id', applicationIds)
    
    if (namesError) {
      return { error: `刪除失敗：${namesError.message}` }
    }
    
    // Delete applications
    const { error: appsError } = await supabase
      .from('application')
      .delete()
      .eq('ceremony_id', ceremonyId)
    
    if (appsError) {
      return { error: `刪除失敗：${appsError.message}` }
    }
  }
  
  // Delete ceremony
  console.log('[DELETE] Attempting to delete ceremony:', ceremonyId)
  const { data: deleteData, error: ceremonyError } = await supabase
    .from('ceremony')
    .delete()
    .eq('id', ceremonyId)
    .select()
  
  console.log('[DELETE] Result - data:', deleteData, 'error:', ceremonyError)
  
  if (ceremonyError) {
    console.error('[DELETE] Failed:', ceremonyError)
    return { error: `刪除失敗：${ceremonyError.message}` }
  }
  
  if (!deleteData || deleteData.length === 0) {
    console.error('[DELETE] No rows deleted - ceremony may not exist or RLS blocked')
    return { error: '刪除失敗：找不到該法會或權限不足' }
  }
  
  console.log('[DELETE] Success! Ceremony deleted.')
  revalidatePath('/admin/ceremonies')
  return { success: '表格已成功刪除！' }
}

/**
 * Delete a specific ceremony and all its applications (legacy function - kept for backwards compatibility)
 */
export async function deleteCeremony(ceremonyId: number) {
  const supabase = await createClient()
  
  // Delete in correct order (respecting foreign keys)
  // First, get all applications for this ceremony
  const { data: applications } = await supabase
    .from('application')
    .select('id')
    .eq('ceremony_id', ceremonyId)
  
  if (applications && applications.length > 0) {
    const applicationIds = applications.map(app => app.id)
    
    // Delete application names
    const { error: namesError } = await supabase
      .from('application_name')
      .delete()
      .in('application_id', applicationIds)
    
    if (namesError) {
      return { error: `刪除失敗：${namesError.message}` }
    }
    
    // Delete applications
    const { error: appsError } = await supabase
      .from('application')
      .delete()
      .eq('ceremony_id', ceremonyId)
    
    if (appsError) {
      return { error: `刪除失敗：${appsError.message}` }
    }
  }
  
  // Delete ceremony
  const { error: ceremonyError } = await supabase
    .from('ceremony')
    .delete()
    .eq('id', ceremonyId)
  
  if (ceremonyError) {
    return { error: `刪除失敗：${ceremonyError.message}` }
  }
  
  revalidatePath('/admin/ceremonies')
  return { success: '表格已成功刪除！' }
}

