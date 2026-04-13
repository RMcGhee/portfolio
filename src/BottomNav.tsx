import React from "react";
import {
  Flex,
  HoverCard,
  Separator,
  Text,
  Link as RadixLink,
} from "@radix-ui/themes";
import { LeftGrow } from "./common/Basic";
import { Link } from "@tanstack/react-router";

const BottomNav: React.FC = () => {
  return (
    <LeftGrow>
      <Flex
        direction="row"
        gap="5"
        align="end"
        justify="start"
        style={{ marginLeft: "0.8em", marginBottom: "0.3em" }}
      >
        <HoverCard.Root openDelay={200}>
          <HoverCard.Trigger>
            <h2 style={{ margin: 0, cursor: "pointer" }}>
              <Link to="/" className="unstyled-link">
                r.mcghee
              </Link>
            </h2>
          </HoverCard.Trigger>
          <HoverCard.Content side="top" size="1">
            <Flex direction="column" gap="2">
              <Text weight="bold">Want to connect?</Text>
              <RadixLink
                href="https://www.linkedin.com/in/rich-mcghee-18a41757"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </RadixLink>
              <Link to="/">Home</Link>
            </Flex>
          </HoverCard.Content>
        </HoverCard.Root>
        <Separator orientation="vertical" size="2" />
        <Link to="/joule-home">joule-home</Link>
        <Link to="/photography">photography</Link>
        <Link to="/biology">biology</Link>
      </Flex>
    </LeftGrow>
  );
};

export default BottomNav;
