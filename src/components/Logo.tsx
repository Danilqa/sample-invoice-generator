import { useId } from 'react';
import type { SVGProps } from 'react';

// Inline copy of public/logo.svg that follows the text colour (and so dark mode)
export const Logo = (props: SVGProps<SVGSVGElement>) => {
  // useId output can contain characters that are awkward inside url(#...)
  const maskId = `logo-sheet-${useId().replace(/[^\w-]/g, '')}`;

  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
          <rect width="32" height="32" fill="#fff" />
          <path d="M11.5 8.75h6.25l3 3v11.5h-9.25z" fill="#000" />
          <path d="M17.75 8.75v3h3" stroke="#fff" strokeWidth="1.25" strokeLinejoin="round" />
          <path d="M14 16.25h4.25M14 19.5h2.75" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </mask>
      </defs>
      <circle cx="16" cy="16" r="15.125" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="16" cy="16" r="12.25" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
};
