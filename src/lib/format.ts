// Same digits as the generated PDF: two decimals with thousands separators (e.g. 3,588.71)
export function splitAmount(value: number): { whole: string; cents: string } {
  const formatted = value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [whole, cents = ''] = formatted.split('.');
  return { whole, cents };
}

export function formatAmount(value: number, symbol: string): string {
  const { whole, cents } = splitAmount(value);
  return cents ? `${symbol}${whole}.${cents}` : `${symbol}${whole}`;
}
