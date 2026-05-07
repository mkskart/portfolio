import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kartheek Mukkavilli — Embedded Engineer, Trader, Violinist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Red accent line top-left */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "4px",
            height: "100%",
            background: "#E10600",
          }}
        />

        {/* Top tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#E10600",
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "16px",
              color: "#525252",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            kartheekkmukkavilli.com
          </span>
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: "96px",
            fontWeight: 700,
            color: "#FAFAFA",
            lineHeight: 1,
            marginBottom: "24px",
            letterSpacing: "-0.03em",
          }}
        >
          KARTHEEK
        </div>
        <div
          style={{
            fontSize: "96px",
            fontWeight: 700,
            color: "#FAFAFA",
            lineHeight: 1,
            marginBottom: "48px",
            letterSpacing: "-0.03em",
          }}
        >
          MUKKAVILLI
        </div>

        {/* Role tags */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {[
            "ECE @ UT Austin",
            "Embedded Engineer",
            "Trader",
            "Professional Violinist",
          ].map((role) => (
            <div
              key={role}
              style={{
                border: "1px solid #2A2A2A",
                padding: "8px 16px",
                fontFamily: "monospace",
                fontSize: "14px",
                color: "#A1A1A1",
                letterSpacing: "0.08em",
              }}
            >
              {role}
            </div>
          ))}
        </div>

        {/* Right-side decorative dot grid */}
        <div
          style={{
            position: "absolute",
            right: "80px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            opacity: 0.15,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: 8 }).map((_, j) => (
                <div
                  key={j}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#E10600",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
