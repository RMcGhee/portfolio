import { Box, Flex } from "@radix-ui/themes";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { LeftGrow } from "../common/Basic";
import { useFadeOrder } from "../hooks/useFadeOrder";

import jhc from "../img/joule-home-sc.png";
import bad from "../img/badlands.jpg";
import msa from "../img/msa.png";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const [fadeOrder] = useFadeOrder(2);
  return (
    <div>
      <LeftGrow>
        <Box style={{ marginTop: 15 }}>
          <h1>portfolio</h1>
        </Box>
      </LeftGrow>

      <Flex direction="column" flexGrow="1" style={{ maxWidth: "500px" }}>
        <LeftGrow trigger={fadeOrder > 0}>
          <Flex align="center" gap="4" style={{ marginTop: 15 }}>
            <h3 style={{ whiteSpace: "nowrap" }}>joule-home</h3>
            <Link to="/joule-home">
              <img
                src={jhc}
                alt="Graphs of energy usage"
                style={{ maxHeight: "25vh", objectFit: "contain" }}
              ></img>
            </Link>
          </Flex>
        </LeftGrow>
        <LeftGrow trigger={fadeOrder > 1}>
          <Flex align="center" gap="4" style={{ marginTop: 15 }}>
            <h3 style={{ whiteSpace: "nowrap" }}>photography</h3>
            <Link to="/photography">
              <img
                src={bad}
                alt="The badlands in black and white"
                style={{ maxHeight: "25vh", objectFit: "contain" }}
              ></img>
            </Link>
          </Flex>
        </LeftGrow>
        <LeftGrow trigger={fadeOrder > 2}>
          <Flex align="center" gap="4" style={{ marginTop: 15 }}>
            <h3 style={{ whiteSpace: "nowrap" }}>biology</h3>
            <Link to="/biology">
              <img
                src={msa}
                alt="Python code screenshot"
                style={{ maxHeight: "25vh", objectFit: "contain" }}
              ></img>
            </Link>
          </Flex>
        </LeftGrow>
      </Flex>
    </div>
  );
}
