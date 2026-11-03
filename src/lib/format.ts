// Same digits as the generated PDF: toFixed(2) with no thousands separators (e.g. 3588.71)
export function splitAmount(value: number): { whole: string; cents: string } {
  const [whole, cents = ''] = value.toFixed(2).split('.');
  return { whole, cents };
}

export function formatAmount(value: number, symbol: string): string {
  const { whole, cents } = splitAmount(value);
  return cents ? `${symbol}${whole}.${cents}` : `${symbol}${whole}`;
}
