import { useEffect, useReducer } from "react";
import { Box, Flex } from "@radix-ui/themes";

import { LeftGrow } from "../common/Basic";
import {
  type FlowHomeInputs,
  defaultFlowHomeInputs,
  flowHomeReducer,
  FlowHomeContext,
} from "../entities/flow-home/flow-home-context";
import { defaultCostSchedulePlan } from "../entities/flow-home/cost-schedule";
import { createLazyFileRoute, Outlet } from "@tanstack/react-router";

const STORAGE_KEY = "flowHomeInputs";

export const Route = createLazyFileRoute("/flow-home")({
  component: FlowHome,
});

function loadSavedInputs(): FlowHomeInputs {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...defaultFlowHomeInputs,
        plan: defaultCostSchedulePlan(),
        ...parsed,
      };
    }
  } catch {
    // Corrupted data — start fresh
  }
  return { ...defaultFlowHomeInputs, plan: defaultCostSchedulePlan() };
}

function FlowHome() {
  const [inputs, dispatch] = useReducer(flowHomeReducer, null, loadSavedInputs);

  // Persist inputs to localStorage 3 seconds after any change.
  useEffect(() => {
    const hasContent = inputs.plan.name || inputs.usageData.length > 0;
    if (!hasContent) return;

    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    }, 3000);

    return () => clearTimeout(timer);
  }, [inputs]);

  return (
    <FlowHomeContext.Provider value={{ inputs, dispatch }}>
      <div>
        <LeftGrow>
          <Box style={{ marginTop: 15 }}>
            <h1>flow-home</h1>
          </Box>
        </LeftGrow>
        <Flex
          direction="column"
          flexGrow="1"
          justify="between"
          style={{ maxWidth: "500px" }}
        >
          <Outlet />
        </Flex>
      </div>
    </FlowHomeContext.Provider>
  );
}