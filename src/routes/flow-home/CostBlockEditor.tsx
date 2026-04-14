import { useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  IconButton,
  SegmentedControl,
  Separator,
  Slider,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  type CostBlock,
  type CostScheduleDay,
} from "../../entities/flow-home/cost-schedule";

type CostBlockEditorProps = {
  schedule: CostScheduleDay;
  onChange: (updated: CostScheduleDay) => void;
};

// Total minutes in a day (0000–2400)
const DAY_MINUTES = 24 * 60;
const MIN_BLOCK_MINUTES = 15;

type StepSize = "60" | "30" | "15";

/** Parse a "HHmm" string into total minutes (e.g. "1430" → 870). */
function timeToMinutes(t: string): number {
  return parseInt(t.slice(0, 2), 10) * 60 + parseInt(t.slice(2, 4), 10);
}

/** Convert total minutes back to "HHmm" format. */
function minutesToTime(m: number): string {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return String(hh).padStart(2, "0") + String(mm).padStart(2, "0");
}

/** Format minutes as a short time label, e.g. 870 → "2:30p" */
function formatTimeShort(minutes: number): string {
  if (minutes === DAY_MINUTES) return "12a";
  const h24 = Math.floor(minutes / 60);
  const mm = minutes % 60;
  const suffix = h24 >= 12 ? "p" : "a";
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  if (mm === 0) return `${h12}${suffix}`;
  return `${h12}:${String(mm).padStart(2, "0")}${suffix}`;
}

/** Format minutes as a readable time label, e.g. 870 → "2:30 PM" */
function formatTimeLabel(minutes: number): string {
  if (minutes === DAY_MINUTES) return "12:00 AM";
  const h24 = Math.floor(minutes / 60);
  const mm = minutes % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
}

/** Check if a string is a valid partial or complete decimal input */
function isValidPriceInput(value: string): boolean {
  return /^\d*\.?\d*$/.test(value);
}

/**
 * Given a set of blocks, detect gaps in the 0000–2400 range and fill them
 * with new default blocks. Also trims overlaps and ensures correct ordering.
 * Returns a clean, sorted, contiguous block array.
 */
function ensureContiguousCoverage(blocks: CostBlock[]): CostBlock[] {
  if (blocks.length === 0) {
    return [{ start: "0000", end: "2400", pricePerKwh: 0, label: "" }];
  }

  const sorted = [...blocks].sort(
    (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
  );

  const result: CostBlock[] = [];
  let cursor = 0;

  for (const block of sorted) {
    const startMin = timeToMinutes(block.start);
    const endMin = timeToMinutes(block.end);

    if (endMin <= startMin) continue;

    if (startMin > cursor) {
      result.push({
        start: minutesToTime(cursor),
        end: minutesToTime(startMin),
        pricePerKwh: 0,
        label: "",
      });
    }

    const adjustedStart = Math.max(startMin, cursor);
    if (endMin > adjustedStart) {
      result.push({
        ...block,
        start: minutesToTime(adjustedStart),
        end: minutesToTime(endMin),
      });
      cursor = endMin;
    }
  }

  if (cursor < DAY_MINUTES) {
    result.push({
      start: minutesToTime(cursor),
      end: "2400",
      pricePerKwh: 0,
      label: "",
    });
  }

  return result;
}

/** Hour markers for the gridlines */
const HOUR_MARKERS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];
const THUMB_HALF_W = 5.5; // inset so gridlines align with slider thumb centers

