import { useMemo } from "react";
import {
  Callout,
  Card,
  Flex,
  Heading,
  Select,
  Separator,
  Table,
  Text,
} from "@radix-ui/themes";
import type { DateTimeUsage } from "../../entities/flow-home/cost-schedule";
import type { SavedPlan } from "../../entities/flow-home/flow-home-context";
import {
  calculatePlanCost,
  type PlanCostResult,
  type SeasonSummary,
} from "../../entities/flow-home/cost-calculator";

// ── Formatters ────────────────────────────────────────────────────────────────

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);

const fmtKwh = (n: number) =>
  `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(n)} kWh`;

// ── Sub-components ────────────────────────────────────────────────────────────

function SeasonTable({ season }: { season: SeasonSummary }) {
  return (
    <Flex direction="column" gap="2">
      <Text size="2" weight="medium">
        {season.seasonName}
      </Text>
      <Table.Root size="1" variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Block</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="right">Usage</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="right">Rate</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="right">Cost</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {season.blocks.map((block, i) => (
            <Table.Row key={i}>
              <Table.Cell>{block.label || "—"}</Table.Cell>
              <Table.Cell align="right" style={{ fontFamily: "monospace" }}>
                {fmtKwh(block.totalUsage)}
              </Table.Cell>
              <Table.Cell align="right" style={{ fontFamily: "monospace" }}>
                ${block.pricePerKwh.toFixed(4)}
              </Table.Cell>
              <Table.Cell align="right" style={{ fontFamily: "monospace" }}>
                {fmtCurrency(block.totalCost)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justify="between">
        <Text size="1" color="gray">
          <Text size="1" weight="bold">
            {fmtKwh(season.totalUsage)}
          </Text>{" "}
          total
        </Text>
        <Text size="1" color="gray">
          <Text size="1" weight="bold">
            {fmtCurrency(season.totalCost)}
          </Text>{" "}
          total
        </Text>
      </Flex>
    </Flex>
  );
}

function PlanResultCard({ result }: { result: PlanCostResult }) {
  return (
    <Card style={{ flex: "1 1 380px", padding: "16px" }}>
      <Flex direction="column" gap="3">
        <Flex direction="column" gap="1">
          <Text size="1" color="gray" weight="medium">
            {result.planName}
          </Text>
          <Text size="8" weight="bold">
            {fmtCurrency(result.totalCost)}
          </Text>
          <Text size="2" color="gray">
            {fmtKwh(result.totalUsage)} total usage
          </Text>
        </Flex>

        {result.unmatchedIntervals > 0 && (
          <Callout.Root color="amber" size="1">
            <Callout.Text>
              {result.unmatchedIntervals.toLocaleString()} interval
              {result.unmatchedIntervals !== 1 ? "s" : ""} had no matching
              season in this plan and were excluded from the total.
            </Callout.Text>
          </Callout.Root>
        )}

        <Separator size="4" />

        <Flex direction="column" gap="4">
          {result.seasons.map((season) => (
            <SeasonTable key={season.seasonIndex} season={season} />
          ))}
        </Flex>
      </Flex>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type UsageAnalysisProps = {
  savedPlans: SavedPlan[];
  usageData: DateTimeUsage[];
  planAId: string;
  planBId: string;
  onSetPlanA: (id: string) => void;
  onSetPlanB: (id: string) => void;
};

export function UsageAnalysis({
  savedPlans,
  usageData,
  planAId: planAIdProp,
  planBId,
  onSetPlanA,
  onSetPlanB,
}: UsageAnalysisProps) {
  // Fall back to the first saved plan when the persisted id is empty or stale
  const planAId = savedPlans.find((sp) => sp.id === planAIdProp)
    ? planAIdProp
    : (savedPlans[0]?.id ?? "");

  const planA = useMemo(
    () => savedPlans.find((sp) => sp.id === planAId) ?? null,
    [savedPlans, planAId],
  );

  const planB = useMemo(
    () =>
      planBId !== "__none__"
        ? (savedPlans.find((sp) => sp.id === planBId) ?? null)
        : null,
    [savedPlans, planBId],
  );

  const resultA = useMemo(
    () =>
      planA && usageData.length > 0
        ? calculatePlanCost(usageData, planA.plan)
        : null,
    [planA, usageData],
  );

  const resultB = useMemo(
    () =>
      planB && usageData.length > 0
        ? calculatePlanCost(usageData, planB.plan)
        : null,
    [planB, usageData],
  );

  if (savedPlans.length === 0) {
    return (
      <Text size="2" color="gray">
        No saved plans yet. Save a rate plan on the Rate Schedule page to
        analyze costs.
      </Text>
    );
  }

  const savings =
    resultA && resultB ? resultA.totalCost - resultB.totalCost : null;

  return (
    <Flex direction="column" gap="4">
      <Heading size="4">Cost Analysis</Heading>

      {/* Plan selectors */}
      <Flex gap="4" wrap="wrap">
        <Flex direction="column" gap="1">
          <Text size="2" color="gray">
            Plan A
          </Text>
          <Select.Root size="2" value={planAId} onValueChange={onSetPlanA}>
            <Select.Trigger placeholder="Select a plan" />
            <Select.Content>
              {savedPlans.map((sp) => (
                <Select.Item key={sp.id} value={sp.id}>
                  {sp.plan.name || "Unnamed Plan"}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column" gap="1">
          <Text size="2" color="gray">
            Plan B{" "}
            <Text size="1" color="gray">
              (optional — for comparison)
            </Text>
          </Text>
          <Select.Root size="2" value={planBId} onValueChange={onSetPlanB}>
            <Select.Trigger placeholder="Select to compare" />
            <Select.Content>
              <Select.Item value="__none__">None</Select.Item>
              <Select.Separator />
              {savedPlans
                .filter((sp) => sp.id !== planAId)
                .map((sp) => (
                  <Select.Item key={sp.id} value={sp.id}>
                    {sp.plan.name || "Unnamed Plan"}
                  </Select.Item>
                ))}
            </Select.Content>
          </Select.Root>
        </Flex>
      </Flex>

      {/* Comparison savings callout */}
      {savings !== null && (
        <Callout.Root
          color={savings > 0 ? "green" : savings < 0 ? "red" : "gray"}
          size="1"
        >
          <Callout.Text>
            {savings === 0
              ? "Both plans result in the same total cost."
              : savings > 0
                ? `Plan B saves ${fmtCurrency(savings)} compared to Plan A.`
                : `Plan A saves ${fmtCurrency(Math.abs(savings))} compared to Plan B.`}
          </Callout.Text>
        </Callout.Root>
      )}

      {/* Result cards */}
      {(resultA || resultB) && (
        <Flex gap="4" wrap="wrap" align="start">
          {resultA && <PlanResultCard result={resultA} />}
          {resultB && <PlanResultCard result={resultB} />}
        </Flex>
      )}
    </Flex>
  );
}
