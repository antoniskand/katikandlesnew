import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Kati Kandles — handcrafted soy candles"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff7e8",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -160,
            width: 600,
            height: 600,
            background: "#ff5a36",
            borderRadius: "50%",
            opacity: 0.4,
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -200,
            width: 700,
            height: 700,
            background: "#ffc94d",
            borderRadius: "50%",
            opacity: 0.5,
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            zIndex: 1,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, color: "#1a1208", opacity: 0.7, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            handmade · soy · vibes
          </div>
          <div
            style={{
              fontSize: 200,
              fontWeight: 800,
              color: "#1a1208",
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            kati kandles
          </div>
          <div
            style={{
              fontSize: 56,
              color: "#ff5a36",
              fontStyle: "italic",
              fontWeight: 700,
            }}
          >
            smells like whateverness
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