export function CostBlockEditor({ schedule, onChange }: CostBlockEditorProps) {
  const [localPrices, setLocalPrices] = useState<
    Record<string, string | undefined>
  >({});
  const [stepSize, setStepSize] = useState<StepSize>("60");

  const focusedPriceRef = useRef<string | null>(null);

  const { blocks } = schedule;
  const stepMinutes = parseInt(stepSize, 10);

  const updateBlocks = useCallback(
    (newBlocks: CostBlock[]) => {
      onChange({ blocks: newBlocks });
    },
    [onChange],
  );

  function priceKey(index: number): string {
    return `price-${index}`;
  }

  function handlePriceChange(index: number, value: string) {
    if (!isValidPriceInput(value)) return;
    const key = priceKey(index);
    setLocalPrices((prev) => ({ ...prev, [key]: value }));

    const parsed = parseFloat(value);
    const newBlocks = blocks.map((b) => ({ ...b }));
    newBlocks[index] = {
      ...newBlocks[index],
      pricePerKwh: isNaN(parsed) ? 0 : parsed,
    };
    updateBlocks(newBlocks);
  }

  function handlePriceFocus(index: number) {
    focusedPriceRef.current = priceKey(index);
  }

  function handlePriceBlur(index: number) {
    const key = priceKey(index);
    focusedPriceRef.current = null;
    setLocalPrices((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleLabelChange(index: number, value: string) {
    const newBlocks = blocks.map((b) => ({ ...b }));
    newBlocks[index] = { ...newBlocks[index], label: value };
    updateBlocks(newBlocks);
  }

  function handleSliderChange(index: number, value: number[]) {
    const [newStartMin, newEndMin] = value;
    const newBlocks = blocks.map((b) => ({ ...b }));
    const block = newBlocks[index];
    const oldStartMin = timeToMinutes(block.start);
    const oldEndMin = timeToMinutes(block.end);

    if (newEndMin - newStartMin < MIN_BLOCK_MINUTES) return;

    newBlocks[index] = {
      ...block,
      start: minutesToTime(newStartMin),
      end: minutesToTime(newEndMin),
    };

    if (index > 0) {
      const prevEnd = timeToMinutes(newBlocks[index - 1].end);
      if (newStartMin < prevEnd) {
        if (prevEnd - newStartMin < MIN_BLOCK_MINUTES) return;
      }
      if (newStartMin !== oldStartMin) {
        newBlocks[index - 1] = {
          ...newBlocks[index - 1],
          end: minutesToTime(newStartMin),
        };
      }
    }

    if (index < newBlocks.length - 1) {
      const nextStart = timeToMinutes(newBlocks[index + 1].start);
      if (newEndMin > nextStart) {
        if (
          timeToMinutes(newBlocks[index + 1].end) - newEndMin <
          MIN_BLOCK_MINUTES
        )
          return;
      }
      if (newEndMin !== oldEndMin) {
        newBlocks[index + 1] = {
          ...newBlocks[index + 1],
          start: minutesToTime(newEndMin),
        };
      }
    }

    updateBlocks(newBlocks);
  }

  function handleSliderCommit(index: number, value: number[]) {
    const [newStartMin, newEndMin] = value;
    const newBlocks = blocks.map((b) => ({ ...b }));
    const block = newBlocks[index];
    const oldStartMin = timeToMinutes(block.start);
    const oldEndMin = timeToMinutes(block.end);

    if (newEndMin - newStartMin < MIN_BLOCK_MINUTES) return;

    newBlocks[index] = {
      ...block,
      start: minutesToTime(newStartMin),
      end: minutesToTime(newEndMin),
    };

    if (index > 0 && newStartMin !== oldStartMin) {
      newBlocks[index - 1] = {
        ...newBlocks[index - 1],
        end: minutesToTime(newStartMin),
      };
    }

    if (index < newBlocks.length - 1 && newEndMin !== oldEndMin) {
      newBlocks[index + 1] = {
        ...newBlocks[index + 1],
        start: minutesToTime(newEndMin),
      };
    }

    const contiguous = ensureContiguousCoverage(newBlocks);
    updateBlocks(contiguous);
  }

  function handleAddBlock() {
    const newBlocks = blocks.map((b) => ({ ...b }));
    const lastBlock = newBlocks[newBlocks.length - 1];
    const lastStartMin = timeToMinutes(lastBlock.start);
    const lastEndMin = timeToMinutes(lastBlock.end);
    const span = lastEndMin - lastStartMin;

    let splitPoint: number;
    if (span > 120) {
      const mid = lastStartMin + Math.floor(span / 2);
      const rounded = Math.round(mid / 30) * 30;
      splitPoint = Math.max(
        lastStartMin + MIN_BLOCK_MINUTES,
        Math.min(rounded, lastEndMin - MIN_BLOCK_MINUTES),
      );
    } else if (span > MIN_BLOCK_MINUTES * 2) {
      splitPoint = lastStartMin + Math.floor(span / 2);
    } else {
      let largestIdx = 0;
      let largestSpan = 0;
      for (let i = 0; i < newBlocks.length; i++) {
        const s =
          timeToMinutes(newBlocks[i].end) - timeToMinutes(newBlocks[i].start);
        if (s > largestSpan) {
          largestSpan = s;
          largestIdx = i;
        }
      }
      if (largestSpan <= MIN_BLOCK_MINUTES * 2) return;

      const target = newBlocks[largestIdx];
      const tStart = timeToMinutes(target.start);
      const tEnd = timeToMinutes(target.end);
      const mid = Math.round((tStart + tEnd) / 2 / 15) * 15;
      const safeMid = Math.max(
        tStart + MIN_BLOCK_MINUTES,
        Math.min(mid, tEnd - MIN_BLOCK_MINUTES),
      );

      const firstHalf: CostBlock = { ...target, end: minutesToTime(safeMid) };
      const secondHalf: CostBlock = {
        start: minutesToTime(safeMid),
        end: target.end,
        pricePerKwh: 0,
        label: "",
      };
      newBlocks.splice(largestIdx, 1, firstHalf, secondHalf);
      updateBlocks(newBlocks);
      return;
    }

    newBlocks[newBlocks.length - 1] = {
      ...lastBlock,
      end: minutesToTime(splitPoint),
    };
    newBlocks.push({
      start: minutesToTime(splitPoint),
      end: "2400",
      pricePerKwh: 0,
      label: "",
    });
    updateBlocks(newBlocks);
  }

  function handleRemoveBlock(index: number) {
    if (blocks.length <= 1) return;
    const newBlocks = blocks.map((b) => ({ ...b }));
    const removed = newBlocks[index];
    newBlocks.splice(index, 1);

    if (index > 0) {
      newBlocks[index - 1] = { ...newBlocks[index - 1], end: removed.end };
    } else if (newBlocks.length > 0) {
      newBlocks[0] = { ...newBlocks[0], start: removed.start };
    }

    setLocalPrices({});
    updateBlocks(newBlocks);
  }

  function getDisplayPrice(index: number, actual: number): string {
    const key = priceKey(index);
    if (localPrices[key] !== undefined) return localPrices[key]!;
    return actual === 0 ? "" : String(actual);
  }

  return (
    <Flex direction="column" gap="4">
      {/* ── Group 1: Labels & Prices ── */}
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium">
          Blocks
        </Text>
        <Text size="1" color="gray" mb="2">
          Name each time-of-use tier and set its price.
        </Text>
        <Flex direction="column" gap="2">
          {blocks.map((block, index) => {
            const startMin = timeToMinutes(block.start);
            const endMin = timeToMinutes(block.end);
            return (
              <Card key={index} size="1">
                <Flex direction="row" align="center" gap="2" wrap="wrap">
                  {/* Time range badge */}
                  <Text
                    size="1"
                    color="gray"
                    style={{
                      fontFamily: "monospace",
                      whiteSpace: "nowrap",
                      minWidth: 100,
                    }}
                  >
                    {formatTimeLabel(startMin)} – {formatTimeLabel(endMin)}
                  </Text>

                  {/* Label */}
                  <Box flexGrow="1" style={{ minWidth: 80 }}>
                    <TextField.Root
                      size="2"
                      variant="surface"
                      placeholder="Label (e.g. Peak)"
                      value={block.label}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleLabelChange(index, e.target.value)
                      }
                    />
                  </Box>

                  {/* Price */}
                  <TextField.Root
                    size="2"
                    variant="surface"
                    value={getDisplayPrice(index, block.pricePerKwh)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handlePriceChange(index, e.target.value)
                    }
                    onFocus={() => handlePriceFocus(index)}
                    onBlur={() => handlePriceBlur(index)}
                    placeholder="0.00"
                    inputMode="decimal"
                    style={{ width: 120, textAlign: "right" }}
                  >
                    <TextField.Slot side="left">
                      <Text size="1" color="gray">
                        $
                      </Text>
                    </TextField.Slot>
                    <TextField.Slot side="right">
                      <Text size="1" color="gray">
                        /kWh
                      </Text>
                    </TextField.Slot>
                  </TextField.Root>

                  {/* Remove */}
                  {blocks.length > 1 && (
                    <IconButton
                      size="1"
                      variant="ghost"
                      color="red"
                      onClick={() => handleRemoveBlock(index)}
                      style={{ cursor: "pointer" }}
                    >
                      ✕
                    </IconButton>
                  )}
                </Flex>
              </Card>
            );
          })}
        </Flex>

        <Box mt="2">
          <Button size="2" variant="soft" onClick={handleAddBlock}>
            + Add Block
          </Button>
        </Box>
      </Flex>

      <Separator size="4" />

      {/* ── Group 2: Sliders with hour gridlines ── */}
      <Flex direction="column" gap="1">
        <Flex justify="between" align="end">
          <Flex direction="column" gap="1">
            <Text size="2" weight="medium">
              Time Ranges
            </Text>
            <Text size="1" color="gray">
              Drag the handles to adjust each block's time range.
            </Text>
          </Flex>
          <Flex direction="column" gap="1" align="end">
            <Text size="1" color="gray">
              Slider precision
            </Text>
            <SegmentedControl.Root
              value={stepSize}
              onValueChange={(v) => setStepSize(v as StepSize)}
              size="1"
            >
              <SegmentedControl.Item value="60">1 hr</SegmentedControl.Item>
              <SegmentedControl.Item value="30">30 min</SegmentedControl.Item>
              <SegmentedControl.Item value="15">15 min</SegmentedControl.Item>
            </SegmentedControl.Root>
          </Flex>
        </Flex>

        {/*
         * The slider area: a container with hour gridlines drawn behind
         * all the sliders. Each slider sits in a row with its label.
         *
         * Layout:
         *   12a  2a  4a  6a  8a  10a  12p  2p  4p  6p  8p  10p  12a
         *    |    |   |   |   |    |    |    |   |   |   |    |    |
         *    ()========()------------------------------------------- Off Peak
         *    |    |   |   |   |    |    |    |   |   |   |    |    |
         *    ----------()==================()----------------------- Peak
         *    |    |   |   |   |    |    |    |   |   |   |    |    |
         *    etc.
         */}
        <Box
          style={{
            position: "relative",
            paddingTop: "24px", // room for hour labels
          }}
        >
          {/* Hour labels along the top */}
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: THUMB_HALF_W,
              right: THUMB_HALF_W,
              height: "20px",
            }}
          >
            {HOUR_MARKERS.map((h) => (
              <Text
                key={h}
                size="1"
                color="gray"
                style={{
                  position: "absolute",
                  left: `${(h / 24) * 100}%`,
                  transform: "translateX(-50%)",
                  fontSize: "10px",
                  userSelect: "none",
                }}
              >
                {formatTimeShort(h * 60)}
              </Text>
            ))}
          </Box>

          {/* Gridlines + slider rows */}
          <Box
            style={{
              position: "relative",
            }}
          >
            {/* Vertical gridlines behind everything */}
            <Box
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: THUMB_HALF_W,
                right: THUMB_HALF_W,
                pointerEvents: "none",
                zIndex: 0,
              }}
            >
              {HOUR_MARKERS.map((h) => (
                <Box
                  key={h}
                  style={{
                    position: "absolute",
                    left: `${(h / 24) * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: "1px",
                    backgroundColor:
                      h % 6 === 0
                        ? "var(--gray-a6)"
                        : "var(--gray-a3)",
                  }}
                />
              ))}
            </Box>

            {/* Slider rows */}
            <Flex direction="column" gap="3" style={{ position: "relative", zIndex: 1 }}>
              {blocks.map((block, index) => {
                const startMin = timeToMinutes(block.start);
                const endMin = timeToMinutes(block.end);
                const label = block.label || `Block ${index + 1}`;

                return (
                  <Flex
                    key={index}
                    direction="column"
                    gap="1"
                    style={{ padding: "4px 0" }}
                  >
                    {/* Time range + label above the slider */}
                    <Flex justify="between" align="center">
                      <Text size="1" color="gray" style={{ fontFamily: "monospace" }}>
                        {formatTimeLabel(startMin)}
                      </Text>
                      <Text size="1" weight="medium">
                        {label}
                      </Text>
                      <Text size="1" color="gray" style={{ fontFamily: "monospace" }}>
                        {formatTimeLabel(endMin)}
                      </Text>
                    </Flex>

                    <Slider
                      size="2"
                      variant="surface"
                      min={0}
                      max={DAY_MINUTES}
                      step={stepMinutes}
                      value={[startMin, endMin]}
                      onValueChange={(value) =>
                        handleSliderChange(index, value)
                      }
                      onValueCommit={(value) =>
                        handleSliderCommit(index, value)
                      }
                    />
                  </Flex>
                );
              })}
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
