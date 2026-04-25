import {
  type CostSchedulePlan,
  type CostBlock,
  type DateTimeUsage,
  type UsageUnit,
  getDayOfWeek,
  isDateInSeason,
} from "./cost-schedule";

// ── Result types ──────────────────────────────────────────────────────────────

/** Aggregated usage and cost for a single time-of-use block within a season. */
export type BlockSummary = {
  label: string;
  pricePerKwh: number;
  totalUsage: number;
  unit: UsageUnit;
  totalCost: number;
};

/** Aggregated usage and cost for all blocks within a single season. */
export type SeasonSummary = {
  seasonName: string;
  seasonIndex: number;
  blocks: BlockSummary[];
  totalUsage: number;
  totalCost: number;
};

/** Full cost calculation result for a plan against a usage dataset. */
export type PlanCostResult = {
  planName: string;
  seasons: SeasonSummary[];
  totalUsage: number;
  totalCost: number;
  /** Intervals that couldn't be matched to any season or block in the plan. */
  unmatchedIntervals: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const h = parseInt(time.slice(0, 2), 10);
  const m = parseInt(time.slice(2, 4), 10);
  return h * 60 + m;
}

function findBlock(blocks: CostBlock[], startMin: number): CostBlock | null {
  return (
    blocks.find(
      (b) =>
        timeToMinutes(b.start) <= startMin && timeToMinutes(b.end) > startMin,
    ) ?? null
  );
}

// ── Calculation ───────────────────────────────────────────────────────────────

/**
 * Calculate the total cost of a usage dataset under a given rate plan.
 *
 * For each interval:
 *   1. Find which season the date belongs to (by month).
 *   2. Look up the day-of-week schedule within that season.
 *   3. Find which time block the interval's start time falls into.
 *   4. Accumulate usage (kWh) and cost (usage × rate) into that block.
 *
 * Results are aggregated by season → block label + price, so the same
 * "Off Peak" tier across many days is summed into one row.
 */
export function calculatePlanCost(
  usageData: DateTimeUsage[],
  plan: CostSchedulePlan,
): PlanCostResult {
  // seasonIndex → blockKey → BlockSummary
  const seasonMaps = new Map<number, Map<string, BlockSummary>>();
  let unmatchedIntervals = 0;

  for (const interval of usageData) {
    // 1. Season
    const seasonIdx = plan.seasons.findIndex((s) =>
      isDateInSeason(interval.start, s),
    );
    if (seasonIdx === -1) {
      unmatchedIntervals++;
      continue;
    }

    // 2. Day-of-week schedule
    const season = plan.seasons[seasonIdx];
    const dow = getDayOfWeek(interval.start);
    const daySchedule = season.week[dow];

    // 3. Time block
    const startMin =
      interval.start.getHours() * 60 + interval.start.getMinutes();
    const block = findBlock(daySchedule.blocks, startMin);
    if (!block) {
      unmatchedIntervals++;
      continue;
    }

    // 4. Accumulate
    if (!seasonMaps.has(seasonIdx)) {
      seasonMaps.set(seasonIdx, new Map());
    }
    const blockMap = seasonMaps.get(seasonIdx)!;
    const key = `${block.label}||${block.pricePerKwh}`;

    if (!blockMap.has(key)) {
      blockMap.set(key, {
        label: block.label || `Unlabeled @ $${block.pricePerKwh}/kWh`,
        pricePerKwh: block.pricePerKwh,
        totalUsage: 0,
        unit: interval.unit,
        totalCost: 0,
      });
    }

    const summary = blockMap.get(key)!;
    summary.totalUsage += interval.usage;
    summary.totalCost += interval.usage * block.pricePerKwh;
  }

  // Build structured result — omit seasons with no matched data
  const seasons: SeasonSummary[] = plan.seasons
    .map((season, idx) => {
      const blockMap = seasonMaps.get(idx) ?? new Map<string, BlockSummary>();
      const blocks = Array.from(blockMap.values());
      const totalUsage = blocks.reduce((sum, b) => sum + b.totalUsage, 0);
      const totalCost = blocks.reduce((sum, b) => sum + b.totalCost, 0);
      return {
        seasonName: season.name || `Season ${idx + 1}`,
        seasonIndex: idx,
        blocks,
        totalUsage,
        totalCost,
      };
    })
    .filter((s) => s.blocks.length > 0);

  return {
    planName: plan.name,
    seasons,
    totalUsage: seasons.reduce((s, r) => s + r.totalUsage, 0),
    totalCost: seasons.reduce((s, r) => s + r.totalCost, 0),
    unmatchedIntervals,
  };
}
