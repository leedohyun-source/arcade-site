"use client";

export default function Home() {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "black",
        overflow: "hidden",
      }}
    >
      {/* 배경 영상 */}
      <video
        src="/videos/V0_01.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* 테스트용 UI */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          color: "white",
          background: "rgba(0,0,0,0.3)",
        }}
      >
        VIDEO + UI OK?
      </div>
    </div>
  );
}
