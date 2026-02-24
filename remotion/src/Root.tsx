import React from "react";
import { Composition } from "remotion";
import {
  AiCostAuditorDemoMain,
  defaultAiCostAuditorDemoProps,
  calculateMetadata,
} from "./compositions/ai-cost-auditor-demo";
import { WIDTH, HEIGHT, FPS } from "./constants";
import { DURATION_FRAMES } from "./compositions/ai-cost-auditor-demo/constants";

const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="AiCostAuditorDemo"
        component={AiCostAuditorDemoMain}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={defaultAiCostAuditorDemoProps}
        calculateMetadata={({ props }) => calculateMetadata(props)}
      />
    </>
  );
};

export default Root;
