import {
  Box,
  Button,
  Flex,
  Heading,
  Select,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { LeftGrow } from "../../common/Basic";
import { useFlowHomeContext } from "../../entities/flow-home/flow-home-context";
import {
  type CostScheduleSeason,
  type CostScheduleDay,
  type DayOfWeek,
} from "../../entities/flow-home/cost-schedule";
import { SeasonEditor } from "../../views/flow-home/SeasonEditor";
import { DayScheduleEditor } from "../../views/flow-home/DayScheduleEditor";

export const Route = createLazyFileRoute("/flow-home/cost-schedule")({
  component: CostScheduleStep,
});

function CostScheduleStep() {
  const { inputs, dispatch } = useFlowHomeContext();
  const { plan, savedPlans, activePlanId } = inputs;

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

  const handlePlanSelect = (value: string) => {
    if (value === "__new__") {
      dispatch({ type: "newPlan" });
    } else if (value === "__duplicate__") {
      dispatch({ type: "duplicatePlan" });
    } else {
      dispatch({ type: "switchPlan", id: value });
    }
  };

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
        <Heading size="5">Rate Schedule</Heading>
        <Text as="p" size="2" color="gray">
          Define your utility's time-of-use rate plan. Start with the plan name,
          then set up the seasonal date ranges, time blocks, and day-of-week
          schedules.
        </Text>

        {/* Plan selector + Save */}
        <Flex direction="row" align="end" gap="2">
          <Flex
            direction="column"
            gap="1"
            flexGrow="1"
            style={{ maxWidth: "20rem" }}
          >
            <Text as="label" size="2" color="gray">
              Plan Name
            </Text>
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

          <Select.Root
            size="2"
            value={activePlanId ?? "__new__"}
            onValueChange={handlePlanSelect}
          >
            <Select.Trigger placeholder="Select plan" />
            <Select.Content>
              {savedPlans.length > 0 && (
                <>
                  {savedPlans.map((sp) => (
                    <Select.Item key={sp.id} value={sp.id}>
                      {sp.plan.name || "Unnamed Plan"}
                    </Select.Item>
                  ))}
                  <Select.Separator />
                </>
              )}
              <Select.Item value="__new__">+ New Plan</Select.Item>
              <Select.Item value="__duplicate__">
                + Duplicate Current
              </Select.Item>
            </Select.Content>
          </Select.Root>

          <Button
            size="2"
            variant="solid"
            disabled={!plan.name}
            onClick={() => dispatch({ type: "savePlan" })}
          >
            Save
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
            asChild
            style={{
              transition: "width 0.5s ease-in-out, opacity 0.5s ease-in-out",
            }}
          >
            <Link to="/flow-home">Previous</Link>
          </Button>
          <Button
            variant="outline"
            asChild
            disabled={!plan.name || plan.seasons.length === 0}
            style={{
              transition: "width 0.5s ease-in-out, opacity 0.5s ease-in-out",
            }}
          >
            <Link to="/flow-home/usage">Next</Link>
          </Button>
        </Box>
      </Box>
    </LeftGrow>
  );
}
