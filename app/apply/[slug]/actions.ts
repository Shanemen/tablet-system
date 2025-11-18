'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ApplicationFormData {
  ceremony_id: number
  applicant_name: string
  phone: string
  plaque_type: string
  names: string[] // Array of names for the tablets
}

/**
 * Submit application form
 */
export async function submitApplication(formData: FormData) {
  const supabase = await createClient()
  
  const ceremonyId = parseInt(formData.get('ceremony_id') as string)
  const applicantName = formData.get('applicant_name') as string
  const phone = formData.get('phone') as string
  const plaqueType = formData.get('plaque_type') as string
  const namesString = formData.get('names') as string
  
  // Parse names (comma-separated or newline-separated)
  const names = namesString
    .split(/[,\n]/)
    .map(name => name.trim())
    .filter(name => name.length > 0)
  
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
      plaque_type: plaqueType,
      status: 'pending',
    })
    .select()
    .single()
  
  if (appError) {
    return { error: `提交失敗：${appError.message}` }
  }
  
  // Create application_name entries
  const nameEntries = names.map((name, index) => ({
    application_id: application.id,
    display_name: name,
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
    applicationId: application.id 
  }
}

