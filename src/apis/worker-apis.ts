import type { DegreeDayData } from "../entities/DegreeDayData";
import type { ZipDist } from "../entities/ZipDist";

export const getZipDistUrl = 'https://worker.richmcghee.com/get-zip-dist'
export const getDdDataUrl = 'https://worker.richmcghee.com/get-dd-data'

export const getZipDist = async (zipCode: string, bypassCorsToken: string|null = null): Promise<ZipDist|null> => {
  const response = await fetch(`${getZipDistUrl}${bypassCorsToken ? '?bypassCorsToken=' + bypassCorsToken : ''}`, {
    method: 'POST',
    body: JSON.stringify({ 'zip': zipCode }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const responseData = await response.json();
  return responseData[0] as ZipDist ?? null;
};

export const getDdData = async (zipCode: string, bypassCorsToken: string|null = null): Promise<DegreeDayData|null> => {
  const response = await fetch(`${getDdDataUrl}${bypassCorsToken ? '?bypassCorsToken=' + bypassCorsToken : ''}`, {
    method: 'POST',
    body: JSON.stringify({ 'zip': zipCode }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const responseData = await response.json();
  return responseData[0] as DegreeDayData ?? null;
};