import React, { createContext, useContext, type Dispatch } from "react";
import {
  type CostSchedulePlan,
  type CostScheduleSeason,
  type CostScheduleWeek,
  type CostScheduleDay,
  type CostBlock,
  type DateTimeUsage,
  type Month,
  type DayOfWeek,
  MONTHS,
  DAYS_OF_WEEK,
  defaultCostSchedulePlan,
  defaultCostScheduleWeek,
  defaultCostBlock,
} from "./cost-schedule";

// ============================================================================
// Input State — what the user configures, what gets persisted
// ============================================================================

export type SavedPlan = {
  id: string;
  plan: CostSchedulePlan;
};

export type FlowHomeInputs = {
  plan: CostSchedulePlan;
  usageData: DateTimeUsage[];
  savedPlans: SavedPlan[];
  activePlanId: string | null; // null = working on an unsaved new plan
};

export const defaultFlowHomeInputs: FlowHomeInputs = {
  plan: defaultCostSchedulePlan(),
  usageData: [],
  savedPlans: [],
  activePlanId: null,
};

// ============================================================================
// Sanitization — ensure saved data conforms to current type shapes
// ============================================================================

/**
 * Ensure saved data conforms to current type shapes.
 * Picks only known keys and fills missing values with defaults.
 */
export function sanitizeInputs(raw: Record<string, unknown>): FlowHomeInputs {
  const defPlan = defaultCostSchedulePlan();
  const defSeason = defPlan.seasons[0];

  const plan =
    raw.plan && typeof raw.plan === "object"
      ? (raw.plan as Record<string, unknown>)
      : null;

  const rawSavedPlans = Array.isArray(raw.savedPlans) ? raw.savedPlans : [];
  const savedPlans: SavedPlan[] = rawSavedPlans
    .filter((sp: unknown) => sp && typeof sp === "object")
    .map((sp: unknown) => {
      const s = sp as Record<string, unknown>;
      const rawPlan =
        s.plan && typeof s.plan === "object"
          ? (s.plan as Record<string, unknown>)
          : null;
      return {
        id: typeof s.id === "string" ? s.id : crypto.randomUUID(),
        plan: rawPlan ? sanitizePlan(rawPlan, defPlan, defSeason) : defPlan,
      };
    });

  const activePlanId =
    typeof raw.activePlanId === "string" &&
    savedPlans.some((sp) => sp.id === raw.activePlanId)
      ? raw.activePlanId
      : null;

  if (!plan)
    return {
      ...defaultFlowHomeInputs,
      plan: defPlan,
      savedPlans,
      activePlanId,
    };

  return {
    plan: sanitizePlan(plan, defPlan, defSeason),
    usageData: Array.isArray(raw.usageData) ? raw.usageData : [],
    savedPlans,
    activePlanId,
  };
}

function sanitizePlan(
  raw: Record<string, unknown>,
  defPlan: CostSchedulePlan,
  defSeason: CostScheduleSeason,
): CostSchedulePlan {
  return {
    name: typeof raw.name === "string" ? raw.name : defPlan.name,
    seasons: Array.isArray(raw.seasons)
      ? raw.seasons.map((s: unknown) =>
          s && typeof s === "object"
            ? sanitizeSeason(s as Record<string, unknown>, defSeason)
            : { ...defSeason },
        )
      : defPlan.seasons.map((s) => ({ ...s })),
  };
}

function sanitizeSeason(
  raw: Record<string, unknown>,
  def: CostScheduleSeason,
): CostScheduleSeason {
  return {
    name: typeof raw.name === "string" ? raw.name : def.name,
    months: Array.isArray(raw.months)
      ? raw.months.filter((m): m is Month => MONTHS.includes(m as Month))
      : [...def.months],
    week:
      raw.week && typeof raw.week === "object"
        ? sanitizeWeek(raw.week as Record<string, unknown>)
        : defaultCostScheduleWeek(),
  };
}

function sanitizeWeek(raw: Record<string, unknown>): CostScheduleWeek {
  const defWeek = defaultCostScheduleWeek();
  return Object.fromEntries(
    DAYS_OF_WEEK.map((day) => {
      const dayData = raw[day];
      return [
        day,
        dayData && typeof dayData === "object"
          ? sanitizeDay(dayData as Record<string, unknown>)
          : defWeek[day],
      ];
    }),
  ) as CostScheduleWeek;
}

function sanitizeDay(raw: Record<string, unknown>): CostScheduleDay {
  return {
    blocks: Array.isArray(raw.blocks)
      ? raw.blocks
          .filter(
            (b): b is Record<string, unknown> =>
              b != null && typeof b === "object",
          )
          .map(sanitizeBlock)
      : [{ ...defaultCostBlock }],
  };
}

function sanitizeBlock(raw: Record<string, unknown>): CostBlock {
  return {
    start: typeof raw.start === "string" ? raw.start : defaultCostBlock.start,
    end: typeof raw.end === "string" ? raw.end : defaultCostBlock.end,
    pricePerKwh:
      typeof raw.pricePerKwh === "number"
        ? raw.pricePerKwh
        : defaultCostBlock.pricePerKwh,
    label: typeof raw.label === "string" ? raw.label : defaultCostBlock.label,
  };
}

