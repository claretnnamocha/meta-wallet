/**
 * Format a numeric value with comma-separated thousands for display.
 * @param value - Number or string (e.g. balance from chain)
 * @param maxDecimals - Maximum decimal places (default 4)
 * @returns Formatted string e.g. "1,234,567.8900"
 */
export function formatCurrency(
  value: string | number,
  maxDecimals: number = 4
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}
