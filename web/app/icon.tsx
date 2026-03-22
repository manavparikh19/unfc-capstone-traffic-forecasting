import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";
export const dynamic = "force-static";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: "#07111f",
      }}
    >
      <div
        style={{
          display: "flex",
          height: 22,
          width: 22,
          borderRadius: 10,
          border: "1px solid rgba(112, 225, 255, 0.3)",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, rgba(57,202,239,0.16), rgba(197,243,107,0.24))",
        }}
      >
        <div
          style={{
            height: 10,
            width: 10,
            borderRadius: 999,
            background: "linear-gradient(135deg, #70e1ff, #c5f36b)",
          }}
        />
      </div>
    </div>,
    size,
  );
}
