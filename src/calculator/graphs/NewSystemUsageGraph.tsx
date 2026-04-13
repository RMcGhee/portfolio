import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  ScatterController,
  Title,
  Tooltip,
} from "chart.js";
import React, { useRef } from "react";
import { Line } from "react-chartjs-2";
import type { ChartJSOrUndefined } from "react-chartjs-2/dist/types";
import { btuInkWh, copInSeer, months } from "../../common/Basic";
import type { DegreeDayMonths } from "../../entities/DegreeDayData";
import type { FormData } from "../../entities/FormData";

type NewSystemUsageGraphProps = {
  formData: FormData;
  setDesiredHvacYearlyCost: (e: number) => void;
  setDesiredTotalYearlyCost: (e: number) => void;
  setOldHvacYearlyCost: (e: number) => void;
};

const NewSystemUsageGraph: React.FC<NewSystemUsageGraphProps> = ({
  formData,
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

  const chartRefBtu =
    useRef<ChartJSOrUndefined<"line", number[], unknown>>(null);

  const hpCoolCop = Number(formData.desiredHeatPumpSeer) * copInSeer;
  const hpHeatCop = Number(formData.desiredHeatPumpHspf) * copInSeer;
  const acCop = Number(formData.currentACSeer) * copInSeer;

  const estimatedBtuNeeds = months.map(
    (month) =>
      (Number(
        formData.degreeDayData.cooling[
          month.toLowerCase() as keyof DegreeDayMonths
        ],
      ) *
        1.1 +
        Number(
          formData.degreeDayData.heating[
            month.toLowerCase() as keyof DegreeDayMonths
          ],
        ) *
          0.85) *
      formData.averagekBTUdd,
  );

  const monthlyHVACkWh = months.map((month) => {
    let cdd = Number(
      formData.degreeDayData.cooling[
        month.toLowerCase() as keyof DegreeDayMonths
      ],
    );
    let hdd = Number(
      formData.degreeDayData.heating[
        month.toLowerCase() as keyof DegreeDayMonths
      ],
    );
    let kWh = 0;
    if (cdd > 0) {
      kWh +=
        ((cdd * formData.averagekBTUdd) / hpCoolCop / btuInkWh) * 1000 * 1.1;
    }
    if (hdd > 0) {
      kWh +=
        ((hdd * formData.averagekBTUdd) / hpHeatCop / btuInkWh) * 1000 * 0.85;
    }
    return kWh;
  });

  const monthlyOldHvackWh = months.map((month) => {
    let cdd = Number(
      formData.degreeDayData.cooling[
        month.toLowerCase() as keyof DegreeDayMonths
      ],
    );
    let kWh = 0;
    if (cdd > 0) {
      kWh += ((cdd * formData.averagekBTUdd) / acCop / btuInkWh) * 1000 * 1.1;
    }
    return kWh;
  });

  const getLinearGradient = (
    chartRef: React.RefObject<ChartJSOrUndefined<"line", number[], unknown>>,
  ) => {
    if (chartRef && chartRef.current) {
      const chart = chartRef.current;
      const ctx = chart.ctx;
      const area = chart.chartArea;
      const heatingColor = "red";
      const coolingColor = "blue";

      const gradient = ctx.createLinearGradient(
        30,
        area.top / 2,
        area.right,
        area.top / 2,
      );

      gradient.addColorStop(0, heatingColor);
      gradient.addColorStop(0.6, coolingColor);
      gradient.addColorStop(1, heatingColor);

      return gradient;
    }
  };

  // For some reason, importing an alias to a const string[] breaks multi axis... no idea why.
  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const data = {
    labels,
    datasets: [
      {
        label: "Est kBTU Needs",
        data: estimatedBtuNeeds,
        borderColor: "gold",
        showLine: false,
        yAxisID: "y",
        lineTension: 0.3,
      },
      {
        label: "New HVAC kWh",
        data: monthlyHVACkWh,
        borderColor: getLinearGradient(chartRefBtu),
        yAxisID: "y1",
        lineTension: 0.3,
      },
      {
        label: "Old HVAC kWh",
        data: monthlyOldHvackWh,
        borderColor: "grey",
        yAxisID: "y1",
        lineTension: 0.3,
        onClick: () => console.log("got clicked!"),
      },
    ],
  };

  const btuOptions = {
    stacked: false,
    responsive: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: "rgba(255, 255, 255, 0.87)",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          text: "Est. kBTU per month",
          display: true,
          color: "rgba(255, 255, 255, 0.87)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.87)",
        },
      },
      y1: {
        type: "linear" as const,
        beginAtZero: true,
        title: {
          text: "kWh per month",
          display: true,
          color: "rgba(255, 255, 255, 0.87)",
        },
        display: true,
        position: "right" as const,
        ticks: {
          color: "rgba(255, 255, 255, 0.87)",
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "New System kWh Estimate",
        color: "rgba(255, 255, 255, 0.87)",
        font: {
          size: 18,
        },
      },
    },
  };

  return (
    <Line
      ref={chartRefBtu}
      key="newSystemkWhGraph"
      title="New System kWh Estimate"
      data={data}
      width={500}
      height={500}
      options={btuOptions}
    />
  );
};

export default NewSystemUsageGraph;
