import { useEffect, useReducer } from "react";
import { Box, Flex } from "@radix-ui/themes";

import { LeftGrow } from "../common/Basic";
import {
  type FlowHomeInputs,
  defaultFlowHomeInputs,
  flowHomeReducer,
  FlowHomeContext,
  sanitizeInputs,
} from "../entities/flow-home/flow-home-context";
import { defaultCostSchedulePlan } from "../entities/flow-home/cost-schedule";
import { createLazyFileRoute, Outlet } from "@tanstack/react-router";
import { FlowHomeNav } from "../views/flow-home/FlowHomeNav";
import { UnsavedPlanGuardProvider } from "../views/flow-home/UnsavedPlanGuard";

const STORAGE_KEY = "flowHomeInputs";

export const Route = createLazyFileRoute("/flow-home")({
  component: FlowHome,
});

function loadSavedInputs(): FlowHomeInputs {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return sanitizeInputs(parsed);
    }
  } catch {
    // Corrupted data — start fresh
  }
  return { ...defaultFlowHomeInputs, plan: defaultCostSchedulePlan() };
}

function FlowHome() {
  const [inputs, dispatch] = useReducer(flowHomeReducer, null, loadSavedInputs);

  // Persist inputs to localStorage 200ms after any change.
  useEffect(() => {
    const hasContent = inputs.plan.name || inputs.usageData.length > 0;
    if (!hasContent) return;

    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    }, 200);

    return () => clearTimeout(timer);
  }, [inputs]);

  return (
    <FlowHomeContext.Provider value={{ inputs, dispatch }}>
      <UnsavedPlanGuardProvider>
        <div>
          <Box
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              backgroundColor: "var(--color-background)",
              paddingTop: "12px",
              paddingBottom: "12px",
              marginBottom: "8px",
            }}
          >
            <LeftGrow>
              <Flex align="center" gap="4" style={{ marginLeft: "0.8em" }}>
                <h2 style={{ margin: 0 }}>flow-home</h2>
                <FlowHomeNav />
              </Flex>
            </LeftGrow>
          </Box>
          <Flex direction="column" flexGrow="1" justify="between">
            <Outlet />
          </Flex>
        </div>
      </UnsavedPlanGuardProvider>
    </FlowHomeContext.Provider>
  );
}
