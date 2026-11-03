import { ArrowUpRight, Star } from 'lucide-react';

interface StarBannerProps {
  onDismiss: () => void;
}

// Full-width GitHub star prompt; clicking it opens the repo and hides the banner for good
export const StarBanner = ({ onDismiss }: StarBannerProps) => (
  <a
    href="https://github.com/Danilqa/sample-invoice-generator"
    target="_blank"
    rel="noopener noreferrer"
    onClick={onDismiss}
    className="group flex h-9 shrink-0 items-center justify-center gap-2 bg-neutral-950 px-4 text-[13px] text-white/90 transition-colors hover:text-white keyboard-focus:underline keyboard-focus:underline-offset-4 outline-none keyboard-focus:outline-solid keyboard-focus:outline-2 keyboard-focus:-outline-offset-4 keyboard-focus:outline-white/70 dark:border-b dark:border-white/10 dark:bg-neutral-900"
  >
    <Star className="size-3.5 shrink-0 fill-current" aria-hidden="true" />
    <span className="truncate">Support this app by giving it a star on GitHub</span>
    <ArrowUpRight
      className="size-3.5 shrink-0 opacity-50 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
      aria-hidden="true"
    />
  </a>
);
