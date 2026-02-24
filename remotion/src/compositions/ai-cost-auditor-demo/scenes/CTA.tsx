import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Z } from "../constants";

type CTAProps = {
  startFrame: number;
  durationFrames: number;
};

export function CTA({ startFrame, durationFrames }: CTAProps) {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  const opacity = interpolate(
    relativeFrame,
    [0, 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = interpolate(
    relativeFrame,
    [10, 30],
    [0.9, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0369a1",
        zIndex: Z.content,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
          padding: 48,
        }}
      >
        <h2
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 56,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 24,
          }}
        >
          Ready to take control?
        </h2>
        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 32,
            color: "#bae6fd",
            marginBottom: 40,
          }}
        >
          Start tracking and optimizing your LLM usage today.
        </p>
        <div
          style={{
            display: "inline-block",
            padding: "16px 48px",
            backgroundColor: "#fff",
            color: "#0369a1",
            fontFamily: "system-ui, sans-serif",
            fontSize: 24,
            fontWeight: 600,
            borderRadius: 12,
          }}
        >
          Get started free
        </div>
      </div>
    </AbsoluteFill>
  );
}
