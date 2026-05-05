import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kartheek Mukkavilli — Embedded · ML · Trading";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "radial-gradient(ellipse at top right, #2A0808 0%, #0a0a0a 60%)",
          color: "#FAFAFA",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#FF1744",
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 9999,
              background: "#FF1744",
            }}
          />
          kartheek mukkavilli
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 110,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 0.95,
            }}
          >
            Embedded ·
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 0.95,
            }}
          >
            ML · Trading
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#A1A1A1",
            fontSize: 24,
          }}
        >
          <div>ECE @ UT Austin</div>
          <div>kartheekkmukkavilli.com</div>
        </div>
      </div>
    ),
    size,
  );
}
