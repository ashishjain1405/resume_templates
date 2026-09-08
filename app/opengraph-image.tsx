import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#2563eb',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700 }}>Resume Expert</div>
        <div style={{ fontSize: 32, marginTop: 24, color: '#dbeafe' }}>
          ATS-friendly resume templates for Indian job seekers
        </div>
      </div>
    ),
    { ...size }
  )
}
