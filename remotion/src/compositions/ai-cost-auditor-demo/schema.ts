import { z } from "zod";
import { DURATION_FRAMES, COMPOSITION_FPS, COMPOSITION_WIDTH, COMPOSITION_HEIGHT } from "./constants";

export const AiCostAuditorDemoSchema = z.object({
  title: z.string(),
  tagline: z.string(),
});

export type AiCostAuditorDemoProps = z.infer<typeof AiCostAuditorDemoSchema>;

export const defaultAiCostAuditorDemoProps: AiCostAuditorDemoProps = {
  title: "AI Cost Auditor",
  tagline: "The AWS Cost Explorer for LLMs",
};

export const calculateMetadata = (props: unknown) => {
  const parsed = AiCostAuditorDemoSchema.parse(props);
  return {
    durationInFrames: DURATION_FRAMES,
    fps: COMPOSITION_FPS,
    width: COMPOSITION_WIDTH,
    height: COMPOSITION_HEIGHT,
    props: parsed,
  };
};
