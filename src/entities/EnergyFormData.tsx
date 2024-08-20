import { isNumeric } from "../common/Util";
import { FormData } from "./FormData";

export type EnergyFormData = {
  dataYear: 2021 | 2022 | 2023;
  monthlyGasUsage: MonthlyUsage;
  monthlyElectricUsage: MonthlyUsage;
  electricPrice: string;
  gasPrice: string;
  gasUnits: 'ccf' | 'therm';
};

export type MonthlyUsage = {
  jan: string;
  feb: string;
  mar: string;
  apr: string;
  may: string;
  jun: string;
  jul: string;
  aug: string;
  sep: string;
  oct: string;
  nov: string;
  dec: string;
};

export const defaultMonthlyUsage = {
  jan: '',
  feb: '',
  mar: '',
  apr: '',
  may: '',
  jun: '',
  jul: '',
  aug: '',
  sep: '',
  oct: '',
  nov: '',
  dec: '',
};

export const initEnergyForm = (formData: FormData): EnergyFormData => {
  return {
    dataYear: formData.dataYear,
    monthlyGasUsage: {...formData.monthlyGasUsage},
    monthlyElectricUsage: {...formData.monthlyElectricUsage},
    electricPrice: formData.electricPrice,
    gasPrice: formData.gasPrice,
    gasUnits: formData.gasUnits,
  } as EnergyFormData;
};

export const validateEnergyFormData = (formData: FormData): boolean => {
  return (
      Object.entries(formData.monthlyElectricUsage).map(([_month, usage]) => isNumeric(usage)).every((entry) => entry) &&
      Object.entries(formData.monthlyGasUsage).map(([_month, usage]) => isNumeric(usage)).every((entry) => entry)
    ) &&
    isNumeric(formData.electricPrice) &&
    isNumeric(formData.gasPrice);
  return true;
};