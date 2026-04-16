// ============================================================================
// Input Types — these are what the user configures and what gets persisted
// ============================================================================

// --- Day of Week ---

/**
 * Numeric day of week, matching Date.getDay():
 *   0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const SUNDAY: DayOfWeek = 0;
export const MONDAY: DayOfWeek = 1;
export const TUESDAY: DayOfWeek = 2;
export const WEDNESDAY: DayOfWeek = 3;
export const THURSDAY: DayOfWeek = 4;
export const FRIDAY: DayOfWeek = 5;
export const SATURDAY: DayOfWeek = 6;

/** All days of the week in JS Date order (Sunday first). */
export const DAYS_OF_WEEK: DayOfWeek[] = [
  SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY,
];

/** Weekdays (Mon–Fri) for convenience when applying bulk schedules. */
export const WEEKDAYS: DayOfWeek[] = [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY];

/** Weekend days (Sat–Sun). */
export const WEEKEND: DayOfWeek[] = [SUNDAY, SATURDAY];

/** Short display labels indexed by DayOfWeek. */
export const DAY_LABELS: Record<DayOfWeek, string> = {
  [SUNDAY]: "Sun",
  [MONDAY]: "Mon",
  [TUESDAY]: "Tue",
  [WEDNESDAY]: "Wed",
  [THURSDAY]: "Thu",
  [FRIDAY]: "Fri",
  [SATURDAY]: "Sat",
};

/** Full display labels indexed by DayOfWeek. */
export const DAY_LABELS_FULL: Record<DayOfWeek, string> = {
  [SUNDAY]: "Sunday",
  [MONDAY]: "Monday",
  [TUESDAY]: "Tuesday",
  [WEDNESDAY]: "Wednesday",
  [THURSDAY]: "Thursday",
  [FRIDAY]: "Friday",
  [SATURDAY]: "Saturday",
};

// --- Month ---

/**
 * Numeric month, matching Date.getMonth():
 *   0 = January, 1 = February, ..., 11 = December
 */
export type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export const JANUARY: Month = 0;
export const FEBRUARY: Month = 1;
export const MARCH: Month = 2;
export const APRIL: Month = 3;
export const MAY: Month = 4;
export const JUNE: Month = 5;
export const JULY: Month = 6;
export const AUGUST: Month = 7;
export const SEPTEMBER: Month = 8;
export const OCTOBER: Month = 9;
export const NOVEMBER: Month = 10;
export const DECEMBER: Month = 11;

export const MONTHS: Month[] = [
  JANUARY, FEBRUARY, MARCH, APRIL, MAY, JUNE,
  JULY, AUGUST, SEPTEMBER, OCTOBER, NOVEMBER, DECEMBER,
];

/** Short display labels indexed by Month. */
export const MONTH_LABELS: Record<Month, string> = {
  [JANUARY]: "Jan",
  [FEBRUARY]: "Feb",
  [MARCH]: "Mar",
  [APRIL]: "Apr",
  [MAY]: "May",
  [JUNE]: "Jun",
  [JULY]: "Jul",
  [AUGUST]: "Aug",
  [SEPTEMBER]: "Sep",
  [OCTOBER]: "Oct",
  [NOVEMBER]: "Nov",
  [DECEMBER]: "Dec",
};

/** Full display labels indexed by Month. */
export const MONTH_LABELS_FULL: Record<Month, string> = {
  [JANUARY]: "January",
  [FEBRUARY]: "February",
  [MARCH]: "March",
  [APRIL]: "April",
  [MAY]: "May",
  [JUNE]: "June",
  [JULY]: "July",
  [AUGUST]: "August",
  [SEPTEMBER]: "September",
  [OCTOBER]: "October",
  [NOVEMBER]: "November",
  [DECEMBER]: "December",
};

// --- Time Block Types ---

/** A time-of-day string in "HHmm" 24-hour format, e.g. "0000", "1430", "2359" */
export type TimeOfDay = string;

/**
 * A single time block within a day's cost schedule.
 * Represents a contiguous period with a fixed utility rate.
 * Note the end is non-inclusive, i.e. with 0200-1600 and 1600-2000, 1600 belongs
 * to the second block.
 *
 * Example: { start: "0200", end: "1600", pricePerKwh: 0.11, label: "Off Peak" }
 */
export type CostBlock = {
  /** Start time inclusive, "HHmm" format */
  start: TimeOfDay;
  /** End time exclusive, "HHmm" format. Use "2400" for midnight end-of-day. */
  end: TimeOfDay;
  /** Price per kWh during this block */
  pricePerKwh: number;
  /** Human-readable descriptor, e.g. "Off Peak", "Peak", "Super Off Peak" */
  label: string;
};

/**
 * A full day's cost schedule — an ordered list of CostBlocks
 * that should cover 0000–2400 with no gaps or overlaps.
 */
