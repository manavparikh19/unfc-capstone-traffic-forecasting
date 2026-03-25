import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site-config";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#07111f",
        backgroundImage:
          "radial-gradient(circle at top right, rgba(57,202,239,0.26), transparent 30%), radial-gradient(circle at bottom left, rgba(197,243,107,0.18), transparent 26%)",
        color: "#f5f8fc",
        padding: "56px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignSelf: "flex-start",
          borderRadius: 999,
          border: "1px solid rgba(112,225,255,0.25)",
          padding: "10px 16px",
          fontSize: 22,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#70e1ff",
        }}
      >
        Traffic Congestion
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontSize: 78,
            lineHeight: 1.02,
            fontWeight: 700,
            maxWidth: 880,
          }}
        >
          Forecast congestion before it forms.
        </div>
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.4,
            maxWidth: 840,
            color: "#dbe6f0",
          }}
        >
          {siteConfig.socialPreviewHeadline}
        </div>
      </div>
    </div>,
    size,
  );
}
