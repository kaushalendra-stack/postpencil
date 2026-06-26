import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'PostPencil'
  const subtitle = searchParams.get('subtitle') || 'Share & Learn'

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
      <rect width="1200" height="630" fill="#000"/>
      <circle cx="100" cy="100" r="300" fill="#111"/>
      <circle cx="1100" cy="530" r="250" fill="#111"/>
      <text x="600" y="260" text-anchor="middle" fill="#fff" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="800" letter-spacing="-2">${title}</text>
      <text x="600" y="330" text-anchor="middle" fill="#888" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="400">${subtitle}</text>
      <line x1="540" y1="370" x2="660" y2="370" stroke="#333" stroke-width="2"/>
      <text x="600" y="420" text-anchor="middle" fill="#555" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="400">postpencil.com</text>
    </svg>
  `.trim()

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
