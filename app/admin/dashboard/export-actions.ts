"use server"

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { createClient } from "@/lib/supabase/server"
import { ExportPlanItem, PDFResult } from "@/lib/types/application"

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
const MARGIN_LEFT = 5 * MM_TO_POINTS   // Left margin (reduced for more space)
const MARGIN_RIGHT = 5 * MM_TO_POINTS  // Right margin (reduced for more space)
const MARGIN_TOP = 5 * MM_TO_POINTS    // Top margin (reduced for more space)
const MARGIN_BOTTOM = 10 * MM_TO_POINTS // Bottom margin (for page numbers)

// Tablet sizing (single row horizontal, 5 per page)
const TABLETS_PER_PAGE = 5

// Negative horizontal spacing to allow tablets to overlap slightly and extend into margins
const HORIZONTAL_SPACING = -4 * MM_TO_POINTS  // -4mm overlap between tablets

// Calculate tablet size based on available space with negative spacing
const AVAILABLE_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
// With negative spacing: total_width = 5 * tablet_width + 4 * (-2mm) = available_width
// 5 * tablet_width = available_width + 8mm
const TABLET_WIDTH = (AVAILABLE_WIDTH - (TABLETS_PER_PAGE - 1) * HORIZONTAL_SPACING) / TABLETS_PER_PAGE
const TABLET_HEIGHT = TABLET_WIDTH * (848 / 320)  // Maintain original 320:848 aspect ratio

// Image fetching tuning
const IMAGE_FETCH_TIMEOUT_MS = 20000 // abort a single image after 20s so one bad URL can't hang the whole export
const IMAGE_FETCH_CONCURRENCY = 12   // cap parallel downloads so large types (e.g. 800 tablets) don't overwhelm storage/memory

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

// Canonical display order so the export plan / progress UI is stable
const TYPE_DISPLAY_ORDER = [
  'longevity', 'long-living',
  'deceased',
  'ancestors',
  'karmic_creditors', 'karmic-creditors',
  'aborted_spirits', 'aborted-spirits',
  'land_deity', 'land-deity'
]

function typeRank(type: string): number {
  const idx = TYPE_DISPLAY_ORDER.indexOf(type)
  return idx === -1 ? TYPE_DISPLAY_ORDER.length : idx
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch image from URL and return as ArrayBuffer.
 * Aborts after IMAGE_FETCH_TIMEOUT_MS so a single slow/hanging URL can't stall
 * the entire export.
 */
async function fetchImageAsBuffer(url: string): Promise<ArrayBuffer> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }
    return await response.arrayBuffer()
  } finally {
    clearTimeout(timer) // clear on both success and failure to avoid leaking timers
  }
}

/**
 * Download all images in parallel with a bounded concurrency, preserving order.
 * A null entry means that tablet had no image_url or the fetch failed/timed out —
 * the caller skips it rather than failing the whole type.
 */
async function fetchImageBuffers(
  urls: (string | null)[],
  limit = IMAGE_FETCH_CONCURRENCY
): Promise<(ArrayBuffer | null)[]> {
  const results: (ArrayBuffer | null)[] = new Array(urls.length).fill(null)
  let cursor = 0

  const worker = async () => {
    while (cursor < urls.length) {
      const i = cursor++
      const url = urls[i]
      if (!url) continue
      try {
        results[i] = await fetchImageAsBuffer(url)
      } catch (error) {
        console.error(`[Export] Failed to fetch image at index ${i} (${url}):`, error)
        results[i] = null
      }
    }
  }

  const workerCount = Math.min(limit, urls.length)
  await Promise.all(Array.from({ length: workerCount }, worker))
  return results
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

  // Position: bottom right, safe from trim (at least 5mm from trim line)
  const x = PAGE_WIDTH - BLEED_SIZE - (8 * MM_TO_POINTS) - textWidth  // 8mm from trim edge
  const y = BLEED_SIZE + (5 * MM_TO_POINTS)  // 5mm above trim line (safe zone)

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
  tablets: TabletDetail[],
  ceremonyName: string
): Promise<PDFResult> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Download every image for this type up front, in parallel (bounded), preserving order.
  const imageBuffers = await fetchImageBuffers(tablets.map(t => t.image_url))

  let skippedCount = 0

  // Calculate total pages needed
  const totalPages = Math.ceil(tablets.length / TABLETS_PER_PAGE)

  // Process tablets in batches of TABLETS_PER_PAGE
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    const startIdx = pageIndex * TABLETS_PER_PAGE
    const endIdx = Math.min(startIdx + TABLETS_PER_PAGE, tablets.length)

    // Add each tablet to the page (single row, horizontal)
    for (let i = startIdx; i < endIdx; i++) {
      const tablet = tablets[i]
      const imageBuffer = imageBuffers[i]

      // Skip if image missing or its download failed/timed out
      if (!imageBuffer) {
        console.warn(`[Export] Tablet "${tablet.display_name}" has no usable image, skipping`)
        skippedCount++
        continue
      }

      try {
        // Detect image type (PNG or JPG)
        let image
        if (tablet.image_url?.toLowerCase().includes('.png')) {
          image = await pdfDoc.embedPng(imageBuffer)
        } else {
          image = await pdfDoc.embedJpg(imageBuffer)
        }

        // Calculate position (single row, horizontal layout)
        const col = i - startIdx
        const x = MARGIN_LEFT + (col * (TABLET_WIDTH + HORIZONTAL_SPACING))
        const y = (PAGE_HEIGHT - TABLET_HEIGHT) / 2  // Vertically centered

        // Draw image
        page.drawImage(image, {
          x,
          y,
          width: TABLET_WIDTH,
          height: TABLET_HEIGHT,
        })
      } catch (error) {
        console.error(`[Export] Error embedding image for tablet "${tablet.display_name}":`, error)
        skippedCount++
      }
    }

    // Add page number
    await addPageNumber(page, pageIndex + 1, totalPages, font)
  }

  // Save PDF as base64
  const pdfBytes = await pdfDoc.save()
  const pdfBase64 = Buffer.from(pdfBytes).toString('base64')

  const tabletTypeName = TABLET_TYPE_NAMES[type] || type

  return {
    type,
    typeName: `${ceremonyName}_${tabletTypeName}`,
    pdfBase64,
    count: tablets.length,
    pageCount: totalPages,
    skippedCount
  }
}

