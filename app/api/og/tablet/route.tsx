import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

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

    // According to IMAGE_GENERATION_GUIDE.md:
    // - SVG template already contains "佛光注照" (top) and "長生祿位" (bottom)
    // - We ONLY need to add the user's name in the center (46px, line-height 44)
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

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            backgroundColor: '#f5f5dc', // Beige background for visibility
            padding: '40px 30px',
          }}
        >
          {/* SVG Background - Test if Satori supports backgroundImage */}
          {svgDataUri && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${svgDataUri})`,
                backgroundSize: 'cover', // Changed from 'contain' to 'cover' to fill entire area
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                opacity: 1,
              }}
            />
          )}

          {/* Content Layer - ONLY render user's name in center */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Center - Name (Vertical) - 46px, line-height 44 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: 46,
                fontWeight: 400,
                color: textColor,
                letterSpacing: '0.05em',
                lineHeight: '44px',
                textAlign: 'center',
              }}
            >
              {name}
            </div>
          </div>
        </div>
      ),
      {
        // Match SVG template dimensions: 320x848
        // But use slightly larger for better quality
        width: 320,
        height: 848,
      }
    )
  } catch (e: any) {
    console.error('Image generation error:', e)
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    })
  }
}

