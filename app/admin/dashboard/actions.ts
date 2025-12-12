"use server"

import { Applicant, Stats } from "@/lib/types/application"
import { createClient } from "@/lib/supabase/server"

// ============================================================================
// SUPABASE DATA FETCHER
// ============================================================================

async function getApplicationsFromSupabase(): Promise<Applicant[]> {
  const supabase = await createClient()
  
  // Fetch applications with their names, joined from application_name table
  // Include image_url to use saved images instead of regenerating
  // Note: plaque_type was renamed to tablet_type in migration 20241201
  const { data: applications, error } = await supabase
    .from('application')
    .select(`
      id,
      applicant_name,
      phone,
      tablet_type,
      status,
      application_name (
        display_name,
        image_url,
        tablet_type
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching applications:', error)
    throw new Error(`Failed to fetch applications: ${error.message}`)
  }
  
  if (!applications) {
    return []
  }
  
  // Transform Supabase data to Applicant interface
  const applicants: Applicant[] = applications.map((app: any) => {
    const names = app.application_name || []
    const tabletNames = names.map((n: any) => n.display_name)
    // Include full tablet details with image_url for PDF export
    const tabletDetails = names.map((n: any) => ({
      display_name: n.display_name,
      image_url: n.image_url, // Use saved image URL from Supabase Storage
      tablet_type: n.tablet_type || app.tablet_type
    }))
    
    // Map tablet_type to abbreviated Chinese display (for table column)
    const tabletTypeMap: Record<string, string> = {
      'longevity': '長生',
      'long-living': '長生',
      'deceased': '往生',
      'ancestors': '祖先',
      'karmic_creditors': '冤親',
      'karmic-creditors': '冤親',
      'aborted_spirits': '嬰靈',
      'aborted-spirits': '嬰靈',
      'land_deity': '地基主',
      'land-deity': '地基主'
    }
    
    // Map status to our frontend format
    const statusMap: Record<string, "exported" | "pending" | "problematic"> = {
      'generated': 'exported',
      'pending': 'pending',
      'reviewed': 'pending',
      'problem': 'problematic'
    }
    
    // Count tablets by type for display
    const typeCounts: Record<string, number> = {}
    for (const detail of tabletDetails) {
      const typeName = tabletTypeMap[detail.tablet_type] || detail.tablet_type
      typeCounts[typeName] = (typeCounts[typeName] || 0) + 1
    }
    
    // Generate display string: "往生蓮位(3) 歷代祖先(3) 長生祿位(2)"
    const tablet = Object.entries(typeCounts)
      .map(([type, count]) => `${type}(${count})`)
      .join(' ')
    
    return {
      id: app.id,
      name: app.applicant_name,
      phone: app.phone,
      tablet: tablet || '無牌位',
      tabletNames,
      tabletDetails, // Include image URLs for PDF export
      total: tabletNames.length,
      status: statusMap[app.status] || 'pending'
    }
  })
  
  return applicants
}

// ============================================================================
// PUBLIC API - Main data fetchers
// ============================================================================

/**
 * Fetch all applications from Supabase
 */
export async function getApplications(): Promise<Applicant[]> {
  return getApplicationsFromSupabase()
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

