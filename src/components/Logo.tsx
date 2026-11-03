import { useId } from 'react';
import type { SVGProps } from 'react';

// Inline copy of public/logo.svg that follows the text colour (and so dark mode):
// a coin with a torn-off receipt cut out of it
export const Logo = (props: SVGProps<SVGSVGElement>) => {
  // useId output can contain characters that are awkward inside url(#...)
  const maskId = `logo-receipt-${useId().replace(/[^\w-]/g, '')}`;

  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
          <rect width="32" height="32" fill="#fff" />
          <path d="M10 8H22V24L20 22L18 24L16 22L14 24L12 22L10 24Z" fill="#000" />
          <path d="M13 12h6v2h-6zM13 16h4v2h-4z" fill="#fff" />
        </mask>
      </defs>
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="12" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
};
