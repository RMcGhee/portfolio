import {
  Box,
  Button,
  Card,
  Grid,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { LeftGrow } from "../../common/Basic";

export const Route = createLazyFileRoute("/joule-home/")({
  component: JouleHomeIndex,
});

function JouleHomeIndex() {
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
        <Heading size="5">
          This is a work in progress, but is mostly functional.
        </Heading>
        <Text as="p" size="3" style={{ marginBottom: "0.35em" }}>
          joule-home is a free calculator to help you figure out what your home
          heating and cooling costs would be if you replaced your gas furnace/AC
          combo with a heat pump.
        </Text>
        <Text as="p" size="3" style={{ marginBottom: "0.35em" }}>
          With just a few pieces of information about your home, your current
          system, how much energy you currently use, and location, we should be
          able to get a decent picture of your overall conditioning needs, and
          how that would be affected by an upgrade.
        </Text>
        <Text as="p" size="3" style={{ marginBottom: "0.35em" }}>
          For most people and situations, replacing a working, moderately
          efficient gas furnace/AC combo before its end of life won't be a big
          savings, but if you're looking at replacing them anyways, it may be
          much more efficient to switch to a heat pump. If you live in an area
          that regularly gets below 15°F, you may still want a gas furnace or
          resistive heat for backup heating since heat pumps are less efficient
          at colder temperatures, and a properly sized heat pump for cooling may
          be undersized for heating. Even so, this calculator can help you
          understand what your costs will be in most months, as modern heat
          pumps are still quite efficient down to negative temperatures.
        </Text>
        <Text as="p" size="3" style={{ marginBottom: "0.35em" }}>
          This calculator does not guarantee accuracy or provide financial
          advice, it is only a tool to estimate costs. If you live in an area
          where natural gas is <span style={{ fontWeight: "bold" }}>much</span>{" "}
          cheaper than electricity, a natural gas furnace may be more cost
          effective for heating. I live in an area where the cost of natural gas
          four years ago made a heat pump a wash. However, those costs rose
          significantly in the past two years, and our heat pump is now quite a
          bit cheaper than running our furnace.
        </Text>
        <Grid columns={{ initial: "1", sm: "2" }} gap="4">
          <Card style={{ textAlign: "center" }}>
            <Heading size="4">Required</Heading>
            <Separator size="4" style={{ width: "100%", margin: "8px 0" }} />
            {[
              "Nearest Zipcode",
              "Current Furnace efficiency (%)",
              "Current AC efficiency (SEER)",
              "Gas/electric price per unit",
              "Gas/electric usage/month (there's example data available)",
            ].map((item) => (
              <Text
                as="p"
                key={item}
                style={{ marginBottom: "10px", padding: "8px" }}
              >
                {item}
              </Text>
            ))}
          </Card>
        </Grid>
        Don't worry, we won't hide your results at the end by asking for your
        email or phone number.
        <br />
        We don't wan't those.
        <br />
        Why? I like heat pumps and wanted to play around with React. Stack is
        React, radix-ui, Cloudflare Pages/Workers and D1 for db.
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
            <Link to="/joule-home/current-system">Next</Link>
          </Button>
        </Box>
      </Box>
    </LeftGrow>
  );
}
