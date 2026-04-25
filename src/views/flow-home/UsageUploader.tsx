import { useRef, useMemo, useState } from "react";
import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Table,
  Text,
} from "@radix-ui/themes";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import Papa from "papaparse";
import {
  type DateTimeUsage,
  type GapInfo,
  type UsageUnit,
} from "../../entities/flow-home/cost-schedule";

// ── CSV format ────────────────────────────────────────────────────────────────

const EXPECTED_COLUMNS = [
  "TYPE",
  "DATE",
  "START TIME",
  "END TIME",
  "USAGE",
  "UNITS",
  "COST",
  "NOTES",
] as const;

function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

type ParseResult = {
  data: DateTimeUsage[];
};

function parseUsageCSV(text: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new Error(`Parse error: ${result.errors[0].message}`);
  }

  const fields = result.meta.fields ?? [];
  const missingCols = EXPECTED_COLUMNS.filter((c) => !fields.includes(c));
  if (missingCols.length > 0) {
    throw new Error(
      "Unrecognized file format. Expected columns: TYPE, DATE, START TIME, END TIME, USAGE, UNITS, COST, NOTES.",
    );
  }

  const rows = result.data;
  if (rows.length === 0) throw new Error("File contains no data rows.");

  const data: DateTimeUsage[] = rows.map((row, i) => {
    const date = row["DATE"];
    const startTime = row["START TIME"];
    const endTime = row["END TIME"];
    const usageStr = row["USAGE"];
    const units = row["UNITS"];

    const startMin = timeStringToMinutes(startTime);
    const endMin = timeStringToMinutes(endTime);
    // End time is the last minute of the interval (inclusive).
    const durationMinutes = endMin - startMin + 1;

    const usage = parseFloat(usageStr);
    if (isNaN(usage))
      throw new Error(`Row ${i + 2}: invalid usage value "${usageStr}".`);

    const unit = units.trim().toLowerCase() as UsageUnit;

    return {
      start: new Date(`${date}T${startTime}:00`),
      durationMinutes,
      usage,
      unit,
    };
  });

  return { data };
}

// ── Gap detection & filling ───────────────────────────────────────────────────

type CoverageResult = {
  /** Original intervals with any gaps filled by 0-usage entries. */
  data: DateTimeUsage[];
  gaps: GapInfo[];
};

function fillCoverageGaps(data: DateTimeUsage[]): CoverageResult {
  const sorted = [...data].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );

  const firstStart = sorted[0].start;
  const requiredEnd = new Date(firstStart);
  requiredEnd.setFullYear(requiredEnd.getFullYear() + 1);

  // Use the first interval's size and unit for synthesised fill entries.
  const intervalMs = sorted[0].durationMinutes * 60_000;
  const unit = sorted[0].unit;

  const gaps: GapInfo[] = [];
  const result: DateTimeUsage[] = [];
  let cursor = firstStart.getTime();

  for (const interval of sorted) {
    const intervalStart = interval.start.getTime();

    if (intervalStart > cursor) {
      // Gap detected — record it and fill with 0-usage intervals.
      gaps.push({
        start: new Date(cursor),
        end: new Date(intervalStart),
        durationMinutes: (intervalStart - cursor) / 60_000,
      });

      let fill = cursor;
      while (fill < intervalStart) {
        result.push({
          start: new Date(fill),
          durationMinutes: sorted[0].durationMinutes,
          usage: 0,
          unit,
        });
        fill += intervalMs;
      }
      cursor = intervalStart;
    }

    if (intervalStart >= cursor) {
      result.push(interval);
      cursor = intervalStart + interval.durationMinutes * 60_000;
    }
    // intervalStart < cursor → overlapping row, skip.
  }

  // Year-span check is still a hard error — gaps alone won't block the user,
  // but genuinely insufficient data will.
  if (cursor < requiredEnd.getTime()) {
    const daysCovered = Math.floor(
      (cursor - firstStart.getTime()) / 86_400_000,
    );
    throw new Error(
      `Data only covers ${daysCovered} day${daysCovered !== 1 ? "s" : ""}. ` +
        `At least one full year of consecutive data is required.`,
    );
  }

  return { data: result, gaps };
}

function formatGap(gap: GapInfo): string {
  const fmt = (d: Date) =>
    d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const hours = gap.durationMinutes / 60;
  const duration =
    hours >= 24
      ? `${(hours / 24).toFixed(1)} days`
      : `${hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1)} hr${hours !== 1 ? "s" : ""}`;
  return `${fmt(gap.start)} – ${fmt(gap.end)} (${duration})`;
}

// ── Component ─────────────────────────────────────────────────────────────────

const MAX_DISPLAYED_GAPS = 10;

const PREVIEW_HEADERS = ["DATE", "START TIME", "END TIME", "USAGE", "UNITS"];

function derivePreview(usageData: DateTimeUsage[]): string[][] {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtDate = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  return usageData.slice(0, 3).map((entry) => {
    const endInclusive = new Date(
      entry.start.getTime() + entry.durationMinutes * 60_000 - 60_000,
    );
    return [
      fmtDate(entry.start),
      fmtTime(entry.start),
      fmtTime(endInclusive),
      String(entry.usage),
      entry.unit,
    ];
  });
}

