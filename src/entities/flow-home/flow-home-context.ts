import React, { createContext, useContext, type Dispatch } from "react";
import {
  type CostSchedulePlan,
  type CostScheduleSeason,
  type CostScheduleDay,
  type DateTimeUsage,
  type DayOfWeek,
  defaultCostSchedulePlan,
} from "./cost-schedule";

// ============================================================================
// Input State — what the user configures, what gets persisted
// ============================================================================

export type FlowHomeInputs = {
  plan: CostSchedulePlan;
  usageData: DateTimeUsage[];
};

export const defaultFlowHomeInputs: FlowHomeInputs = {
  plan: defaultCostSchedulePlan(),
  usageData: [],
};

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
  | { type: "reset" };

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
      const seasons = state.plan.seasons.filter(
        (_, i) => i !== action.index,
      );
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