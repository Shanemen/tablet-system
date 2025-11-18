'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Ceremony {
  id: number
  name_zh: string
  name_en: string | null
  slug: string
  start_at: string
  location: string | null
  deadline_at: string
  status: string
}

export async function getCurrentCeremony(): Promise<Ceremony | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ceremony')
    .select('*')
    .eq('status', 'active')
    .order('start_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) {
    console.error('Error fetching ceremony:', error)
    return null
  }
  
  return data
}

export async function updateCeremony(ceremonyId: number, formData: FormData) {
  const supabase = await createClient()
  
  const updates = {
    name_zh: formData.get('name_zh') as string,
    name_en: formData.get('name_en') as string || null,
    location: formData.get('location') as string || null,
    start_at: formData.get('start_at') as string,
    deadline_at: formData.get('deadline_at') as string,
  }
  
  const { error } = await supabase
    .from('ceremony')
    .update(updates)
    .eq('id', ceremonyId)
  
  if (error) {
    return { error: `更新失败：${error.message}` }
  }
  
  revalidatePath('/admin/ceremonies')
  return { success: '法会信息已成功更新！' }
}

