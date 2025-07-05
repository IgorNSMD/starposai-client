// src/utils/formatters.ts

export const formatCurrency = (value: number, symbol: string = "$"): string => {
  if (isNaN(value)) return `${symbol}0.00`;
  return `${symbol}${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
};

