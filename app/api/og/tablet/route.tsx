import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { 
  getTemplateConfig, 
  calculateFontSize,
  calculateEnglishFont,
  isEnglishText,
  type ActiveArea 
} from '@/lib/active-areas-config'
import { convertToTraditional } from '@/lib/utils/chinese-converter'

export const runtime = 'edge'

/**
 * Render vertical text character by character
 * 
 * For Chinese text: Each character is rendered separately in a vertical column
 * For English text: 
 *   - Single-line mode: Entire text rotated 90 degrees
 *   - Multi-line mode: Split by space, each line rotated 90 degrees
 * 
 * Centering Strategy:
 * - Horizontal: Flexbox auto-centering (based on container width)
 * - Vertical: Measured boundary centering (based on fixed text positions in SVG)
 */
function renderVerticalText(
  text: string,
  activeArea: ActiveArea,
  color: string = '#000000'
) {
  // Check if text contains English letters
  const isEnglish = isEnglishText(text)
  
  if (isEnglish) {
    // For English text: Use single-line or multi-line mode (rotated 90 degrees)
    // Multi-line support splits text into max 2 lines if it improves readability
    const { fontSize, lines } = calculateEnglishFont(text, activeArea)
    
    return (
      <div
        style={{
          position: 'absolute',
          left: activeArea.x,
          top: activeArea.y,
          width: activeArea.width,
          height: activeArea.height,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(90deg)',
        }}
      >
          {lines.map((line, index) => (
            <div
              key={index}
              style={{
                fontSize,
                fontWeight: 400,
                fontFamily: 'Noto Serif TC',
                color,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                lineHeight: lines.length > 1 ? `${fontSize * 1.1}px` : 'normal',
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  // For Chinese text: render character by character vertically
  const fontSize = calculateFontSize(text, activeArea)
  const lineHeight = fontSize
  const characters = text.split('')
  
  return (
    <div
      style={{
        position: 'absolute',
        left: activeArea.x,
        top: activeArea.y,
        width: activeArea.width,
        height: activeArea.height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {characters.map((char, index) => (
        <div
          key={index}
          style={{
            fontSize,
            fontWeight: 400,
            fontFamily: 'Noto Serif TC',
            color,
            lineHeight: `${lineHeight}px`,
            textAlign: 'center',
          }}
        >
          {char}
        </div>
      ))}
    </div>
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || '長生祿位'
    const nameInput = searchParams.get('name') || 'TEST'
    const name = convertToTraditional(nameInput)  // 实时转换简繁体

    // Debug: Log parameters
    if (process.env.NODE_ENV === 'development') {
      console.log('[OG Image] Type:', type)
      console.log(`[OG Image] Input: "${nameInput}" → Converted: "${name}"`)
    }

    // Determine template type
    const isLongevity = type === '長生祿位' || type === 'longevity'
    const isKarmicCreditors = type === '冤親債主' || type === 'karmic-creditors'
    const isAncestors = type === '歷代祖先' || type === 'ancestors'
    const isDeceased = type === '往生蓮位' || type === 'deceased'
    
    // Map type to template ID and SVG file
    let templateId: string
    let svgFilename: string
    
    if (isLongevity) {
      templateId = 'longevity'
      svgFilename = 'long-living-template-optimized.svg'
    } else if (isKarmicCreditors) {
      templateId = 'karmic-creditors'
      svgFilename = 'karmic-creditors-template-optimized.svg'
    } else if (isAncestors) {
      templateId = 'ancestors'
      svgFilename = 'ancestors-template-optimized.svg'
    } else if (isDeceased) {
      templateId = 'deceased'
      svgFilename = 'deceased-template-optimized.svg'
    } else {
      return new Response('Unsupported tablet type. Use "longevity", "karmic-creditors", "ancestors", or "deceased"', { status: 400 })
    }

    // Get template configuration
    const config = getTemplateConfig(templateId)
    const textColor = '#000000'

    // Load SVG template with pre-rendered text
    const svgUrl = `${request.nextUrl.origin}/${svgFilename}`
    
    let svgContent = ''
    try {
      const svgResponse = await fetch(svgUrl)
      if (svgResponse.ok) {
        svgContent = await svgResponse.text()
      }
    } catch (e) {
      console.warn('Could not fetch SVG:', e)
    }

    const svgDataUri = svgContent 
      ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`
      : null

    // Load Chinese font (Noto Serif TC subset)
    // Using OTF format for better compatibility with @vercel/og
    const fontUrl = `${request.nextUrl.origin}/fonts/NotoSerifTC-Subset.otf`
    let fontData: ArrayBuffer
    try {
      const fontResponse = await fetch(fontUrl)
      if (!fontResponse.ok) {
        throw new Error(`Font fetch failed: ${fontResponse.status} ${fontResponse.statusText}`)
      }
      fontData = await fontResponse.arrayBuffer()
      console.log(`Font loaded: ${fontData.byteLength} bytes (${(fontData.byteLength / 1024).toFixed(2)} KB)`)
      if (fontData.byteLength === 0) {
        throw new Error('Font file is empty!')
      }
    } catch (e: any) {
      console.error('Font loading error:', e)
      return new Response(`Font loading failed: ${e.message}`, { status: 500 })
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            position: 'relative',
            backgroundColor: '#ffffff',
          }}
        >
          {/* SVG Background */}
          {svgDataUri && (
            <img
              src={svgDataUri}
              alt="template"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          )}

          {/* Content Layer - Render vertical text in active areas */}
          {config.activeAreas.map((area) => {
            // For center/honoree area: use the main name (surname for ancestors)
            // For left/petitioner area: use applicant name from query param
            let textToRender = ''
            
            if (area.purpose === 'honoree') {
              // Center area: Use the full name/surname
              textToRender = name
            } else if (area.purpose === 'petitioner') {
              // Left area: Use applicant parameter, default to empty
              const applicant = searchParams.get('applicant') || ''
              textToRender = convertToTraditional(applicant)
            }
            
            // Only render if there's text
            return textToRender ? renderVerticalText(textToRender, area, textColor) : null
          })}
        </div>
      ),
      {
        // Match SVG template dimensions: 320x848
        width: config.svgWidth,
        height: config.svgHeight,
        fonts: [
          {
            name: 'Noto Serif TC',
            data: fontData,
            weight: 400,
            style: 'normal',
          },
        ],
      }
    )
  } catch (e: any) {
    console.error('Image generation error:', e)
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    })
  }
}

