import { cn } from '@/lib/utils';
import { splitAmount } from '@/lib/format';

interface AmountProps {
  value: number;
  symbol: string;
  className?: string;
}

// Mercury-style figure: tabular digits with smaller, raised cents
export const Amount = ({ value, symbol, className }: AmountProps) => {
  const { whole, cents } = splitAmount(value);

  return (
    <span className={cn('whitespace-nowrap tabular-nums', className)}>
      {symbol}
      {whole}
      {cents && <span className="ml-[0.04em] align-[0.5em] text-[0.58em] tracking-normal">.{cents}</span>}
    </span>
  );
};
