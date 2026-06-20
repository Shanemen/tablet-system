import { ImageResponse } from '@vercel/og'
import type { NextRequest } from 'next/server'
import type { TabletTypeValue } from '@/lib/tablet-types-config'
import { INK } from './constants'
import { layoutAtlantaTablet, type AtlantaEl, type AtlantaInputs } from './layout'
import { getSubsetFont } from '@/lib/fonts/dynamic-subset'

// Atlanta render path: turns the pure layout IR into Satori JSX + ImageResponse.
// Independent of the default render path. Atlanta is ALWAYS black-and-white (printed on
// colored paper), so the shared decoration SVG is used as-is with NO recolor.
//
// Font: atlanta renders ALL text via the font (fixed strings + dynamic), so the per-request
// subset is built from every glyph in the assembled layout. Registered at 400 AND 500 (same
// buffer; 500 is satori faux-bold for the fixed text).

const FRAME_PATH = '/templates/atlanta/frame.svg'

/** Collect every character the layout will render, so the subset includes fixed + dynamic glyphs. */
function collectText(elements: AtlantaEl[]): string {
  return elements
    .map((el) => (el.kind === 'vcol' ? el.chars.join('') : el.kind === 'hlines' ? el.lines.join('') : el.text))
    .join('')
}

function readParams(type: TabletTypeValue, p: URLSearchParams): AtlantaInputs {
  return {
    name: p.get('name') || '',
    family: p.get('family') === '1',
    title: p.get('title') || '',
    petTitle: p.get('pet_title') || '',
    petName: p.get('pet_name') || '',
    surname: p.get('surname') || '',
    descendant: p.get('descendant') || '',
    father: p.get('father') || '',
    mother: p.get('mother') || '',
    address: p.get('address') || '',
    applicantName: p.get('applicant_name') || '',
    applicant: p.get('applicant') || '',
  }
}

function renderElement(el: AtlantaEl, i: number) {
  if (el.kind === 'vcol') {
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: el.centerX - el.fontSize / 2,
          top: el.top,
          width: el.fontSize,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {el.chars.map((c, j) => (
          <div
            key={j}
            style={{
              width: el.fontSize,
              height: el.fontSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: el.fontSize,
              lineHeight: 1,
              fontWeight: el.weight,
              color: INK,
            }}
          >
            {c}
          </div>
        ))}
      </div>
    )
  }
  if (el.kind === 'hlines') {
    // centerX is always the band center (160); center within the band box.
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: el.centerX - 80,
          top: el.top,
          width: 160,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {el.lines.map((line, j) => (
          <div
            key={j}
            style={{
              display: 'flex',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              fontSize: el.fontSize,
              lineHeight: el.lineHeight,
              fontWeight: el.weight,
              color: INK,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    )
  }
  // rot: rotated-90 latin line centered at (centerX, centerY)
  return (
    <div
      key={i}
      style={{
        position: 'absolute',
        left: el.centerX,
        top: el.centerY,
        transform: 'translate(-50%, -50%) rotate(90deg)',
        display: 'flex',
        whiteSpace: 'nowrap',
        fontSize: el.fontSize,
        fontWeight: el.weight,
        color: INK,
      }}
    >
      {el.text}
    </div>
  )
}

export async function renderAtlantaTablet(
  request: NextRequest,
  type: TabletTypeValue,
  searchParams: URLSearchParams
): Promise<Response> {
  const origin = request.nextUrl.origin
  const layout = layoutAtlantaTablet(type, readParams(type, searchParams))

  // Shared decoration frame (bw, used as-is).
  let svgDataUri: string | null = null
  try {
    const r = await fetch(`${origin}${FRAME_PATH}`)
    if (r.ok) svgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(await r.text())}`
  } catch (e) {
    console.warn('Atlanta frame fetch failed:', e)
  }

  // Font: per-request dynamic subset covering every glyph the layout renders (fixed + dynamic).
  let fontData: ArrayBuffer
  try {
    fontData = await getSubsetFont(origin, collectText(layout.elements))
  } catch (e: any) {
    return new Response(`Atlanta font load failed: ${e.message}`, { status: 500 })
  }

  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', position: 'relative', backgroundColor: '#ffffff' }}>
        {svgDataUri && (
          <img src={svgDataUri} alt="frame" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
        )}
        {layout.elements.map((el, i) => renderElement(el, i))}
      </div>
    ),
    {
      width: layout.width,
      height: layout.height,
      fonts: [
        { name: 'Noto Serif TC', data: fontData, weight: 400, style: 'normal' },
        { name: 'Noto Serif TC', data: fontData.slice(0), weight: 500, style: 'normal' },
      ],
    }
  )
}
