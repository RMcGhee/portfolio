import { Box, Button, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { LeftGrow } from "../../common/Basic";
import { LocationSection } from "../../views/flow-home/LocationSection";
import { BatterySection } from "../../views/flow-home/BatterySection";
import { useUnsavedPlanGuard } from "../../views/flow-home/UnsavedPlanGuard";

export const Route = createLazyFileRoute("/flow-home/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { guardNavigate } = useUnsavedPlanGuard();

  return (
    <LeftGrow>
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: "16px",
        }}
      >
        <Heading size="5">Profile</Heading>
        <Text as="p" size="2" color="gray">
          Tell us where you live and what hardware you're considering. We'll use
          this to model how weather affects your usage and to project savings
          from a battery system.
        </Text>

        <Separator size="4" style={{ width: "100%" }} />

        <LocationSection />

        <Separator size="4" style={{ width: "100%" }} />

        <BatterySection />

        {/* Navigation */}
        <Separator size="4" style={{ width: "100%", marginTop: "8px" }} />
        <Box
          style={{
            position: "relative",
            padding: "16px",
            marginBottom: "30px",
            flexGrow: 1,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <Button
            variant="outline"
            onClick={() =>
              guardNavigate(() => navigate({ to: "/flow-home/usage" }))
            }
            style={{
              transition: "width 0.5s ease-in-out, opacity 0.5s ease-in-out",
            }}
          >
            Previous
          </Button>
        </Box>
      </Box>
    </LeftGrow>
  );
}
