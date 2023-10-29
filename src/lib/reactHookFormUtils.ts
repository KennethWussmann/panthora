export const numberOrNull = (value: string | null | undefined) =>
  value === "" || value === null || value === undefined
    ? null
    : parseInt(value, 10);
