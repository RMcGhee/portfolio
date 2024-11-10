import type { ZipDist } from "../entities/ZipDist";

export const getZipDistUrl = 'https://worker.richmcghee.com/get-zip-dist'
export const getDdData = 'https://worker.richmcghee.com/get-dd-data'

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