type UsageUploaderProps = {
  usageData: DateTimeUsage[];
  usageGaps: GapInfo[];
  onUpload: (data: DateTimeUsage[], gaps: GapInfo[]) => void;
};

export function UsageUploader({
  usageData,
  usageGaps,
  onUpload,
}: UsageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [gapsExpanded, setGapsExpanded] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { data } = parseUsageCSV(text);
        const { data: filledData, gaps } = fillCoverageGaps(data);
        setError(null);
        setGapsExpanded(false);
        onUpload(filledData, gaps);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse file.");
        setGapsExpanded(false);
      }
    };
    reader.readAsText(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-uploaded if needed.
    e.target.value = "";
  };

  const preview = useMemo(() => derivePreview(usageData), [usageData]);

  return (
    <Flex direction="column" gap="4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.tsv,.txt,text/plain,text/csv"
        style={{ display: "none" }}
        onChange={handleChange}
      />

      {/* Explanation + upload button */}
      <Flex direction="column" gap="3">
        <Text size="2" color="gray">
          Download your interval usage data from your utility's website — look
          for a "Green Button" or "Export usage" option — and upload the CSV
          here. The file must have the following columns:
        </Text>
        <Box
          style={{
            fontFamily: "monospace",
            fontSize: "12px",
            color: "var(--gray-11)",
            background: "var(--gray-a3)",
            borderRadius: "var(--radius-2)",
            padding: "8px 12px",
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          TYPE &nbsp;·&nbsp; DATE &nbsp;·&nbsp; START TIME &nbsp;·&nbsp; END
          TIME &nbsp;·&nbsp; USAGE &nbsp;·&nbsp; UNITS &nbsp;·&nbsp; COST
          &nbsp;·&nbsp; NOTES
        </Box>
        <Box>
          <Button
            size="2"
            variant="solid"
            onClick={() => fileInputRef.current?.click()}
          >
            {usageData.length > 0 ? "Replace Usage File" : "Upload Usage File"}
          </Button>
        </Box>
      </Flex>

      {/* Hard error */}
      {error && (
        <Callout.Root color="red" size="1">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {/* Row count summary (persists across navigation, unlike the preview) */}
      {usageData.length > 0 && !error && (
        <Text size="2" color="gray">
          {usageData.length.toLocaleString()} interval
          {usageData.length !== 1 ? "s" : ""} loaded.
        </Text>
      )}

      {/* Gap warnings — expandable, persists from context */}
      {usageGaps.length > 0 && (
        <Box
          style={{ cursor: "pointer", userSelect: "none" }}
          onClick={() => setGapsExpanded((v) => !v)}
        >
          <Callout.Root color="amber" size="1">
            {/* Summary row — click anywhere to toggle */}
            <Flex align="center" justify="between">
              <Callout.Text>
                {usageGaps.length} gap{usageGaps.length !== 1 ? "s" : ""} in
                coverage detected — filled with 0 usage (e.g. power outages).
              </Callout.Text>
              <Box
                style={{
                  flexShrink: 0,
                  marginLeft: "8px",
                  color: "var(--amber-11)",
                  transform: gapsExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 200ms ease",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ChevronRightIcon width={16} height={16} />
              </Box>
            </Flex>

            {/* Expandable gap list — grid-row trick for smooth height transition */}
            <div
              style={{
                display: "grid",
                gridTemplateRows: gapsExpanded ? "1fr" : "0fr",
                transition: "grid-template-rows 250ms ease",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <Flex direction="column" gap="1" pt="2">
                  {usageGaps.slice(0, MAX_DISPLAYED_GAPS).map((gap, i) => (
                    <Text
                      key={i}
                      size="1"
                      color="amber"
                      style={{ fontFamily: "monospace" }}
                    >
                      {formatGap(gap)}
                    </Text>
                  ))}
                  {usageGaps.length > MAX_DISPLAYED_GAPS && (
                    <Text size="1" color="amber">
                      …and {usageGaps.length - MAX_DISPLAYED_GAPS} more
                    </Text>
                  )}
                </Flex>
              </div>
            </div>
          </Callout.Root>
        </Box>
      )}

      {/* Preview table — derived from loaded usageData */}
      {preview.length > 0 && (
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            Preview — first {preview.length} row
            {preview.length !== 1 ? "s" : ""}
          </Text>
          <Card style={{ overflowX: "auto", padding: "12px" }}>
            <Table.Root size="1">
              <Table.Header>
                <Table.Row>
                  {PREVIEW_HEADERS.map((col) => (
                    <Table.ColumnHeaderCell
                      key={col}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {col}
                    </Table.ColumnHeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {preview.map((row, ri) => (
                  <Table.Row key={ri}>
                    {row.map((cell, ci) => (
                      <Table.Cell
                        key={ci}
                        style={{
                          whiteSpace: "nowrap",
                          fontFamily: "monospace",
                          fontSize: "12px",
                        }}
                      >
                        {cell}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card>
        </Flex>
      )}
    </Flex>
  );
}
