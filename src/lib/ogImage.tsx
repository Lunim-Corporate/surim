import { ImageResponse } from "next/og";

type Size = { width: number; height: number };

export function generateOgImageResponse(
  title: string,
  backgroundUrl: string | null | undefined,
  size: Size,
) {
   return new ImageResponse(
    (
        <div
        style={{
            position: "relative",
            width: "100%",
            height: "100%",
            background: backgroundUrl
            ? `url(${backgroundUrl}) center/cover no-repeat`
            : "linear-gradient(black, #0f172a 80%)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-start",
            boxSizing: "border-box",
            color: "white",
            fontSize: 75,
            textShadow: "2px 2px 4px #000"
        }}
        >
        <div
            style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            background: "black",
            opacity: 0
            }}
        />
        <div style={{padding: 50}}>
            {title}
        </div>
        </div>
    ),
    { ...size }
    );
}

export default generateOgImageResponse;
