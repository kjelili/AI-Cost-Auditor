import { interpolate } from "remotion";

export function fadeIn(
  frame: number,
  startFrame: number,
  durationFrames: number,
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

export function fadeOut(
  frame: number,
  startFrame: number,
  durationFrames: number,
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

export function slideUp(
  frame: number,
  startFrame: number,
  durationFrames: number,
  offsetPx: number = 40,
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [offsetPx, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}