// ============================================================================
// EXPORT ACTIONS
//
// The export is driven step-by-step from the client so the progress UI can show
// real, per-type progress instead of a fake timer:
//   1) getExportPlan()            -> real tablet types + counts for the selection
//   2) exportSingleType() (xN)    -> one PDF per type, called once per plan item
//   3) markApplicationsDownloaded -> flip status, but only after the user has
//                                    actually downloaded every PDF (not at generation)
// ============================================================================

/**
 * Return the real export plan for the selected applications: one entry per tablet
 * type that actually has tablets, with its real count. Used to render the progress
 * panel (no more hardcoded 300/800/... placeholders).
 */
export async function getExportPlan(applicationIds: number[]): Promise<ExportPlanItem[]> {
  const supabase = await createClient()

  const { data: tablets, error } = await supabase
    .from('application_name')
    .select('display_name, image_url, tablet_type, application_id')
    .in('application_id', applicationIds)

  if (error) {
    console.error('[Export] Error fetching tablets for plan:', error)
    throw new Error(`Failed to fetch tablets: ${error.message}`)
  }

  if (!tablets || tablets.length === 0) {
    throw new Error('No tablets found for the selected applications')
  }

  const grouped = groupTabletsByType(tablets as TabletDetail[])

  return Object.entries(grouped)
    .map(([type, typeTablets]) => ({
      type,
      typeName: TABLET_TYPE_NAMES[type] || type,
      count: typeTablets.length
    }))
    .sort((a, b) => typeRank(a.type) - typeRank(b.type))
}

/**
 * Generate the PDF for a single tablet type. Called once per plan item so the
 * client can update progress as each type finishes.
 */
export async function exportSingleType(
  applicationIds: number[],
  type: string,
  ceremonyName: string = '法會'
): Promise<PDFResult> {
  const supabase = await createClient()

  const { data: tablets, error } = await supabase
    .from('application_name')
    .select('display_name, image_url, tablet_type, application_id')
    .in('application_id', applicationIds)
    .eq('tablet_type', type)

  if (error) {
    console.error(`[Export] Error fetching tablets for type ${type}:`, error)
    throw new Error(`Failed to fetch tablets: ${error.message}`)
  }

  if (!tablets || tablets.length === 0) {
    throw new Error(`No tablets found for type ${type}`)
  }

  console.log(`[Export] Creating PDF for ${type} (${tablets.length} tablets)`)
  const result = await createPDFForType(type, tablets as TabletDetail[], ceremonyName)
  console.log(`[Export] ✓ Created PDF for ${type}: ${result.pageCount} pages, ${result.skippedCount} skipped`)
  return result
}

/**
 * Flip the selected applications to 'generated' status. Called after all PDFs
 * have been generated successfully.
 */
// Mark applications as downloaded. Called only after the user has actually
// downloaded every generated PDF (see ExportCompletion). The DB value stays
// 'generated' (legacy) which maps to the "已下載/exported" bucket in the UI.
export async function markApplicationsDownloaded(applicationIds: number[]): Promise<void> {
  if (applicationIds.length === 0) return

  const supabase = await createClient()

  const { error } = await supabase
    .from('application')
    .update({ status: 'generated' })
    .in('id', applicationIds)

  if (error) {
    console.error('[Export] Failed to update status:', error)
    throw new Error(`Failed to update status: ${error.message}`)
  }

  console.log(`[Export] Marked ${applicationIds.length} applications as downloaded`)
}
