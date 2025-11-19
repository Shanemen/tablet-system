import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || '往生蓮位'
    const name = searchParams.get('name') || '某某某'

    // Colors based on type
    // 長生祿位 (Longevity) -> Red background
    // All others -> Yellow background
    const isLongevity = type === '長生祿位'
    const bgColor = isLongevity ? '#fca5a5' : '#fde68a' // red-300 : yellow-200 (lighter for better contrast)
    const borderColor = isLongevity ? '#dc2626' : '#d97706' // red-600 : amber-600
    const textColor = '#000000'

    // Top and bottom text based on type
    const topText = isLongevity ? '佛光注照' : '佛力超薦'
    const bottomText = isLongevity ? '陽上' : '往生'

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
            backgroundColor: bgColor,
            padding: '40px 30px',
            border: `12px double ${borderColor}`,
          }}
        >
          {/* Top Text */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 28,
              fontWeight: 'bold',
              color: textColor,
              letterSpacing: '0.1em',
            }}
          >
            {topText.split('').map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </div>

          {/* Center - Name (Vertical) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 72,
              fontWeight: 'bold',
              color: textColor,
              letterSpacing: '0.05em',
              lineHeight: 1.2,
            }}
          >
            {name.split('').map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </div>

          {/* Bottom Text */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 32,
              fontWeight: 'bold',
              color: textColor,
              letterSpacing: '0.1em',
            }}
          >
            {bottomText.split('').map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </div>
        </div>
      ),
      {
        width: 400,
        height: 800,
      }
    )
  } catch (e: any) {
    console.error('Image generation error:', e)
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    })
  }
}

