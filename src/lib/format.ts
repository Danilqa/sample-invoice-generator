// Uses toFixed(2) so the digits always match the generated PDF, then groups thousands
export function splitAmount(value: number): { whole: string; cents: string } {
  const [whole, cents = ''] = value.toFixed(2).split('.');
  return { whole: whole.replace(/\B(?=(\d{3})+(?!\d))/g, ','), cents };
}

export function formatAmount(value: number, symbol: string): string {
  const { whole, cents } = splitAmount(value);
  return cents ? `${symbol}${whole}.${cents}` : `${symbol}${whole}`;
}
