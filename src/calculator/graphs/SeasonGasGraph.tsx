import React, { useEffect, useRef } from 'react';
import { FormData, ddDataForYear } from '../../entities/FormData';
import { MonthlyUsage, } from '../../entities/EnergyFormData';
import { DegreeDayMonths } from '../../entities/DegreeDayData';
import { Chart as ChartJS, LinearScale, CategoryScale, PointElement, LineElement, Legend, Tooltip, Title, ScatterController, } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { SimpleLinearRegression } from 'ml-regression-simple-linear';
import { MonthDataEntry } from '../EnergyUsageAnalysis';
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import { useTheme } from '@mui/material';

type SeasonGasGraphProps = {
  formData: FormData;
  setBaseGasUsage: (e: number) => void;
};

const SeasonGasGraph: React.FC<SeasonGasGraphProps> = ({
  formData,
  setBaseGasUsage,
}) => {
  const theme = useTheme();
  ChartJS.register(LinearScale, CategoryScale, PointElement, LineElement, Legend, Tooltip, Title, ScatterController);

  const chartRefGas = useRef <ChartJSOrUndefined<"line" | "scatter", {x: number; y: number;}[], unknown>>(null);

  const getLinearGradient = (chartRef: React.RefObject<ChartJSOrUndefined<"line" | "scatter", {x: number; y: number;}[], unknown>>) => {
    if (chartRef && chartRef.current) {
      const chart = chartRef.current;
      const ctx = chart.ctx;
      
      const gradient = ctx.createLinearGradient(0, 0, 25, 0);
      gradient.addColorStop(0, 'blue');
      gradient.addColorStop(1, 'red');
      return gradient;
    }
  };

  const [yearCoolingData, yearHeatingData] = ddDataForYear(formData);

  // Where the next two return [['mon', [kWh/gas usage for month, dd for month]]
  const coolingMonthsGas = Object.entries(yearCoolingData).map(([month, dd]) => {
    if (dd > formData.degreeDayData.heating[month as keyof DegreeDayMonths]) {
      return [month, [Number(formData.monthlyGasUsage[month as keyof MonthlyUsage]), dd]];
    }
    return null;
  })
  .filter((entry): entry is MonthDataEntry => entry !== null);

  const heatingMonthsGas = Object.entries(yearHeatingData).map(([month, dd]) => {
    if (dd > formData.degreeDayData.cooling[month as keyof DegreeDayMonths]) {
      return [month, [Number(formData.monthlyGasUsage[month as keyof MonthlyUsage]), dd]];
    }
    return null;
  })
  .filter((entry): entry is MonthDataEntry => entry !== null);
  
  const coolingMonthScatter = coolingMonthsGas.map(([k, [unit, dd]]) => ({ x: dd, y: unit }));
  const heatingMonthScatter = heatingMonthsGas.map(([k, [unit, dd]]) => ({ x: dd, y: unit }));
  const coolingMonthLine = new SimpleLinearRegression(coolingMonthScatter.map((pair) => pair.x), coolingMonthScatter.map((pair) => pair.y));
  const heatingMonthLine = new SimpleLinearRegression(heatingMonthScatter.map((pair) => pair.x), heatingMonthScatter.map((pair) => pair.y));
  const coolingMonthMaxDd = Math.max(...coolingMonthsGas.map(([k, [unit, dd]]) => dd));
  const heatingMonthMaxDd = Math.max(...heatingMonthsGas.map(([k, [unit, dd]]) => dd));

  useEffect(() => {
    if (coolingMonthLine && heatingMonthLine) {
      setBaseGasUsage(coolingMonthsGas.map(([k, [unit, dd]]) => unit).reduce((a, b) => a + b) / coolingMonthsGas.length);
    }
  }, [coolingMonthLine, heatingMonthLine]);

  const chartData = {
    datasets: [
      {
        type: 'scatter' as const,
        label: 'Cooling gas',
        data: coolingMonthsGas.map(([k, [unit, dd]]) => ({ x: dd, y: unit })),
        backgroundColor: '#4e79a7',
      },
      {
        type: 'line' as const,
        label: 'Trend',
        data: [{x: 0, y: coolingMonthLine.intercept}, {x: coolingMonthMaxDd, y: coolingMonthLine.predict(coolingMonthMaxDd)}],
        borderColor: '#4e79a7',
        borderWidth: 2,
      },
      {
        type: 'scatter' as const,
        label: 'Heating gas',
        data: heatingMonthsGas.map(([k, [unit, dd]]) => ({ x: dd, y: unit })),
        backgroundColor: '#e15759',
      },
      {
        type: 'line' as const,
        label: 'Trend',
        data: [{x: 0, y: heatingMonthLine.intercept}, {x: heatingMonthMaxDd, y: heatingMonthLine.predict(heatingMonthMaxDd)}],
        borderColor: '#e15759',
        borderWidth: 2,
      },
    ],
  };

  return (
    <Chart
      ref={chartRefGas}
      key='seasonGasGraph'
      title={`Gas (${formData.gasUnits}) per season`}
      type='scatter'
      data={chartData}
      width={400}
      height={400}
      options={{
        scales: {
          x: {
            beginAtZero: true,
            title: {
              text: 'DegreeDays',
              display: true,
              color: getLinearGradient(chartRefGas),
            },
            ticks: {
              color: theme.palette.text.primary,
            }
          },
          y: {
            beginAtZero: true,
            title: {
              text: `Gas (${formData.gasUnits})`,
              display: true,
              color: theme.palette.text.primary,
            },
            ticks: {
              color: theme.palette.text.primary,
            },
          }
        },
        plugins: {
          title: {
            display: true,
            text: `Gas (${formData.gasUnits}) per season`,
            align: 'center',
            color: theme.palette.text.primary,
            font: {
              size: 18
            }
          },
        },
      }}
    />
  );
}

export default SeasonGasGraph;
