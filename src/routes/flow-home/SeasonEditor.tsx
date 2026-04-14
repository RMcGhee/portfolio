import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Select,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  type CostScheduleSeason,
  type Month,
  MONTHS,
  MONTH_LABELS,
  JANUARY,
  DECEMBER,
  defaultCostScheduleWeek,
} from "../../entities/flow-home/cost-schedule";

type SeasonEditorProps = {
  seasons: CostScheduleSeason[];
  onUpdateSeason: (index: number, season: CostScheduleSeason) => void;
  onAddSeason: (season: CostScheduleSeason) => void;
  onRemoveSeason: (index: number) => void;
};

export function SeasonEditor({
  seasons,
  onUpdateSeason,
  onAddSeason,
  onRemoveSeason,
}: SeasonEditorProps) {
  const [showDayInputs, setShowDayInputs] = useState<Record<number, boolean>>(
    {},
  );

  const toggleDayInputs = (index: number) => {
    setShowDayInputs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleNameChange = (index: number, name: string) => {
    onUpdateSeason(index, { ...seasons[index], name });
  };

  const handleStartMonthChange = (index: number, month: Month) => {
    const season = seasons[index];
    onUpdateSeason(index, {
      ...season,
      start: { ...season.start, month },
    });
  };

  const handleEndMonthChange = (index: number, month: Month) => {
    const season = seasons[index];
    onUpdateSeason(index, {
      ...season,
      end: { ...season.end, month },
    });
  };

  const handleStartDayChange = (index: number, value: string) => {
    const parsed = parseInt(value, 10);
    const season = seasons[index];
    onUpdateSeason(index, {
      ...season,
      start: {
        ...season.start,
        day: isNaN(parsed) ? undefined : Math.min(31, Math.max(1, parsed)),
      },
    });
  };

  const handleEndDayChange = (index: number, value: string) => {
    const parsed = parseInt(value, 10);
    const season = seasons[index];
    onUpdateSeason(index, {
      ...season,
      end: {
        ...season.end,
        day: isNaN(parsed) ? undefined : Math.min(31, Math.max(1, parsed)),
      },
    });
  };

  const handleAddSeason = () => {
    onAddSeason({
      name: "",
      start: { month: JANUARY, day: 1 },
      end: { month: DECEMBER, day: 31 },
      week: defaultCostScheduleWeek(),
    });
  };

  return (
    <Flex direction="column" gap="4">
      <Heading size="4">Seasons</Heading>
      <Text size="2" color="gray">
        Define the time periods your utility rate schedule covers. Seasons
        should cover the full year with no gaps.
      </Text>

      <Flex direction="column" gap="3">
        {seasons.map((season, index) => (
          <Card key={index} style={{ padding: "16px" }}>
            <Flex direction="column" gap="3">
              {/* Season name */}
              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="medium">
                  Season Name
                </Text>
                <TextField.Root
                  size="2"
                  variant="surface"
                  placeholder="e.g. Summer, Winter"
                  value={season.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleNameChange(index, e.target.value)
                  }
                />
              </Flex>

              {/* Month range selects */}
              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="medium">
                  Month Range
                </Text>
                <Flex align="center" gap="3">
                  <Select.Root
                    size="2"
                    value={String(season.start.month)}
                    onValueChange={(value: string) =>
                      handleStartMonthChange(index, Number(value) as Month)
                    }
                  >
                    <Select.Trigger
                      placeholder="Start month"
                      style={{ minWidth: "120px" }}
                    />
                    <Select.Content>
                      {MONTHS.map((m) => (
                        <Select.Item key={m} value={String(m)}>
                          {MONTH_LABELS[m]}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>

                  <Text size="2" color="gray">
                    to
                  </Text>

                  <Select.Root
                    size="2"
                    value={String(season.end.month)}
                    onValueChange={(value: string) =>
                      handleEndMonthChange(index, Number(value) as Month)
                    }
                  >
                    <Select.Trigger
                      placeholder="End month"
                      style={{ minWidth: "120px" }}
                    />
                    <Select.Content>
                      {MONTHS.map((m) => (
                        <Select.Item key={m} value={String(m)}>
                          {MONTH_LABELS[m]}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Flex>

              {/* Day toggle and inputs */}
              <Box>
                <Text
                  size="1"
                  color="purple"
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => toggleDayInputs(index)}
                >
                  {showDayInputs[index]
                    ? "Hide specific days"
                    : "Set specific day"}
                </Text>

                {showDayInputs[index] && (
                  <Flex align="center" gap="3" mt="2">
                    <Flex direction="column" gap="1">
                      <Text size="1" color="gray">
                        Start Day
                      </Text>
                      <TextField.Root
                        size="2"
                        variant="surface"
                        placeholder="1"
                        inputMode="numeric"
                        maxLength={2}
                        value={
                          season.start.day !== undefined
                            ? String(season.start.day)
                            : ""
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleStartDayChange(index, e.target.value)
                        }
                        style={{ width: "64px" }}
                      />
                    </Flex>

                    <Text size="2" color="gray" style={{ marginTop: "18px" }}>
                      to
                    </Text>

                    <Flex direction="column" gap="1">
                      <Text size="1" color="gray">
                        End Day
                      </Text>
                      <TextField.Root
                        size="2"
                        variant="surface"
                        placeholder="31"
                        inputMode="numeric"
                        maxLength={2}
                        value={
                          season.end.day !== undefined
                            ? String(season.end.day)
                            : ""
                        }
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleEndDayChange(index, e.target.value)
                        }
                        style={{ width: "64px" }}
                      />
                    </Flex>
                  </Flex>
                )}
              </Box>

              {/* Remove button */}
              {seasons.length > 1 && (
                <>
                  <Separator size="4" />
                  <Flex justify="end">
                    <Button
                      size="1"
                      variant="soft"
                      color="red"
                      onClick={() => onRemoveSeason(index)}
                    >
                      🗑 Remove
                    </Button>
                  </Flex>
                </>
              )}
            </Flex>
          </Card>
        ))}
      </Flex>

      <Box>
        <Button size="2" variant="soft" onClick={handleAddSeason}>
          + Add Season
        </Button>
      </Box>
    </Flex>
  );
}