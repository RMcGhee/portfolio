import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  SegmentedControl,
  Tabs,
  Text,
} from "@radix-ui/themes";
import {
  type CostScheduleDay,
  type CostScheduleWeek,
  type DayOfWeek,
  DAYS_OF_WEEK,
  DAY_LABELS,
  DAY_LABELS_FULL,
  WEEKDAYS,
  WEEKEND,
  MONDAY,
  SUNDAY,
  SATURDAY,
} from "../../entities/flow-home/cost-schedule";
import { CostBlockEditor } from "./CostBlockEditor";

type DayScheduleEditorProps = {
  week: CostScheduleWeek;
  onUpdateDay: (day: DayOfWeek, schedule: CostScheduleDay) => void;
  onApplyToMultiple: (sourceDay: DayOfWeek, targetDays: DayOfWeek[]) => void;
};

type DayMode = "weekday-weekend" | "all-days";

/** In Weekday/Weekend mode, these are the two tab values. */
const GROUPED_TABS = [
  { value: "weekday", label: "Weekday", representative: MONDAY },
  { value: "weekend", label: "Weekend", representative: SATURDAY },
] as const;

export function DayScheduleEditor({
  week,
  onUpdateDay,
  onApplyToMultiple,
}: DayScheduleEditorProps) {
  const [dayMode, setDayMode] = useState<DayMode>("weekday-weekend");
  const [allDaysTab, setAllDaysTab] = useState<string>(String(MONDAY));
  const [groupedTab, setGroupedTab] = useState<string>("weekday");

  /** The currently selected DayOfWeek for the active tab. */
  function getSelectedDay(): DayOfWeek {
    if (dayMode === "all-days") {
      return Number(allDaysTab) as DayOfWeek;
    }
    const group = GROUPED_TABS.find((g) => g.value === groupedTab);
    return group ? group.representative : MONDAY;
  }

  /** When editing in weekday/weekend mode, update the representative day
   *  and also apply to all days in the group. */
  function handleGroupedChange(updated: CostScheduleDay) {
    const group = GROUPED_TABS.find((g) => g.value === groupedTab);
    if (!group) return;

    const targetDays =
      group.value === "weekday" ? WEEKDAYS : WEEKEND;

    // Update the representative day
    onUpdateDay(group.representative, updated);

    // Apply to all other days in the group
    const otherDays = targetDays.filter((d) => d !== group.representative);
    if (otherDays.length > 0) {
      onApplyToMultiple(group.representative, otherDays);
    }
  }

  function handleAllDaysChange(updated: CostScheduleDay) {
    const day = Number(allDaysTab) as DayOfWeek;
    onUpdateDay(day, updated);
  }

  const selectedDay = getSelectedDay();

  return (
    <Flex direction="column" gap="4">
      {/* Mode toggle */}
      <Flex direction="column" gap="2">
        <Text size="2" color="gray">
          Schedule mode
        </Text>
        <SegmentedControl.Root
          value={dayMode}
          onValueChange={(value) => setDayMode(value as DayMode)}
        >
          <SegmentedControl.Item value="weekday-weekend">
            Weekday / Weekend
          </SegmentedControl.Item>
          <SegmentedControl.Item value="all-days">
            All Days
          </SegmentedControl.Item>
        </SegmentedControl.Root>
      </Flex>

      {/* Weekday/Weekend mode */}
      {dayMode === "weekday-weekend" && (
        <Tabs.Root value={groupedTab} onValueChange={setGroupedTab}>
          <Tabs.List size="2">
            {GROUPED_TABS.map((group) => (
              <Tabs.Trigger key={group.value} value={group.value}>
                {group.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Box pt="3">
            {GROUPED_TABS.map((group) => (
              <Tabs.Content key={group.value} value={group.value}>
                <Text size="1" color="gray" mb="3" as="p">
                  Editing schedule for{" "}
                  {group.value === "weekday"
                    ? "Monday – Friday"
                    : "Saturday & Sunday"}
                  . Changes apply to all{" "}
                  {group.value === "weekday" ? "weekdays" : "weekend days"}.
                </Text>
                <CostBlockEditor
                  schedule={week[group.representative]}
                  onChange={handleGroupedChange}
                />
              </Tabs.Content>
            ))}
          </Box>
        </Tabs.Root>
      )}

      {/* All Days mode */}
      {dayMode === "all-days" && (
        <Tabs.Root value={allDaysTab} onValueChange={setAllDaysTab}>
          <Tabs.List size="2" wrap="wrap">
            {DAYS_OF_WEEK.map((day) => (
              <Tabs.Trigger key={day} value={String(day)}>
                {DAY_LABELS[day]}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Box pt="3">
            {DAYS_OF_WEEK.map((day) => (
              <Tabs.Content key={day} value={String(day)}>
                <Text size="1" color="gray" mb="3" as="p">
                  Editing schedule for {DAY_LABELS_FULL[day]}.
                </Text>
                <CostBlockEditor
                  schedule={week[day]}
                  onChange={handleAllDaysChange}
                />
              </Tabs.Content>
            ))}
          </Box>
        </Tabs.Root>
      )}

      {/* Copy schedule to other days */}
      <Box>
        <Text size="2" as="p" mb="2">
          Apply {DAY_LABELS_FULL[selectedDay]}'s schedule to:
        </Text>
        <Flex direction="row" gap="2" wrap="wrap">
          <Button
            variant="soft"
            size="1"
            onClick={() =>
              onApplyToMultiple(
                selectedDay,
                WEEKDAYS.filter((d) => d !== selectedDay),
              )
            }
          >
            All Weekdays
          </Button>
          <Button
            variant="soft"
            size="1"
            onClick={() =>
              onApplyToMultiple(
                selectedDay,
                WEEKEND.filter((d) => d !== selectedDay),
              )
            }
          >
            Weekends
          </Button>
          <Button
            variant="soft"
            size="1"
            onClick={() =>
              onApplyToMultiple(
                selectedDay,
                DAYS_OF_WEEK.filter((d) => d !== selectedDay),
              )
            }
          >
            All Days
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}