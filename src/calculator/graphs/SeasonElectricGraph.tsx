import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  ScatterController,
  Title,
  Tooltip,
} from "chart.js";
import { SimpleLinearRegression } from "ml-regression-simple-linear";
import React, { useEffect, useRef } from "react";
import { Chart } from "react-chartjs-2";
import type { ChartJSOrUndefined } from "react-chartjs-2/dist/types";
import type { DegreeDayMonths } from "../../entities/DegreeDayData";
import type { MonthlyUsage } from "../../entities/EnergyFormData";
import { type FormData, ddDataForYear } from "../../entities/FormData";
import type { MonthDataEntry } from "../../routes/joule-home/analysis.lazy";

type SeasonElectricGraphProps = {
  formData: FormData;
  setBaseElectricUsage: (e: number) => void;
};

const SeasonElectricGraph: React.FC<SeasonElectricGraphProps> = ({
  formData,
  setBaseElectricUsage,
}) => {
  ChartJS.register(
    LinearScale,
    CategoryScale,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    Title,
    ScatterController,
  );

  const chartRefElectric =
    useRef<
      ChartJSOrUndefined<
        "line" | "scatter",
        { x: number; y: number }[],
        unknown
      >
    >(null);

  const getLinearGradient = (
    chartRef: React.RefObject<
      ChartJSOrUndefined<
        "line" | "scatter",
        { x: number; y: number }[],
        unknown
      >
    >,
  ) => {
    if (chartRef && chartRef.current) {
      const chart = chartRef.current;
      const ctx = chart.ctx;

      const gradient = ctx.createLinearGradient(0, 0, 25, 0);
      gradient.addColorStop(0, "blue");
      gradient.addColorStop(1, "red");
      return gradient;
    }
  };

  const [yearCoolingData, yearHeatingData] = ddDataForYear(formData);

  // Where the next two return [['mon', [kWh/gas usage for month, dd for month]]
  const coolingMonthsKwh = Object.entries(yearCoolingData)
    .map(([month, dd]) => {
      if (dd > yearHeatingData[month as keyof DegreeDayMonths]) {
        return [
          month,
          [
            Number(formData.monthlyElectricUsage[month as keyof MonthlyUsage]),
            dd,
          ],
        ];
      }
      return null;
    })
    .filter((entry): entry is MonthDataEntry => entry !== null);

  const heatingMonthsKwh = Object.entries(formData.degreeDayData.heating)
    .map(([month, dd]) => {
      if (dd > formData.degreeDayData.cooling[month as keyof DegreeDayMonths]) {
        return [
          month,
          [
            Number(formData.monthlyElectricUsage[month as keyof MonthlyUsage]),
            dd,
          ],
        ];
      }
      return null;
    })
    .filter((entry): entry is MonthDataEntry => entry !== null);

  const coolingMonthScatter = coolingMonthsKwh.map(([k, [kwh, dd]]) => ({
    x: dd,
    y: kwh,
  }));
  const heatingMonthScatter = heatingMonthsKwh.map(([k, [kwh, dd]]) => ({
    x: dd,
    y: kwh,
  }));
  const coolingMonthLine = new SimpleLinearRegression(
    coolingMonthScatter.map((pair) => pair.x),
    coolingMonthScatter.map((pair) => pair.y),
  );
  const heatingMonthLine = new SimpleLinearRegression(
    heatingMonthScatter.map((pair) => pair.x),
    heatingMonthScatter.map((pair) => pair.y),
  );
  const coolingMonthMaxDd = Math.max(
    ...coolingMonthsKwh.map(([k, [kwh, dd]]) => dd),
  );
  const heatingMonthMaxDd = Math.max(
    ...heatingMonthsKwh.map(([k, [kwh, dd]]) => dd),
  );

  useEffect(() => {
    if (coolingMonthLine && heatingMonthLine) {
      setBaseElectricUsage(
        (coolingMonthLine.intercept + heatingMonthLine.intercept) / 2,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coolingMonthLine, heatingMonthLine]);

  const chartData = {
    datasets: [
      {
        type: "scatter" as const,
        label: "Cooling kWh",
        data: coolingMonthsKwh.map(([k, [kwh, dd]]) => ({ x: dd, y: kwh })),
        backgroundColor: "#4e79a7",
      },
      {
        type: "line" as const,
        label: "Trend",
        data: [
          { x: 0, y: coolingMonthLine.intercept },
          {
            x: coolingMonthMaxDd,
            y: coolingMonthLine.predict(coolingMonthMaxDd),
          },
        ],
        borderColor: "#4e79a7",
        borderWidth: 2,
      },
      {
        type: "scatter" as const,
        label: "Heating kWh",
        data: heatingMonthsKwh.map(([k, [kwh, dd]]) => ({ x: dd, y: kwh })),
        backgroundColor: "#e15759",
      },
      {
        type: "line" as const,
        label: "Trend",
        data: [
          { x: 0, y: heatingMonthLine.intercept },
          {
            x: heatingMonthMaxDd,
            y: heatingMonthLine.predict(heatingMonthMaxDd),
          },
        ],
        borderColor: "#e15759",
        borderWidth: 2,
      },
    ],
  };

  return (
    <Chart
      ref={chartRefElectric}
      key="seasonElectricGraph"
      type="scatter"
      data={chartData}
      width={400}
      height={400}
      options={{
        scales: {
          x: {
            beginAtZero: true,
            title: {
              text: "DegreeDays",
              display: true,
              color: getLinearGradient(chartRefElectric),
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.87)",
            },
          },
          y: {
            beginAtZero: true,
            title: {
              text: "kWh",
              display: true,
              color: "rgba(255, 255, 255, 0.87)",
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.87)",
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: "kWh per season",
            align: "center",
            color: "rgba(255, 255, 255, 0.87)",
            font: {
              size: 18,
            },
          },
        },
      }}
    />
  );
};

export default SeasonElectricGraph;
