import { CalculatedData, MonthData } from "./CalculatedData";
import { CurrentSystemData } from "./CurrentSystemData";
import { DegreeDayData, DegreeDayMonths } from "./DegreeDayData";
import { EnergyFormData, defaultMonthlyUsage, } from "./EnergyFormData";
import { ZipDist } from "./ZipDist";

export type FormData = CurrentSystemData & EnergyFormData & CalculatedData & {};

export const defaultFormData: FormData = {
    currentACSeer: '',
    currentFurnaceEfficiency: '',
    desiredHeatPumpHspf: '',
    desiredHeatPumpSeer: '',
    zipCode: '',
    selectedClimate: '',
    zipDistData: {} as ZipDist,
    degreeDayData: {} as DegreeDayData,
    dataYear: 2023,
    monthlyGasUsage: defaultMonthlyUsage,
    monthlyElectricUsage: defaultMonthlyUsage,
    electricPrice: '',
    gasPrice: '',
    gasUnits: 'ccf',
    baseElectricUsage: 0,
    baseGasUsage: 0,
    averagekBTUdd: 0,
    estimatedkBTUmonths: {} as MonthData,
    currentHvacCost: 0,
    currentTotalCost: 0,
    desiredHvacCost: 0,
    desiredTotalCost: 0,
    oldHvacCost: 0,
};

/**
 * @param formData 
 * @returns [DegreeDayMonths, DegreeDayMonths] - cooling, heating
 */
export const ddDataForYear = function(formData: FormData): [DegreeDayMonths, DegreeDayMonths] {
    switch (formData.dataYear) {
        case 2023:
            return [formData.degreeDayData.year_2023.cooling, formData.degreeDayData.year_2023.heating];
        case 2022:
            return [formData.degreeDayData.year_2022.cooling, formData.degreeDayData.year_2022.heating];
        case 2021:
            return [formData.degreeDayData.year_2021.cooling, formData.degreeDayData.year_2021.heating];
    }
}