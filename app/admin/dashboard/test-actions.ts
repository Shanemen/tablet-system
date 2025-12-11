"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Reset applications back to pending status (for testing purposes)
 * 
 * @param applicationIds - Array of application IDs to reset
 * @returns Success status and count
 */
export async function resetApplicationsToPending(applicationIds: number[]) {
  const supabase = await createClient()
  
  console.log(`[Test] Resetting ${applicationIds.length} applications to pending`)
  
  const { error } = await supabase
    .from('application')
    .update({ status: 'pending' })
    .in('id', applicationIds)
  
  if (error) {
    console.error('[Test] Failed to reset applications:', error)
    throw new Error(`Failed to reset applications: ${error.message}`)
  }
  
  console.log(`[Test] Successfully reset ${applicationIds.length} applications`)
  
  return { success: true, count: applicationIds.length }
}

/**
 * Reset ALL exported applications to pending (bulk reset for testing)
 */
export async function resetAllExportedToPending() {
  const supabase = await createClient()
  
  console.log('[Test] Resetting ALL exported applications to pending')
  
  const { error } = await supabase
    .from('application')
    .update({ status: 'pending' })
    .eq('status', 'generated')
  
  if (error) {
    console.error('[Test] Failed to reset applications:', error)
    throw new Error(`Failed to reset applications: ${error.message}`)
  }
  
  console.log('[Test] Successfully reset all exported applications')
  
  return { success: true }
}
