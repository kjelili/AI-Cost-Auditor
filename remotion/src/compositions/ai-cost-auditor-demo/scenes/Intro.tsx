import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { fadeIn, slideUp } from "../../shared/animations";
import { Z } from "../constants";

type IntroProps = {
  title: string;
  tagline: string;
  startFrame: number;
  durationFrames: number;
};

export function Intro({ title, tagline, startFrame, durationFrames }: IntroProps) {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  const opacity = fadeIn(relativeFrame, 0, Math.min(20, durationFrames));
  const titleY = slideUp(relativeFrame, 5, 25, 30);
  const taglineOpacity = interpolate(
    relativeFrame,
    [15, 35],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f0f9ff",
        zIndex: Z.content,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ opacity, textAlign: "center", padding: 48 }}>
        <h1
          style={{
            transform: `translateY(${titleY}px)`,
            fontFamily: "system-ui, sans-serif",
            fontSize: 72,
            fontWeight: 700,
            color: "#0c4a6e",
            margin: 0,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            opacity: taglineOpacity,
            fontFamily: "system-ui, sans-serif",
            fontSize: 36,
            color: "#0369a1",
            marginTop: 24,
            marginBottom: 0,
          }}
        >
          {tagline}
        </p>
      </div>
    </AbsoluteFill>
  );
}
