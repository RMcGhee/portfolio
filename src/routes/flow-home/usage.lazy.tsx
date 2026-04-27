import { Box, Button, Heading, Separator, Text } from "@radix-ui/themes";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { LeftGrow } from "../../common/Basic";
import { useFlowHomeContext } from "../../entities/flow-home/flow-home-context";
import { UsageUploader } from "../../views/flow-home/UsageUploader";
import { UsageAnalysis } from "../../views/flow-home/UsageAnalysis";
import { useUnsavedPlanGuard } from "../../views/flow-home/UnsavedPlanGuard";
import type {
  DateTimeUsage,
  GapInfo,
} from "../../entities/flow-home/cost-schedule";

export const Route = createLazyFileRoute("/flow-home/usage")({
  component: UsagePage,
});

function UsagePage() {
  const { inputs, dispatch } = useFlowHomeContext();
  const navigate = useNavigate();
  const { guardNavigate } = useUnsavedPlanGuard();

  const handleUpload = (data: DateTimeUsage[], gaps: GapInfo[]) => {
    dispatch({ type: "setUsageData", usageData: data, gaps });
  };

  return (
    <LeftGrow>
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <Heading size="5">Usage Data</Heading>
        <Text as="p" size="2" color="gray">
          Upload your utility's interval usage data to calculate costs against
          your configured rate plan.
        </Text>

        <Separator size="4" />

        <UsageUploader
          usageData={inputs.usageData}
          usageGaps={inputs.usageGaps}
          onUpload={handleUpload}
        />

        {inputs.usageData.length > 0 && (
          <>
            <Separator size="4" />
            <UsageAnalysis
              savedPlans={inputs.savedPlans}
              usageData={inputs.usageData}
              planAId={inputs.analysisPlanAId}
              planBId={inputs.analysisPlanBId}
              onSetPlanA={(id) => dispatch({ type: "setAnalysisPlanA", id })}
              onSetPlanB={(id) => dispatch({ type: "setAnalysisPlanB", id })}
            />
          </>
        )}

        <Separator size="4" style={{ marginTop: "8px" }} />

        <Box
          style={{
            padding: "16px",
            marginBottom: "30px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <Button
            variant="outline"
            onClick={() =>
              guardNavigate(() => navigate({ to: "/flow-home/cost-schedule" }))
            }
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={inputs.usageData.length === 0}
            onClick={() =>
              guardNavigate(() => navigate({ to: "/flow-home/profile" }))
            }
          >
            Next
          </Button>
        </Box>
      </Box>
    </LeftGrow>
  );
}
