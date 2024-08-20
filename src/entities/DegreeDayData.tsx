export type DegreeDayData = {
    city: string
    id: number
    lat: number
    lon: number
    zip: string
    cooling: DegreeDayMonths // average for three years
    heating: DegreeDayMonths // average for three years
    year_2021: {cooling: DegreeDayMonths, heating: DegreeDayMonths}
    year_2022: {cooling: DegreeDayMonths, heating: DegreeDayMonths}
    year_2023: {cooling: DegreeDayMonths, heating: DegreeDayMonths}
};

export type DegreeDayMonths = {
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

export const initDegreeDayMonths = (data: {[key: string]: string}): DegreeDayMonths => {
    let convert = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, Number(value)]));
    return convert as unknown as DegreeDayMonths;
};