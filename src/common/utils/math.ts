export const randomDouble = (from: number, until: number) =>
  Math.random() * (until - from) + from;
export const randomInt = (from: number, until: number) =>
  Math.round(randomDouble(from, until));
export const round = (num: number, decimals: number) =>
  Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
export const countDecimals = (value: number) =>
  Math.floor(value) === value ? 0 : value.toString().split('.')[1].length || 0;
