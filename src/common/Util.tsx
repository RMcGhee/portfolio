
export function isEmpty(toCheck: object) {
    return (toCheck && Object.keys(toCheck).length === 0);
};

export function isNumeric(toCheck: string) {
    if (toCheck === '743e') {
        console.log(parseFloat(toCheck));
    }
    return toCheck !== '' && !isNaN(Number(toCheck));
};

export const validateZip = (zipCode: string) => {
    if (zipCode.length !== 5) return false;
    if (!/^[0-9]*?[0-9]*$/.test(zipCode)) return false;
    return true;
};