// ============================================================================
// Actions
// ============================================================================

export type FlowHomeAction =
  | { type: "setPlan"; plan: CostSchedulePlan }
  | { type: "setPlanName"; name: string }
  | { type: "addSeason"; season: CostScheduleSeason }
  | { type: "updateSeason"; index: number; season: CostScheduleSeason }
  | { type: "removeSeason"; index: number }
  | {
      type: "updateDaySchedule";
      seasonIndex: number;
      day: DayOfWeek;
      schedule: CostScheduleDay;
    }
  | {
      type: "applyScheduleToDays";
      seasonIndex: number;
      sourceDay: DayOfWeek;
      targetDays: DayOfWeek[];
    }
  | { type: "setUsageData"; usageData: DateTimeUsage[] }
  | { type: "appendUsageData"; usageData: DateTimeUsage[] }
  | { type: "clearUsageData" }
  | { type: "reset" }
  | { type: "savePlan" }
  | { type: "switchPlan"; id: string }
  | { type: "newPlan" }
  | { type: "duplicatePlan" };

// ============================================================================
// Reducer
// ============================================================================

export function flowHomeReducer(
  state: FlowHomeInputs,
  action: FlowHomeAction,
): FlowHomeInputs {
  switch (action.type) {
    case "setPlan":
      return { ...state, plan: action.plan };

    case "setPlanName":
      return { ...state, plan: { ...state.plan, name: action.name } };

    case "addSeason":
      return {
        ...state,
        plan: {
          ...state.plan,
          seasons: [...state.plan.seasons, action.season],
        },
      };

    case "updateSeason": {
      const seasons = [...state.plan.seasons];
      seasons[action.index] = action.season;
      return { ...state, plan: { ...state.plan, seasons } };
    }

    case "removeSeason": {
      const seasons = state.plan.seasons.filter((_, i) => i !== action.index);
      return { ...state, plan: { ...state.plan, seasons } };
    }

    case "updateDaySchedule": {
      const seasons = [...state.plan.seasons];
      const season = { ...seasons[action.seasonIndex] };
      season.week = { ...season.week, [action.day]: action.schedule };
      seasons[action.seasonIndex] = season;
      return { ...state, plan: { ...state.plan, seasons } };
    }

    case "applyScheduleToDays": {
      const seasons = [...state.plan.seasons];
      const season = { ...seasons[action.seasonIndex] };
      const sourceSchedule = season.week[action.sourceDay];
      const updatedWeek = { ...season.week };
      for (const day of action.targetDays) {
        updatedWeek[day] = {
          blocks: sourceSchedule.blocks.map((b) => ({ ...b })),
        };
      }
      season.week = updatedWeek;
      seasons[action.seasonIndex] = season;
      return { ...state, plan: { ...state.plan, seasons } };
    }

    case "setUsageData":
      return { ...state, usageData: action.usageData };

    case "appendUsageData":
      return {
        ...state,
        usageData: [...state.usageData, ...action.usageData],
      };

    case "clearUsageData":
      return { ...state, usageData: [] };

    case "reset":
      return { ...defaultFlowHomeInputs, plan: defaultCostSchedulePlan() };

    case "savePlan": {
      const existing = state.activePlanId
        ? state.savedPlans.findIndex((sp) => sp.id === state.activePlanId)
        : -1;
      if (existing >= 0) {
        // Update the existing saved plan
        const savedPlans = [...state.savedPlans];
        savedPlans[existing] = { ...savedPlans[existing], plan: state.plan };
        return { ...state, savedPlans };
      } else {
        // New plan — generate an ID and add it
        const id = crypto.randomUUID();
        return {
          ...state,
          activePlanId: id,
          savedPlans: [...state.savedPlans, { id, plan: state.plan }],
        };
      }
    }

    case "switchPlan": {
      const target = state.savedPlans.find((sp) => sp.id === action.id);
      if (!target) return state;
      return {
        ...state,
        plan: target.plan,
        activePlanId: target.id,
        usageData: [],
      };
    }

    case "newPlan":
      return {
        ...state,
        plan: defaultCostSchedulePlan(),
        activePlanId: null,
        usageData: [],
      };

    case "duplicatePlan":
      return {
        ...state,
        plan: {
          ...state.plan,
          name: state.plan.name ? `${state.plan.name} (Copy)` : "Copy",
        },
        activePlanId: null,
        usageData: [],
      };
  }
}

// ============================================================================
// Context
// ============================================================================

interface FlowHomeContextType {
  inputs: FlowHomeInputs;
  dispatch: Dispatch<FlowHomeAction>;
}

export const FlowHomeContext = createContext<FlowHomeContextType | undefined>(
  undefined,
);

export const useFlowHomeContext = () => {
  const context = useContext(FlowHomeContext);
  if (!context) {
    throw new Error(
      "useFlowHomeContext must be used within a FlowHomeProvider",
    );
  }
  return context;
};
