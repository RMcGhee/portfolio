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

export const dummyData = {
    "id": 174,
    "city": "KANSAS CITY, MO",
    "lat": 39.11,
    "lon": -94.54,
    "zip": "64124",
    "cooling": {
        "apr": 22,
        "aug": 424,
        "dec": 0,
        "feb": 0,
        "jan": 0,
        "jul": 415,
        "jun": 339,
        "mar": 0,
        "may": 123,
        "nov": 2,
        "oct": 30,
        "sep": 179
    },
    "heating": {
        "apr": 318,
        "aug": 0,
        "dec": 902,
        "feb": 951,
        "jan": 983,
        "jul": 0,
        "jun": 2,
        "mar": 598,
        "may": 95,
        "nov": 618,
        "oct": 224,
        "sep": 15
    },
    "year_2021": {
        "cooling": {
            "apr": 34,
            "aug": 463,
            "dec": 0,
            "feb": 0,
            "jan": 0,
            "jul": 430,
            "jun": 367,
            "mar": 0,
            "may": 82,
            "nov": 0,
            "oct": 39,
            "sep": 224
        },
        "heating": {
            "apr": 305,
            "aug": 0,
            "dec": 676,
            "feb": 1167,
            "jan": 954,
            "jul": 0,
            "jun": 0,
            "mar": 465,
            "may": 119,
            "nov": 549,
            "oct": 197,
            "sep": 15
        }
    },
    "year_2022": {
        "cooling": {
            "apr": 17,
            "aug": 437,
            "dec": 0,
            "feb": 0,
            "jan": 0,
            "jul": 423,
            "jun": 350,
            "mar": 0,
            "may": 158,
            "nov": 5,
            "oct": 51,
            "sep": 211
        },
        "heating": {
            "apr": 352,
            "aug": 0,
            "dec": 992,
            "feb": 921,
            "jan": 1106,
            "jul": 0,
            "jun": 3,
            "mar": 619,
            "may": 107,
            "nov": 641,
            "oct": 225,
            "sep": 24
        }
    },
    "year_2023": {
        "cooling": {
            "apr": 14,
            "aug": 372,
            "dec": 0,
            "feb": 0,
            "jan": 0,
            "jul": 391,
            "jun": 301,
            "mar": 0,
            "may": 129,
            "nov": 0,
            "oct": 0,
            "sep": 102
        },
        "heating": {
            "apr": 298,
            "aug": 0,
            "dec": 1039,
            "feb": 764,
            "jan": 888,
            "jul": 0,
            "jun": 2,
            "mar": 711,
            "may": 58,
            "nov": 665,
            "oct": 251,
            "sep": 5
        }
    },
    "coord_vector": "[39.11,-94.54]"
} as unknown as DegreeDayData;