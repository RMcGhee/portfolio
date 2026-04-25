import { Box, Button, Heading, Text } from "@radix-ui/themes";
import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { LeftGrow } from "../../common/Basic";

export const Route = createLazyFileRoute("/flow-home/")({
  component: FlowHomeIndex,
});

function FlowHomeIndex() {
  return (
    <LeftGrow>
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: "16px",
          maxWidth: "50rem",
        }}
      >
        <Heading size="5">Utility Cost Schedule Calculator</Heading>
        <Text as="p" size="3" style={{ marginBottom: "0.35em" }}>
          flow-home helps you understand your time-of-use electricity costs by
          mapping your utility's rate schedule against your actual usage data.
        </Text>
        <Text as="p" size="3" style={{ marginBottom: "0.35em" }}>
          Enter your utility's rate tiers and time-of-use periods, and we'll
          help you see exactly what you're paying and when — so you can make
          smarter decisions about when to use energy.
        </Text>
        <Box
          style={{
            position: "relative",
            padding: "16px",
            marginBottom: "30px",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Button
            variant="outline"
            asChild
            style={{
              transition: "width 0.5s ease-in-out, opacity 0.5s ease-in-out",
              left: 0,
            }}
          >
            <Link to="/flow-home/cost-schedule">Next</Link>
          </Button>
        </Box>
      </Box>
    </LeftGrow>
  );
}
