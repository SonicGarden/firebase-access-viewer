import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const FlameIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 24 24' fill='currentColor' {...props}>
    <path d='M13 2c0 3-4 4-4 8a4 4 0 0 0 8 0c0-1-.3-2-.8-3 1.5 1 2.8 3 2.8 6a6 6 0 1 1-12 0c0-5 5-6 6-11z' />
  </svg>
);

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props}>
    <circle cx='11' cy='11' r='7' />
    <path d='m20 20-3.5-3.5' />
  </svg>
);

export const XIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2.2} {...props}>
    <path d='M6 6l12 12M18 6L6 18' />
  </svg>
);

export const ReloadIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props}>
    <path d='M3 12a9 9 0 0 1 15.5-6.3L21 8' />
    <path d='M21 3v5h-5' />
    <path d='M21 12a9 9 0 0 1-15.5 6.3L3 16' />
    <path d='M3 21v-5h5' />
  </svg>
);

export const TrashIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props}>
    <path d='M4 7h16' />
    <path d='M10 11v6M14 11v6' />
    <path d='M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13' />
    <path d='M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' />
  </svg>
);

export const CaretIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2.4} {...props}>
    <path d='m9 6 6 6-6 6' />
  </svg>
);

export const InboxIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={1.5} {...props}>
    <path d='M22 12h-6l-2 3h-4l-2-3H2' />
    <path d='M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z' />
  </svg>
);

export const WarnIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2.5} {...props}>
    <path d='M12 9v4M12 17h.01' />
    <path d='M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
  </svg>
);

