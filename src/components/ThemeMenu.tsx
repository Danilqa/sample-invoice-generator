import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ThemePreference } from '@/hooks/useTheme';

const themeOptions = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
] as const;

interface ThemeMenuProps {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
  className?: string;
}

// Icon button that opens the System / Light / Dark picker
export const ThemeMenu = ({ value, onChange, className }: ThemeMenuProps) => {
  const ActiveIcon = themeOptions.find((option) => option.value === value)?.Icon ?? Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change theme" title="Change theme" className={className}>
          <ActiveIcon className="size-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-44">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={(next) => onChange(next as ThemePreference)}>
          {themeOptions.map(({ value: optionValue, label, Icon }) => (
            <DropdownMenuRadioItem key={optionValue} value={optionValue}>
              <Icon className="text-muted-foreground" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
