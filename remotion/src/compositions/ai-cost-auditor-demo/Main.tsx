import React from "react";
import { Sequence } from "remotion";
import type { AiCostAuditorDemoProps } from "./schema";
import { SCENE_DURATIONS } from "./constants";
import { Intro } from "./scenes/Intro";
import { Problem } from "./scenes/Problem";
import { CTA } from "./scenes/CTA";

const INTRO_FROM = 0;
const PROBLEM_FROM = INTRO_FROM + SCENE_DURATIONS.intro;
const CTA_FROM = PROBLEM_FROM + SCENE_DURATIONS.problem;

export function AiCostAuditorDemoMain(props: AiCostAuditorDemoProps) {
  const { title, tagline } = props;

  return (
    <>
      <Sequence from={INTRO_FROM} durationInFrames={SCENE_DURATIONS.intro}>
        <Intro
          title={title}
          tagline={tagline}
          startFrame={0}
          durationFrames={SCENE_DURATIONS.intro}
        />
      </Sequence>

      <Sequence from={PROBLEM_FROM} durationInFrames={SCENE_DURATIONS.problem}>
        <Problem startFrame={0} durationFrames={SCENE_DURATIONS.problem} />
      </Sequence>

      <Sequence from={CTA_FROM} durationInFrames={SCENE_DURATIONS.cta}>
        <CTA startFrame={0} durationFrames={SCENE_DURATIONS.cta} />
      </Sequence>
    </>
  );
}
