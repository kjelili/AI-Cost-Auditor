import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { fadeIn } from "../../shared/animations";
import { Z } from "../constants";

type ProblemProps = {
  startFrame: number;
  durationFrames: number;
};

const BULLETS = [
  "One shared API key — no attribution",
  "Discover overspend after the invoice",
  "Runaway agents and repeated prompts",
];

export function Problem({ startFrame, durationFrames }: ProblemProps) {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  const titleOpacity = interpolate(
    relativeFrame,
    [0, 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fff",
        zIndex: Z.content,
        padding: 80,
        justifyContent: "center",
      }}
    >
      <div style={{ opacity: titleOpacity }}>
        <h2
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 48,
            fontWeight: 700,
            color: "#111827",
            marginBottom: 40,
          }}
        >
          The problem
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {BULLETS.map((text, i) => {
            const bulletOpacity = interpolate(
              relativeFrame,
              [20 + i * 15, 35 + i * 15],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            return (
              <li
                key={text}
                style={{
                  opacity: bulletOpacity,
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 28,
                  color: "#374151",
                  marginBottom: 16,
                  paddingLeft: 24,
                  position: "relative",
                }}
              >
                <span style={{ position: "absolute", left: 0 }}>•</span>
                {text}
              </li>
            );
          })}
        </ul>
      </div>
    </AbsoluteFill>
  );
}
