export const stringToBoolean = (booleanAsString?: string | undefined | null): boolean => {
  return !!booleanAsString && booleanAsString.toLowerCase() === 'true';
};

export const booleanToString = (booleanValue?: boolean | undefined | null): string => {
  return booleanValue === true ? 'true' : 'false';
};
