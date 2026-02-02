/**
 * Application Actions - Server-side data operations
 * 
 * Updated to support:
 * - Multiple tablet types in one application
 * - Shopping cart model with localStorage
 * - Renamed plaque -> tablet
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getApplicantInfo, getCartTablets } from '@/lib/utils/application-storage'

export interface ApplicationFormData {
  ceremony_id: number
  applicant_name: string
  phone: string
  tablet_type: string
  names: string[] // Array of names for the tablets
}

/**
 * Submit application with multiple tablet types
 * Receives applicant info and tablets from client (already read from localStorage)
 */
export async function submitMultiTypeApplication(
  ceremonyId: number,
  slug: string,
  applicantInfo: { name: string; phone: string; email?: string } | null,
  tablets: any[]
): Promise<{ success?: string; applicationId?: number; error?: string }> {
  const supabase = await createClient()

  // Validation
  if (!applicantInfo || !applicantInfo.name || !applicantInfo.phone || !applicantInfo.email) {
    return { error: '請填寫完整的申請人信息（姓名、電話、電郵）' }
  }

  if (tablets.length === 0) {
    return { error: '請至少添加一個牌位' }
  }

  // Create application (without tablet_type as it's now in application_name)
  // We'll use the first tablet's type as the "primary" type for backward compatibility
  const primaryTabletType = tablets[0].tabletType

  const { data: application, error: appError } = await supabase
    .from('application')
    .insert({
      ceremony_id: ceremonyId,
      applicant_name: applicantInfo.name,
      phone: applicantInfo.phone,
      email: applicantInfo.email || null,
      tablet_type: primaryTabletType, // Primary type for compatibility
      status: 'pending',
    })
    .select()
    .single()

  if (appError || !application) {
    console.error('Application insert error:', appError)
    return { error: `提交失敗：${appError?.message || '未知錯誤'}` }
  }

  // Create application_name entries with tablet_type and image_url
  const nameEntries = tablets.map((tablet, index) => {
    // Get display text from tablet (already includes converted text)
    const displayName = tablet.displayText || Object.values(tablet.formData)[0] || ''

    return {
      application_id: application.id,
      display_name: displayName,
      tablet_type: tablet.tabletType,
      image_url: tablet.previewUrl, // Save the permanent Supabase Storage URL
      image_generation_status: 'generated',
      order_index: index + 1,
      is_main: index === 0, // First entry is main
    }
  })

  const { error: namesError } = await supabase
    .from('application_name')
    .insert(nameEntries)

  if (namesError) {
    console.error('Application names insert error:', namesError)
    // Rollback application if names fail
    await supabase.from('application').delete().eq('id', application.id)
    return { error: `提交失敗：${namesError.message}` }
  }

  revalidatePath(`/apply/${slug}`)
  return {
    success: '申請已成功提交！',
    applicationId: application.id,
  }
}

/**
 * Legacy function - kept for backward compatibility
 * Submit application form (single tablet type)
 */
export async function submitApplication(formData: FormData) {
  const supabase = await createClient()
  
  const ceremonyId = parseInt(formData.get('ceremony_id') as string)
  const applicantName = formData.get('applicant_name') as string
  const phone = formData.get('phone') as string
  const tabletType = formData.get('tablet_type') as string
  const namesString = formData.get('names') as string
  
  // Parse names (comma-separated or newline-separated)
  const names = namesString
    .split(/[,\n]/)
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
  
  if (names.length === 0) {
    return { error: '請至少輸入一個牌位名字' }
  }
  
  // Validate name length
  for (const name of names) {
    if (name.length > 8) {
      return { error: `名字「${name}」超過8個字限制` }
    }
  }
  
  // Create application
  const { data: application, error: appError } = await supabase
    .from('application')
    .insert({
      ceremony_id: ceremonyId,
      applicant_name: applicantName,
      phone: phone,
      tablet_type: tabletType,
      status: 'pending',
    })
    .select()
    .single()
  
  if (appError) {
    return { error: `提交失敗：${appError.message}` }
  }
  
  // Create application_name entries with tablet_type
  const nameEntries = names.map((name, index) => ({
    application_id: application.id,
    display_name: name,
    tablet_type: tabletType, // Add tablet_type to each name entry
    order_index: index + 1,
    is_main: index === 0, // First name is main
  }))
  
  const { error: namesError } = await supabase
    .from('application_name')
    .insert(nameEntries)
  
  if (namesError) {
    // Rollback application if names fail
    await supabase.from('application').delete().eq('id', application.id)
    return { error: `提交失敗：${namesError.message}` }
  }
  
  revalidatePath(`/apply/${formData.get('slug')}`)
  return { 
    success: '申請已成功提交！', 
    applicationId: application.id,
  }
}
