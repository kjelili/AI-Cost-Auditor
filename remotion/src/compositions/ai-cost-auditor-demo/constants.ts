import { FPS, WIDTH, HEIGHT, Z_INDEX } from "../../constants";

export const COMPOSITION_FPS = FPS;
export const COMPOSITION_WIDTH = WIDTH;
export const COMPOSITION_HEIGHT = HEIGHT;
export const Z = Z_INDEX;

export const DURATION_SEC = 55;
export const DURATION_FRAMES = DURATION_SEC * FPS;

export const SCENE_DURATIONS = {
  intro: 3 * FPS,
  problem: 5 * FPS,
  solution: 7 * FPS,
  features: 30 * FPS,
  cta: 10 * FPS,
} as const;
