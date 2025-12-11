"use server"

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { createClient } from "@/lib/supabase/server"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TabletDetail {
  display_name: string
  image_url: string | null
  tablet_type: string
  application_id: number
}

interface GroupedTablets {
  [key: string]: TabletDetail[]
}

interface PDFResult {
  type: string
  typeName: string
  pdfBase64: string
  count: number
  pageCount: number
}

// ============================================================================
// CONSTANTS - Print-ready A4 LANDSCAPE with bleed
// ============================================================================

// A4 LANDSCAPE with 3mm bleed on all sides
const MM_TO_POINTS = 2.83465 // 1mm = 2.83465 points at 72 DPI
const PAGE_WIDTH = 303 * MM_TO_POINTS  // 303mm LANDSCAPE (297mm + 3mm bleed on each side)
const PAGE_HEIGHT = 216 * MM_TO_POINTS // 216mm LANDSCAPE (210mm + 3mm bleed on each side)

// Trim/crop marks (3mm bleed)
const BLEED_SIZE = 3 * MM_TO_POINTS

// Safe margins
const MARGIN_LEFT = 8 * MM_TO_POINTS   // Left margin
const MARGIN_RIGHT = 8 * MM_TO_POINTS  // Right margin
const MARGIN_TOP = 10 * MM_TO_POINTS   // Top margin
const MARGIN_BOTTOM = 15 * MM_TO_POINTS // Bottom margin (for page numbers)

// Tablet sizing (single row horizontal, 5 per page)
const TABLETS_PER_PAGE = 5
const TABLET_WIDTH = 50 * MM_TO_POINTS  // 50mm wide (each tablet)
const TABLET_HEIGHT = 133 * MM_TO_POINTS // 133mm tall (to fit in landscape height)

// Calculate horizontal spacing between tablets
const AVAILABLE_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
const HORIZONTAL_SPACING = (AVAILABLE_WIDTH - (TABLETS_PER_PAGE * TABLET_WIDTH)) / (TABLETS_PER_PAGE - 1)

// Tablet type name mapping
const TABLET_TYPE_NAMES: Record<string, string> = {
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch image from URL and return as ArrayBuffer
 */
async function fetchImageAsBuffer(url: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }
    return await response.arrayBuffer()
  } catch (error) {
    console.error(`Error fetching image from ${url}:`, error)
    throw error
  }
}

/**
 * Group tablets by type
 */
function groupTabletsByType(tablets: TabletDetail[]): GroupedTablets {
  const grouped: GroupedTablets = {}
  
  for (const tablet of tablets) {
    const type = tablet.tablet_type
    if (!grouped[type]) {
      grouped[type] = []
    }
    grouped[type].push(tablet)
  }
  
  return grouped
}

/**
 * Add page number to the bottom right of a page
 * Format: "1/10", "5/30"
 */
async function addPageNumber(
  page: any,
  pageNum: number,
  totalPages: number,
  font: any
) {
  const text = `${pageNum}/${totalPages}`
  const fontSize = 10
  const textWidth = font.widthOfTextAtSize(text, fontSize)
  
  // Position: bottom right, with margin
  const x = PAGE_WIDTH - BLEED_SIZE - 10 - textWidth
  const y = BLEED_SIZE + 10
  
  page.drawText(text, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(0.5, 0.5, 0.5), // Gray
  })
}

/**
 * Create PDF for a specific tablet type
 */
async function createPDFForType(
  type: string,
  tablets: TabletDetail[]
): Promise<PDFResult> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  
  // Calculate total pages needed
  const totalPages = Math.ceil(tablets.length / TABLETS_PER_PAGE)
  
  // Process tablets in batches of TABLETS_PER_PAGE
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    const startIdx = pageIndex * TABLETS_PER_PAGE
    const endIdx = Math.min(startIdx + TABLETS_PER_PAGE, tablets.length)
    const pageTablets = tablets.slice(startIdx, endIdx)
    
    // Add each tablet to the page (single row, horizontal)
    for (let i = 0; i < pageTablets.length; i++) {
      const tablet = pageTablets[i]
      
      // Skip if no image URL
      if (!tablet.image_url) {
        console.warn(`Tablet "${tablet.display_name}" has no image_url, skipping`)
        continue
      }
      
      try {
        // Fetch and embed image
        const imageBuffer = await fetchImageAsBuffer(tablet.image_url)
        
        // Detect image type (PNG or JPG)
        let image
        if (tablet.image_url.toLowerCase().includes('.png')) {
          image = await pdfDoc.embedPng(imageBuffer)
        } else {
          image = await pdfDoc.embedJpg(imageBuffer)
        }
        
        // Calculate position (single row, horizontal layout)
        const x = MARGIN_LEFT + (i * (TABLET_WIDTH + HORIZONTAL_SPACING))
        const y = (PAGE_HEIGHT - TABLET_HEIGHT) / 2  // Vertically centered
        
        // Draw image
        page.drawImage(image, {
          x,
          y,
          width: TABLET_WIDTH,
          height: TABLET_HEIGHT,
        })
      } catch (error) {
        console.error(`Error embedding image for tablet "${tablet.display_name}":`, error)
        // Continue with other tablets
      }
    }
    
    // Add page number
    await addPageNumber(page, pageIndex + 1, totalPages, font)
  }
  
  // Save PDF as base64
  const pdfBytes = await pdfDoc.save()
  const pdfBase64 = Buffer.from(pdfBytes).toString('base64')
  
  return {
    type,
    typeName: TABLET_TYPE_NAMES[type] || type,
    pdfBase64,
    count: tablets.length,
    pageCount: totalPages
  }
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Export tablets to PDF, grouped by type
 * 
 * @param applicationIds - Array of application IDs to export
 * @returns Array of PDF results (one per tablet type)
 */
export async function exportTabletsToPDF(
  applicationIds: number[]
): Promise<PDFResult[]> {
  const supabase = await createClient()
  
  console.log(`[Export] Starting export for ${applicationIds.length} applications`)
  
  // Fetch all tablets for the selected applications
  const { data: tablets, error } = await supabase
    .from('application_name')
    .select('display_name, image_url, tablet_type, application_id')
    .in('application_id', applicationIds)
  
  if (error) {
    console.error('[Export] Error fetching tablets:', error)
    throw new Error(`Failed to fetch tablets: ${error.message}`)
  }
  
  if (!tablets || tablets.length === 0) {
    throw new Error('No tablets found for the selected applications')
  }
  
  console.log(`[Export] Found ${tablets.length} tablets`)
  
  // Group tablets by type
  const groupedTablets = groupTabletsByType(tablets as TabletDetail[])
  console.log(`[Export] Grouped into ${Object.keys(groupedTablets).length} types`)
  
  // Create PDF for each type
  const results: PDFResult[] = []
  
  for (const [type, typeTablets] of Object.entries(groupedTablets)) {
    console.log(`[Export] Creating PDF for ${type} (${typeTablets.length} tablets)`)
    
    try {
      const result = await createPDFForType(type, typeTablets)
      results.push(result)
      console.log(`[Export] ✓ Created PDF for ${type}: ${result.pageCount} pages`)
    } catch (error) {
      console.error(`[Export] ✗ Failed to create PDF for ${type}:`, error)
      // Continue with other types
    }
  }
  
  console.log(`[Export] Export complete: ${results.length} PDFs generated`)
  
  return results
}
