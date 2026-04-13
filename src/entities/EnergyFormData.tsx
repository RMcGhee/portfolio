import { isNumeric } from "../common/Util";
import { type FormData } from "./FormData";

export type EnergyFormData = {
  dataYear: 2021 | 2022 | 2023;
  monthlyGasUsage: MonthlyUsage;
  monthlyElectricUsage: MonthlyUsage;
  electricPrice: string;
  gasPrice: string;
  gasUnits: "ccf" | "therm";
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
  jan: "",
  feb: "",
  mar: "",
  apr: "",
  may: "",
  jun: "",
  jul: "",
  aug: "",
  sep: "",
  oct: "",
  nov: "",
  dec: "",
};

export const initEnergyForm = (formData: FormData): EnergyFormData => {
  return {
    dataYear: formData.dataYear,
    monthlyGasUsage: { ...formData.monthlyGasUsage },
    monthlyElectricUsage: { ...formData.monthlyElectricUsage },
    electricPrice: formData.electricPrice,
    gasPrice: formData.gasPrice,
    gasUnits: formData.gasUnits,
  } as EnergyFormData;
};

export const validateEnergyFormData = (formData: FormData): boolean => {
  return (
    Object.entries(formData.monthlyElectricUsage)
      .map(([_month, usage]) => isNumeric(usage))
      .every((entry) => entry) &&
    Object.entries(formData.monthlyGasUsage)
      .map(([_month, usage]) => isNumeric(usage))
      .every((entry) => entry) &&
    isNumeric(formData.electricPrice) &&
    isNumeric(formData.gasPrice)
  );
};

export const fixtureElectricUsage = {
  jan: "743",
  feb: "725",
  mar: "589",
  apr: "550",
  may: "714",
  jun: "1243",
  jul: "1635",
  aug: "1384",
  sep: "972",
  oct: "529",
  nov: "620",
  dec: "723",
};

export const fixtureGasUsage = {
  jan: "171",
  feb: "156",
  mar: "143",
  apr: "65",
  may: "25",
  jun: "13",
  jul: "12",
  aug: "12",
  sep: "11",
  oct: "20",
  nov: "69",
  dec: "134",
};
