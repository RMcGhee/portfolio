import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  type CostScheduleSeason,
  type Month,
  MONTHS,
  defaultCostScheduleWeek,
} from "../../entities/flow-home/cost-schedule";
import { MonthSelector } from "./MonthSelector";

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
  const handleNameChange = (index: number, name: string) => {
    onUpdateSeason(index, { ...seasons[index], name });
  };

  const handleMonthsChange = (index: number, months: Month[]) => {
    const season = seasons[index];
    onUpdateSeason(index, { ...season, months });
  };

  const handleAddSeason = () => {
    const usedMonths = new Set(seasons.flatMap((s) => s.months));
    const remainingMonths = MONTHS.filter((m) => !usedMonths.has(m));
    onAddSeason({
      name: "",
      months: remainingMonths,
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
                <Flex justify="between" align="center">
                  <Text as="label" size="2" weight="medium">
                    Season Name
                  </Text>
                  {seasons.length > 1 && (
                    <Button
                      size="1"
                      variant="soft"
                      color="red"
                      onClick={() => onRemoveSeason(index)}
                    >
                      🗑 Remove
                    </Button>
                  )}
                </Flex>
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

              {/* Month range selector */}
              <Flex direction="column" gap="1">
                <Text as="label" size="2" weight="medium">
                  Months
                </Text>
                <MonthSelector
                  selectedMonths={season.months}
                  disabledMonths={seasons
                    .filter((_, i) => i !== index)
                    .flatMap((s) => s.months)}
                  onChange={(months) => handleMonthsChange(index, months)}
                />
              </Flex>


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
