import { Box, Button, Card, Flex, Heading, Separator, Text, TextField } from "@radix-ui/themes";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { LeftGrow } from "../../common/Basic";
import { useFlowHomeContext } from "../../entities/flow-home/flow-home-context";
import {
  type CostScheduleSeason,
  type CostScheduleDay,
  type DayOfWeek,
  MONTH_LABELS,
} from "../../entities/flow-home/cost-schedule";
import { SeasonEditor } from "./SeasonEditor";
import { DayScheduleEditor } from "./DayScheduleEditor";

export const Route = createLazyFileRoute("/flow-home/cost-schedule")({
  component: CostScheduleStep,
});

function seasonDateLabel(season: CostScheduleSeason): string {
  const startMonth = MONTH_LABELS[season.start.month];
  const endMonth = MONTH_LABELS[season.end.month];
  const startDay = season.start.day ?? 1;
  const endDay = season.end.day ?? "";
  return `${startMonth} ${startDay} – ${endMonth}${endDay ? ` ${endDay}` : ""}`;
}

function CostScheduleStep() {
  const { inputs, dispatch } = useFlowHomeContext();
  const { plan } = inputs;

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
        {/* Plan Name */}
        <Heading size="5">Rate Schedule</Heading>
        <Text as="p" size="2" color="gray">
          Define your utility's time-of-use rate plan. Start with the plan name,
          then set up the seasonal date ranges, time blocks, and day-of-week
          schedules.
        </Text>

        <Flex direction="column" gap="1">
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

        <Separator size="4" style={{ width: "100%" }} />

        {/* Step 1: Seasons */}
        <SeasonEditor
          seasons={plan.seasons}
          onUpdateSeason={handleUpdateSeason}
          onAddSeason={handleAddSeason}
          onRemoveSeason={handleRemoveSeason}
        />

        <Separator size="4" style={{ width: "100%" }} />

        {/* Step 2 & 3: Daily schedules for each season, shown inline */}
        <Heading size="4">Time Blocks & Day Schedules</Heading>

        {plan.seasons.length === 0 ? (
          <Text as="p" size="2" color="red">
            Add at least one season above to configure time blocks.
          </Text>
        ) : (
          <Flex direction="column" gap="4">
            {plan.seasons.map((season, seasonIndex) => (
              <Card
                key={seasonIndex}
                style={{
                  padding: "16px",
                  border: "1px solid var(--gray-a5)",
                }}
              >
                <Flex direction="column" gap="3">
                  <Flex direction="column" gap="1">
                    <Heading size="3">
                      {season.name || `Season ${seasonIndex + 1}`}
                    </Heading>
                    <Text size="1" color="gray">
                      {seasonDateLabel(season)}
                    </Text>
                  </Flex>

                  <DayScheduleEditor
                    week={season.week}
                    onUpdateDay={(day, schedule) =>
                      handleUpdateDay(seasonIndex, day, schedule)
                    }
                    onApplyToMultiple={(sourceDay, targetDays) =>
                      handleApplyToMultiple(
                        seasonIndex,
                        sourceDay,
                        targetDays,
                      )
                    }
                  />
                </Flex>
              </Card>
            ))}
          </Flex>
        )}

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
            disabled={!plan.name || plan.seasons.length === 0}
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