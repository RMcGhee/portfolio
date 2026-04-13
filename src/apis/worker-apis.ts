import type { DegreeDayData } from "../entities/DegreeDayData";
import type { ZipDist } from "../entities/ZipDist";

const workerBaseUrl = import.meta.env.DEV
  ? "/api"
  : "https://worker.richmcghee.com";

export const getZipDistUrl = `${workerBaseUrl}/get-zip-dist`;
export const getDdDataUrl = `${workerBaseUrl}/get-dd-data`;

export const getZipDist = async (
  zipCode: string,
  bypassCorsToken: string | null = null,
): Promise<ZipDist | null> => {
  const response = await fetch(
    `${getZipDistUrl}${bypassCorsToken ? "?bypassCorsToken=" + bypassCorsToken : ""}`,
    {
      method: "POST",
      body: JSON.stringify({ zip: zipCode }),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const responseData = await response.json();
  return (responseData[0] as ZipDist) ?? null;
};

export const getDdData = async (
  zipCode: string,
  bypassCorsToken: string | null = null,
): Promise<DegreeDayData | null> => {
  const response = await fetch(
    `${getDdDataUrl}${bypassCorsToken ? "?bypassCorsToken=" + bypassCorsToken : ""}`,
    {
      method: "POST",
      body: JSON.stringify({ zip: zipCode }),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const responseData = await response.json();
  return (responseData[0] as DegreeDayData) ?? null;
};
