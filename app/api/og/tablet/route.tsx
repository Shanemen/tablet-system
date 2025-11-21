import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { 
  getTemplateConfig, 
  calculateFontSize, 
  type ActiveArea 
} from '@/lib/active-areas-config'

export const runtime = 'edge'

/**
 * Render vertical text character by character
 * Each character is rendered separately in a vertical column
 */
function renderVerticalText(
  text: string,
  activeArea: ActiveArea,
  color: string = '#000000'
) {
  // Split text into individual characters
  const characters = text.split('')
  
  // Calculate font size based on text length
  const fontSize = calculateFontSize(text, activeArea)
  const lineHeight = (fontSize / activeArea.fontSize) * activeArea.lineHeight
  
  // Calculate total height needed
  const totalHeight = characters.length * lineHeight
  
  // Calculate starting Y position to center the text vertically
  const startY = activeArea.y + (activeArea.height - totalHeight) / 2
  
  // Calculate X position (center horizontally in active area)
  const centerX = activeArea.x + activeArea.width / 2
  
  return (
    <div
      style={{
        position: 'absolute',
        left: centerX,
        top: startY,
        display: 'flex',
        flexDirection: 'column',
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
    const name = searchParams.get('name') || 'TEST'

    // Debug: Log parameters
    console.log('Type:', type, 'Name:', name)

    // For now, only support 長生祿位 (Longevity Tablet)
    const isLongevity = type === '長生祿位' || type === 'longevity'
    
    if (!isLongevity) {
      return new Response('Only 長生祿位 is supported for now', { status: 400 })
    }

    // Get template configuration
    const config = getTemplateConfig('longevity')
    const centerArea = config.activeAreas.find(area => area.id === 'center')
    
    if (!centerArea) {
      throw new Error('Center active area not found in config')
    }

    const textColor = '#000000'

    // Load SVG template with pre-rendered text
    const svgUrl = `${request.nextUrl.origin}/long-living-template-optimized.svg`
    
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
    const fontUrl = `${request.nextUrl.origin}/fonts/NotoSerifTC-Subset.otf`
    const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer())

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

          {/* Content Layer - Render vertical text in active area */}
          {renderVerticalText(name, centerArea, textColor)}
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

