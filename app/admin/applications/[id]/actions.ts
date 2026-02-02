'use server'

import { Applicant } from '@/lib/types/application'
import { createClient } from '@/lib/supabase/server'

/**
 * Fetch a single application by ID
 */
export async function getApplicationById(id: number): Promise<Applicant | null> {
  const supabase = await createClient()
  
  const { data: app, error } = await supabase
    .from('application')
    .select(`
      id,
      applicant_name,
      phone,
      email,
      tablet_type,
      status,
      notes,
      application_name (
        display_name,
        image_url,
        tablet_type
      )
    `)
    .eq('id', id)
    .single()
  
  if (error || !app) {
    console.error('Error fetching application:', error)
    return null
  }
  
  const names = app.application_name || []
  const tabletNames = names.map((n: any) => n.display_name)
  const tabletDetails = names.map((n: any) => ({
    display_name: n.display_name,
    image_url: n.image_url,
    tablet_type: n.tablet_type || app.tablet_type
  }))
  
  // Map tablet_type to Chinese display
  const tabletTypeMap: Record<string, string> = {
    'longevity': '長生祿位',
    'long-living': '長生祿位',
    'deceased': '往生蓮位',
    'ancestors': '歷代祖先',
    'karmic_creditors': '冤親債主',
    'karmic-creditors': '冤親債主',
    'aborted_spirits': '墮胎嬰靈',
    'aborted-spirits': '墮胎嬰靈',
    'land_deity': '地基主',
    'land-deity': '地基主'
  }
  
  // Map status to frontend format
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
    email: app.email || undefined,
    tablet: `${tabletTypeMap[app.tablet_type] || app.tablet_type}(${tabletNames.length})`,
    tabletNames,
    tabletDetails,
    total: tabletNames.length,
    status: statusMap[app.status] || 'pending',
    notes: app.notes || undefined
  }
}

/**
 * Mark application as problematic with a note
 */
export async function markAsProblematic(id: number, note: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('application')
    .update({ 
      status: 'problem',
      notes: note 
    })
    .eq('id', id)
  
  if (error) {
    console.error('Error marking as problematic:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

/**
 * Mark application as exported/downloaded
 */
export async function markAsExported(id: number): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('application')
    .update({ status: 'generated' })
    .eq('id', id)
  
  if (error) {
    console.error('Error marking as exported:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

