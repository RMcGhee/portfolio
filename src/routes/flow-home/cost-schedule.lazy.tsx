import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  DropdownMenu,
  Select,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { ChevronDownIcon, PlusIcon } from "@radix-ui/react-icons";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { LeftGrow } from "../../common/Basic";
import {
  useFlowHomeContext,
  isPlanDirty,
} from "../../entities/flow-home/flow-home-context";
import {
  type CostScheduleSeason,
  type CostScheduleDay,
  type DayOfWeek,
} from "../../entities/flow-home/cost-schedule";
import { SeasonEditor } from "../../views/flow-home/SeasonEditor";
import { DayScheduleEditor } from "../../views/flow-home/DayScheduleEditor";
import { useUnsavedPlanGuard } from "../../views/flow-home/UnsavedPlanGuard";

export const Route = createLazyFileRoute("/flow-home/cost-schedule")({
  component: CostScheduleStep,
});

function CostScheduleStep() {
  const { inputs, dispatch } = useFlowHomeContext();
  const { plan, savedPlans, activePlanId } = inputs;
  const navigate = useNavigate();
  const { guardNavigate } = useUnsavedPlanGuard();
  const dirty = isPlanDirty(inputs);

  const handleUpdateSeason = (index: number, season: CostScheduleSeason) => {
    dispatch({ type: "updateSeason", index, season });
  };

  const handleAddSeason = (season: CostScheduleSeason) => {
    dispatch({ type: "addSeason", season });
  };

  const handleRemoveSeason = (index: number) => {
    dispatch({ type: "removeSeason", index });
  };

  const handleUpdateDay = (
    seasonIndex: number,
    day: DayOfWeek,
    schedule: CostScheduleDay,
  ) => {
    dispatch({ type: "updateDaySchedule", seasonIndex, day, schedule });
  };

  const handleApplyToMultiple = (
    seasonIndex: number,
    sourceDay: DayOfWeek,
    targetDays: DayOfWeek[],
  ) => {
    dispatch({
      type: "applyScheduleToDays",
      seasonIndex,
      sourceDay,
      targetDays,
    });
  };

  const hasSavedPlans = savedPlans.length > 0;
  // Duplicate only makes sense when there's something substantive to copy.
  const canDuplicate = Boolean(plan.name) || plan.seasons.length > 0;

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
        <Heading size="5">Rate Plan</Heading>
        <Text as="p" size="2" color="gray">
          Define your utility's time-of-use rate plan. Start with the plan name,
          then set up the seasonal date ranges, time blocks, and day-of-week
          schedules. If you want to compare multiple plans, create them here.
        </Text>

        {/* Plan selector + actions */}
        <Flex direction="row" align="end" gap="2" wrap="wrap">
          <Flex
            direction="column"
            gap="1"
            flexGrow="1"
            style={{ maxWidth: "20rem" }}
          >
            <Flex align="center" gap="2">
              <Text as="label" size="2" color="gray">
                Plan Name
              </Text>
              {dirty && (
                <Badge color="amber" variant="soft" size="1">
                  Unsaved
                </Badge>
              )}
            </Flex>
            <TextField.Root
              size="2"
              variant="surface"
              placeholder="e.g. TOU-D-Prime, Summer Peak Plan"
              value={plan.name}
              onChange={(e) =>
                dispatch({ type: "setPlanName", name: e.target.value })
              }
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text as="label" size="2" color="gray">
              Saved plans
            </Text>
            <Select.Root
              size="2"
              value={activePlanId ?? ""}
              onValueChange={(id) =>
                guardNavigate(() => dispatch({ type: "switchPlan", id }))
              }
              disabled={!hasSavedPlans}
            >
              <Select.Trigger
                placeholder={hasSavedPlans ? "Select plan" : "No saved plans"}
                style={{ minWidth: "12rem" }}
              />
              <Select.Content>
                {savedPlans.map((sp) => (
                  <Select.Item key={sp.id} value={sp.id}>
                    {sp.plan.name || "Unnamed Plan"}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button size="2" variant="soft">
                <PlusIcon />
                New
                <ChevronDownIcon />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                onSelect={() =>
                  guardNavigate(() => dispatch({ type: "newPlan" }))
                }
              >
                Blank plan
              </DropdownMenu.Item>
              <DropdownMenu.Item
                disabled={!canDuplicate}
                onSelect={() =>
                  guardNavigate(() => dispatch({ type: "duplicatePlan" }))
                }
              >
                Duplicate current
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <Box flexGrow="1" />

          <Button
            size="2"
            variant="solid"
            disabled={!plan.name || !dirty}
            onClick={() => dispatch({ type: "savePlan" })}
          >
            {dirty ? "Save" : "Saved"}
          </Button>
        </Flex>

        <Separator size="4" style={{ width: "100%" }} />

        {/* Seasons with inline day schedule editors */}
        <SeasonEditor
          seasons={plan.seasons}
          onUpdateSeason={handleUpdateSeason}
          onAddSeason={handleAddSeason}
          onRemoveSeason={handleRemoveSeason}
          renderSchedule={(seasonIndex) => (
            <DayScheduleEditor
              week={plan.seasons[seasonIndex].week}
              onUpdateDay={(day, schedule) =>
                handleUpdateDay(seasonIndex, day, schedule)
              }
              onApplyToMultiple={(sourceDay, targetDays) =>
                handleApplyToMultiple(seasonIndex, sourceDay, targetDays)
              }
            />
          )}
        />

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
            onClick={() => guardNavigate(() => navigate({ to: "/flow-home" }))}
            style={{
              transition: "width 0.5s ease-in-out, opacity 0.5s ease-in-out",
            }}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={!plan.name || plan.seasons.length === 0}
            onClick={() =>
              guardNavigate(() => navigate({ to: "/flow-home/usage" }))
            }
            style={{
              transition: "width 0.5s ease-in-out, opacity 0.5s ease-in-out",
            }}
          >
            Next
          </Button>
        </Box>
      </Box>
    </LeftGrow>
  );
}
