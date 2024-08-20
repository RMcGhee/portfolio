import React, { useEffect, useRef } from 'react';
import { FormData } from '../../entities/FormData';
import { MonthlyUsage, } from '../../entities/EnergyFormData';
import { Chart as ChartJS, LinearScale, CategoryScale, PointElement, LineElement, Legend, Tooltip, Title, } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import { useTheme } from '@mui/material';
import { btuInCcf, btuInkWh, copInSeer, months } from '../../common/Basic';

type YearBtuGraphProps = {
  formData: FormData;
  setCurrentHVACCost: (e: number) => void;
  setCurrentTotalCost: (e: number) => void;
};

const YearBtuGraph: React.FC<YearBtuGraphProps> = ({
  formData,
  setCurrentHVACCost,
  setCurrentTotalCost,
}) => {
  const theme = useTheme();
  ChartJS.register(LinearScale, CategoryScale, PointElement, LineElement, Legend, Tooltip, Title);

  const chartRefBtu = useRef <ChartJSOrUndefined<"line", number[], unknown>>(null);

  const acCop = Number(formData.currentACSeer) * copInSeer;
  const furnaceEfficiency = Number(formData.currentFurnaceEfficiency) / 100;
  const electricPrice = Number(formData.electricPrice);
  const gasPrice = Number(formData.gasPrice);

  // in kBTU
  const rawBtuMonths = months.map((month: string) => {
    return (
      ((Number(formData.monthlyElectricUsage[month.toLowerCase() as keyof MonthlyUsage]) - formData.baseElectricUsage) * btuInkWh) +
      ((Number(formData.monthlyGasUsage[month.toLowerCase() as keyof MonthlyUsage]) - formData.baseGasUsage) * btuInCcf)
    ) / 1000;
  });

  const realBtuMonths = months.map((month: string) => {
    return (
      ((Number(formData.monthlyElectricUsage[month.toLowerCase() as keyof MonthlyUsage]) - formData.baseElectricUsage) * btuInkWh * acCop) +
      ((Number(formData.monthlyGasUsage[month.toLowerCase() as keyof MonthlyUsage]) - formData.baseGasUsage) * btuInCcf * furnaceEfficiency)
    ) / 1000;
  });

  const hvacCostMonths = months.map((month: string) => {
    return (
      ((Number(formData.monthlyElectricUsage[month.toLowerCase() as keyof MonthlyUsage]) - formData.baseElectricUsage) * electricPrice) +
      ((Number(formData.monthlyGasUsage[month.toLowerCase() as keyof MonthlyUsage]) - formData.baseGasUsage) * gasPrice)
    );
  });

  const totalCostMonths = months.map((month: string) => {
    return (
      ((Number(formData.monthlyElectricUsage[month.toLowerCase() as keyof MonthlyUsage])) * electricPrice) +
      ((Number(formData.monthlyGasUsage[month.toLowerCase() as keyof MonthlyUsage])) * gasPrice)
    );
  });

  const currentYearHVACCost = hvacCostMonths.reduce((acc, next) => acc + next);
  const currentYearTotalCost = totalCostMonths.reduce((acc, next) => acc + next);

  useEffect(() => {
    setCurrentHVACCost(currentYearHVACCost);
    setCurrentTotalCost(currentYearTotalCost);
  }, []);

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
        label: 'Raw kBTU',
        data: rawBtuMonths,
        borderColor: '#4e79a7',
        yAxisID: 'y',
        lineTension: 0.3,
        hidden: true,
      },
      {
        label: 'Real kBTU',
        data: realBtuMonths,
        borderColor: getLinearGradient(chartRefBtu),
        yAxisID: 'y',
        lineTension: 0.3,
      },
      {
        label: 'HVAC Cost',
        data: hvacCostMonths,
        borderColor: 'green',
        yAxisID: 'y1',
        lineTension: 0.3,
      },
      {
        label: 'Total Cost',
        data: totalCostMonths,
        borderColor: 'green',
        yAxisID: 'y1',
        lineTension: 0.3,
      },
    ],
  };

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
        y1: {
          type: 'linear' as const,
          beginAtZero: true,
          title: {
            text: '$ per month',
            display: true,
            color: theme.palette.text.primary,
          },
          display: true,
          position: 'right' as const,
          ticks: {
            color: theme.palette.text.primary,
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: `${formData.dataYear} HVAC energy transfer/month`,
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
      title='Energy use per month'
      data={data}
      width={500}
      height={500}
      options={btuOptions}
    />
  );
}

export default YearBtuGraph;