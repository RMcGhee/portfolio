import { isEmpty, isNumeric, validateZip } from "../common/Util";
import type { DegreeDayData } from "./DegreeDayData";
import type { FormData } from "./FormData";
import type { ZipDist } from "./ZipDist";

export type CurrentSystemData = {
    currentACSeer: string
    currentFurnaceEfficiency: string
    desiredHeatPumpHspf: string
    desiredHeatPumpSeer: string
    zipCode: string
    selectedClimate: string
    zipDistData: ZipDist
    degreeDayData: DegreeDayData
  };

export const initCurrentSystem = (formData: FormData): CurrentSystemData => {
  return {
    currentACSeer: formData.currentACSeer,
    currentFurnaceEfficiency: formData.currentFurnaceEfficiency,
    desiredHeatPumpHspf: formData.desiredHeatPumpHspf,
    desiredHeatPumpSeer: formData.desiredHeatPumpSeer,
    zipCode: formData.zipCode,
    selectedClimate: formData.selectedClimate,
    zipDistData: {...formData.zipDistData},
    degreeDayData: {...formData.degreeDayData},
  } as CurrentSystemData;
};

export const validateCurrentSystemData = (formData: FormData): boolean => {
  return (
      (isNumeric(formData.desiredHeatPumpHspf) && isNumeric(formData.desiredHeatPumpSeer)) || 
      (isNumeric(formData.currentACSeer) && isNumeric(formData.currentFurnaceEfficiency))
    ) &&
    validateZip(formData.zipCode) &&
    !isEmpty(formData.zipDistData);
};