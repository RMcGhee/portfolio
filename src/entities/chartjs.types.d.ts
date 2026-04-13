import type { Chart, ChartType, ChartData, ChartOptions, DefaultDataPoint, Plugin, UpdateMode } from 'chart.js';

export type ChartJSOrUndefined<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown> = Chart<TType, TData, TLabel> | undefined;