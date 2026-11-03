import { useId } from 'react';
import type { SVGProps } from 'react';

// The logo mark in the text colour, so it follows dark mode: a receipt inside a coin whose rim is two ribbons
// braided over and under each other, in the spirit of Mercury's woven emblem. public/logo.svg is the same mark.
// Every ribbon is drawn as two thin parallel lines: the mask paints it wide in white, then its middle in black.

const LINE = 1.3;
const BRAID_WIDTH = 4.2;
const RECEIPT_WIDTH = 4.8;

// The two strands circle the centre and swing in and out of each other, crossing 12 times
const TWISTS = 6;
const BRAID_RADIUS = 25.5;
const BRAID_SWING = 2.35;
const STEPS = 24;

// The piece of a strand around crossing `k`, from halfway after the previous crossing to halfway before the next.
// `overlap` (radians) lets neighbouring pieces overlap a little.
const braidPiece = (side: number, k: number, overlap: number) => {
  const half = Math.PI / TWISTS / 2;
  const from = (k * Math.PI) / TWISTS - half - overlap;
  const to = (k * Math.PI) / TWISTS + half + overlap;
  const points = Array.from({ length: STEPS + 1 }, (_, i) => {
    const angle = from + ((to - from) * i) / STEPS;
    const radius = BRAID_RADIUS + side * BRAID_SWING * Math.sin(TWISTS * angle);
    return `${(32 + radius * Math.cos(angle)).toFixed(2)} ${(32 + radius * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join('L')}`;
};

// The strands take turns being on top, so the pieces underneath are painted first. Each piece's black middle
// runs a little further than its white edges, so no seam shows where two pieces meet.
const crossings = Array.from({ length: TWISTS * 2 }, (_, k) => k);
const braid = (onTop: boolean, overlap: number) =>
  crossings.map((k) => braidPiece(k % 2 === Number(onTop) ? -1 : 1, k, overlap)).join('');
const lowerBraid = { edges: braid(false, 0.01), middle: braid(false, 0.05) };
const upperBraid = { edges: braid(true, 0.01), middle: braid(true, 0.05) };

// Rounded top, torn zig-zag bottom
const RECEIPT = 'M24.6 20.3Q24.6 18 26.9 18H37.1Q39.4 18 39.4 20.3V44.6L36.93 41.5L34.47 44.6L32 41.5L29.53 44.6L27.07 41.5L24.6 44.6Z';

const Ribbon = ({ edges, middle = edges, width }: { edges: string; middle?: string; width: number }) => (
  <>
    <path d={edges} stroke="#fff" strokeWidth={width} />
    <path d={middle} stroke="#000" strokeWidth={width - 2 * LINE} />
  </>
);

export const Logo = (props: SVGProps<SVGSVGElement>) => {
  // useId output can contain characters that are awkward inside url(#...)
  const maskId = `logo-${useId().replace(/[^\w-]/g, '')}`;

  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false" {...props}>
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
        <g fill="none" strokeMiterlimit={4}>
          <Ribbon {...lowerBraid} width={BRAID_WIDTH} />
          <Ribbon {...upperBraid} width={BRAID_WIDTH} />
          <Ribbon edges={RECEIPT} width={RECEIPT_WIDTH} />
          <circle cx="32" cy="32" r="31.15" stroke="#fff" strokeWidth={LINE} />
          <path d="M28.4 25.2H35.6M28.4 29.6H33.4" stroke="#fff" strokeWidth={LINE} strokeLinecap="round" />
        </g>
      </mask>
      <rect width="64" height="64" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
};