export type CostScheduleDay = {
  blocks: CostBlock[];
};

// --- Weekly Schedule ---

/**
 * A full week of cost schedules, keyed by DayOfWeek (0–6).
 * Many utilities use the same schedule for all weekdays and a different one
 * for weekends, but this supports per-day granularity.
 */
export type CostScheduleWeek = Record<DayOfWeek, CostScheduleDay>;

// --- Seasonal Schedule ---

/**
 * A named season with its selected months and weekly cost schedule.
 */
export type CostScheduleSeason = {
  /** Human-readable name, e.g. "Summer", "Winter", "Shoulder" */
  name: string;
  /** Selected months for this season */
  months: Month[];
  /** The weekly cost pattern that applies during this season */
  week: CostScheduleWeek;
};

/**
 * A full annual cost plan made up of seasons.
 * Seasons should cover the entire year (Jan 1 – Dec 31) with no gaps or overlaps.
 */
export type CostSchedulePlan = {
  /** Plan name as shown by the utility, e.g. "TOU-D-Prime", "Summer Peak Plan" */
  name: string;
  /** Ordered list of seasons covering the full year */
  seasons: CostScheduleSeason[];
};

// --- Usage Input ---

/** Supported usage measurement units */
export type UsageUnit = "kwh" | "therms" | "ccf";

/**
 * A single metered usage reading from a utility bill export.
 * Typically 15-minute or 1-hour intervals.
 *
 * Example: { start: "2025-01-15T14:00:00", durationMinutes: 60, usage: 1.2, unit: "kwh" }
 */
export type DateTimeUsage = {
  /** ISO 8601 datetime string for the start of the interval */
  start: string;
  /** Duration of the measurement interval in minutes (typically 15 or 60) */
  durationMinutes: number;
  /** Measured usage during this interval */
  usage: number;
  /** Unit of measurement */
  unit: UsageUnit;
};

// ============================================================================
// Derived Types — computed from inputs, never stored or persisted
// ============================================================================

/**
 * Usage binned into a cost block for a single day.
 * This is the result of mapping DateTimeUsage intervals onto CostBlocks.
 */
export type CostBlockUsage = {
  /** The cost block this usage falls into */
  block: CostBlock;
  /** Total usage accumulated in this block */
  totalUsage: number;
  /** Unit of measurement */
  unit: UsageUnit;
  /** Computed cost: totalUsage * block.pricePerKwh */
  cost: number;
};

/**
 * A full day's usage broken down by cost block.
 * Produced by binning DateTimeUsage records against a CostScheduleDay.
 */
export type CostScheduleUsage = {
  /** The date this usage applies to, "YYYY-MM-DD" format */
  date: string;
  /** Usage binned into each cost block for the day */
  blockUsages: CostBlockUsage[];
  /** Sum of all block usages for the day */
  totalUsage: number;
  /** Sum of all block costs for the day */
  totalCost: number;
};

// ============================================================================
// Helpers — bridge between Date objects and our types
// ============================================================================

/** Extract DayOfWeek from a Date. Direct alias for Date.getDay(). */
export function getDayOfWeek(date: Date): DayOfWeek {
  return date.getDay() as DayOfWeek;
}

/** Extract Month from a Date. Direct alias for Date.getMonth(). */
export function getMonth(date: Date): Month {
  return date.getMonth() as Month;
}

/** Check whether a Date falls within a season's selected months. */
export function isDateInSeason(date: Date, season: CostScheduleSeason): boolean {
  const m = date.getMonth() as Month;
  return season.months.includes(m);
}

/**
 * Look up the CostScheduleDay for a given Date within a plan.
 * Finds the matching season, then returns the schedule for that day of the week.
 * Returns undefined if no season matches (indicates a gap in the plan).
 */
export function getScheduleForDate(
  date: Date,
  plan: CostSchedulePlan,
): CostScheduleDay | undefined {
  const season = plan.seasons.find((s) => isDateInSeason(date, s));
  if (!season) return undefined;
  const dow = getDayOfWeek(date);
  return season.week[dow];
}

// ============================================================================
// Defaults
// ============================================================================

export const defaultCostBlock: CostBlock = {
  start: "0000",
  end: "2400",
  pricePerKwh: 0,
  label: "Flat Rate",
};

export const defaultCostScheduleDay: CostScheduleDay = {
  blocks: [{ ...defaultCostBlock }],
};

export function defaultCostScheduleWeek(): CostScheduleWeek {
  return Object.fromEntries(
    DAYS_OF_WEEK.map((day) => [
      day,
      { blocks: [{ ...defaultCostBlock }] },
    ]),
  ) as CostScheduleWeek;
}

export function defaultCostSchedulePlan(): CostSchedulePlan {
  return {
    name: "",
    seasons: [
      {
        name: "Year Round",
        months: [...MONTHS],
        week: defaultCostScheduleWeek(),
      },
    ],
  };
}
