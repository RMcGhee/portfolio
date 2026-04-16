import { useCallback, useRef, useState } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import {
  type Month,
  MONTHS,
  MONTH_LABELS,
} from "../../entities/flow-home/cost-schedule";

type MonthSelectorProps = {
  /** Currently selected months (array of 0–11 indices) */
  selectedMonths: Month[];
  /** Months that cannot be toggled (claimed by other seasons) */
  disabledMonths?: Month[];
  /** Called when the selection changes */
  onChange: (months: Month[]) => void;
};

/**
 * A horizontal row of 12 month cells. Click to toggle individual months.
 * Click and drag to toggle multiple months — all dragged-over months match
 * the first month's action (select if it was unselected, deselect if it was selected).
 */
export function MonthSelector({ selectedMonths, disabledMonths = [], onChange }: MonthSelectorProps) {
  const disabledSet = new Set(disabledMonths);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragMode, setDragMode] = useState<"select" | "deselect" | null>(null);
  const draggedMonthsRef = useRef<Set<Month>>(new Set());

  /** Resolve a pointer event to the month index it's over. */
  const monthFromPointer = useCallback(
    (e: React.PointerEvent | PointerEvent): Month | null => {
      const container = containerRef.current;
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const fraction = x / rect.width;
      const index = Math.floor(fraction * 12);
      if (index < 0 || index > 11) return null;
      return index as Month;
    },
    [],
  );

  const applyToggle = useCallback(
    (month: Month, mode: "select" | "deselect", current: Month[]): Month[] => {
      const set = new Set(current);
      if (mode === "select") {
        set.add(month);
      } else {
        set.delete(month);
      }
      return MONTHS.filter((m) => set.has(m));
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const month = monthFromPointer(e);
      if (month === null || disabledSet.has(month)) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      const isSelected = selectedMonths.includes(month);
      const mode = isSelected ? "deselect" : "select";

      setDragMode(mode);
      draggedMonthsRef.current = new Set([month]);

      const updated = applyToggle(month, mode, selectedMonths);
      onChange(updated);
    },
    [monthFromPointer, selectedMonths, onChange, applyToggle, disabledSet],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragMode === null) return;
      const month = monthFromPointer(e);
      if (month === null || disabledSet.has(month)) return;
      if (draggedMonthsRef.current.has(month)) return;

      draggedMonthsRef.current.add(month);
      const updated = applyToggle(month, dragMode, selectedMonths);
      onChange(updated);
    },
    [dragMode, monthFromPointer, selectedMonths, onChange, applyToggle, disabledSet],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (dragMode === null) return;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture may have already been released
      }
      setDragMode(null);
      draggedMonthsRef.current = new Set();
    },
    [dragMode],
  );

  const selectedSet = new Set(selectedMonths);

  return (
    <Flex
      ref={containerRef}
      direction="row"
      style={{
        userSelect: "none",
        touchAction: "none",
        cursor: "pointer",
        borderRadius: "var(--radius-2)",
        overflow: "hidden",
        border: "1px solid var(--gray-a5)",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {MONTHS.map((m) => {
        const selected = selectedSet.has(m);
        const disabled = disabledSet.has(m);

        return (
          <Box
            key={m}
            flexGrow="1"
            style={{
              padding: "6px 0",
              textAlign: "center",
              backgroundColor: disabled
                ? "var(--gray-a3)"
                : selected
                  ? "var(--accent-a4)"
                  : "transparent",
              borderLeft: m === 0 ? "none" : "1px solid var(--gray-a3)",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            <Text
              size="1"
              style={{
                color: disabled
                  ? "var(--gray-a7)"
                  : selected
                    ? "var(--accent-11)"
                    : "var(--gray-9)",
                fontSize: "11px",
                pointerEvents: "none",
              }}
            >
              {MONTH_LABELS[m]}
            </Text>
          </Box>
        );
      })}
    </Flex>
  );
}