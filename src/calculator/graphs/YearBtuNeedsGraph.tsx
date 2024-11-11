import { useTheme } from '@mui/material';
import { CategoryScale, type ChartData, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Title, Tooltip, } from 'chart.js';
import React, { useEffect, useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import { btuInCcf, btuInkWh, copInSeer, months } from '../../common/Basic';
import { type MonthData, initMonthData } from '../../entities/CalculatedData';
import type { MonthlyUsage, } from '../../entities/EnergyFormData';
import { type FormData, ddDataForYear } from '../../entities/FormData';

type YearBtuNeedsGraphProps = {
  formData: FormData;
  setAveragekBTUdd: (e: number) => void;
  setkBTUNeeds: (e: MonthData) => void;
};

const YearBtuNeedsGraph: React.FC<YearBtuNeedsGraphProps> = ({
  formData,
  setAveragekBTUdd,
  setkBTUNeeds,
}) => {
  const theme = useTheme();
  ChartJS.register(LinearScale, CategoryScale, PointElement, LineElement, Legend, Tooltip, Title);

  const chartRefBtu = useRef <ChartJSOrUndefined<"line", number[], unknown>>(null);

  const acCop = Number(formData.currentACSeer) * copInSeer;
  const furnaceEfficiency = Number(formData.currentFurnaceEfficiency) / 100;

  // in kBTU
  const realBtuMonths = useMemo(() => {
    return months.map((month: string) => {
      return (
        ((Number(formData.monthlyElectricUsage[month.toLowerCase() as keyof MonthlyUsage]) - formData.baseElectricUsage) * btuInkWh * acCop) +
        ((Number(formData.monthlyGasUsage[month.toLowerCase() as keyof MonthlyUsage]) - formData.baseGasUsage) * btuInCcf * furnaceEfficiency)
      ) / 1000;
    });
  }, [ formData, acCop, furnaceEfficiency ]);

  const [ ddMonthsCooling, ddMonthsHeating ] = useMemo(() => ddDataForYear(formData), [formData]);

  const ddMonths = useMemo(() => {
    return months.map((month) => Number(ddMonthsCooling[month.toLowerCase() as keyof MonthlyUsage]) + Number(ddMonthsHeating[month.toLowerCase() as keyof MonthlyUsage]));
  }, [ ddMonthsCooling, ddMonthsHeating ]);

  const averageBtuDd = useMemo(() => {
    return realBtuMonths.reduce((acc, next, i) => (acc + (next / ddMonths[i])), 0) / 12;
  }, [ realBtuMonths, ddMonths ]);

  const estimatedBtuNeeds = useMemo(() => {
    return months.map((month) => ((Number(ddMonthsCooling[month.toLowerCase() as keyof MonthlyUsage]) * 1.10) + (Number(ddMonthsHeating[month.toLowerCase() as keyof MonthlyUsage]) * 0.85)) * averageBtuDd);
  }, [ ddMonthsCooling, ddMonthsHeating, averageBtuDd ]);

  const naiveBtuNeeds = useMemo(() => {
    ddMonths.map((dd) => dd * averageBtuDd);
  }, [ ddMonths ]);

  useEffect(() => {
    setkBTUNeeds(initMonthData(estimatedBtuNeeds));
    setAveragekBTUdd(averageBtuDd);
  }, [ estimatedBtuNeeds, averageBtuDd, setkBTUNeeds, setAveragekBTUdd ]);

  const getLinearGradient = (chartRef: React.RefObject<ChartJSOrUndefined<"line", number[], unknown>>) => {
    if (chartRef && chartRef.current) {
      const chart = chartRef.current;
      const ctx = chart.ctx;
      const area = chart.chartArea;
      const heatingColor = 'red';
      const coolingColor = 'blue';
    
      const gradient = ctx.createLinearGradient(30, area.top/2, area.right, area.top/2);
    
      gradient.addColorStop(0, heatingColor);
      gradient.addColorStop(0.6, coolingColor);
      gradient.addColorStop(1, heatingColor);
      
      return gradient;
    }
  }

  // For some reason, importing an alias to a const string[] breaks multi axis... no idea why.
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = {
    labels,
    datasets: [
      {
        label: 'Used kBTU',
        data: realBtuMonths,
        borderColor: getLinearGradient(chartRefBtu),
        yAxisID: 'y',
        lineTension: 0.3,
      },
      {
        label: 'Naive kBTU Needs',
        data: naiveBtuNeeds,
        borderColor: theme.palette.text.secondary,
        yAxisID: 'y',
        lineTension: 0.3,
        hidden: true,
      },
      {
        label: 'Est. kBTU Needs',
        data: estimatedBtuNeeds,
        borderColor: 'gold',
        yAxisID: 'y',
        lineTension: 0.3,
      },
    ],
  } as unknown as ChartData<"line", number[], unknown>;

  const btuOptions = {
      stacked: false,
      responsive: true,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: theme.palette.text.primary,
          }
        },
        y: {
          beginAtZero: true,
          title: {
            text: 'kBTU per month',
            display: true,
            color: theme.palette.text.primary,
          },
          ticks: {
            color: theme.palette.text.primary,
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: `${formData.dataYear} Estimated kBTU needs`,
          color: theme.palette.text.primary,
          font: {
            size: 18
          }
        },
      },
    };

  return (
    <Line
      ref={chartRefBtu}
      key='yearRawBtuGraph'
      title='Estimated kBTU needs'
      data={data}
      width={500}
      height={500}
      options={btuOptions}
    />
  );
}

export default YearBtuNeedsGraph;