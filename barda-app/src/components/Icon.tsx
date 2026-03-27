/* ─── SVG Icon Component ─── */
/* Replaces all emoji usage with clean SVG icons */

import type { ReactNode } from "react";

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

function Circle({ color }: { color: string }) {
  return <circle cx="12" cy="12" r="8" fill={color} />;
}

function Face({ mouth }: { mouth: ReactNode }) {
  return (
    <>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" />
      <circle cx="15" cy="10" r="1.2" fill="currentColor" />
      {mouth}
    </>
  );
}

const ICONS: Record<string, ReactNode> = {
  /* ── UI Icons ── */
  sun: (
    <>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={12 + 6.5 * Math.cos(r)}
            y1={12 + 6.5 * Math.sin(r)}
            x2={12 + 8.5 * Math.cos(r)}
            y2={12 + 8.5 * Math.sin(r)}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}
    </>
  ),
  moon: (
    <path
      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  sparkle: (
    <>
      <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="19" cy="5" r="1" fill="currentColor" />
    </>
  ),
  heart: (
    <path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
    />
  ),
  trophy: (
    <>
      <path d="M6 9H4a2 2 0 01-2-2V5h4m10 4h2a2 2 0 002-2V5h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 5h16v4a6 6 0 01-6 6h-4a6 6 0 01-6-6V5z" stroke="currentColor" strokeWidth="2" />
      <path d="M9 21h6M12 15v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  warning: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </>
  ),
  check: (
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  fire: (
    <path
      d="M12 22c4-2.5 7-6 7-10 0-3-2-5.5-4-7-1 2-2.5 3-4 3s-3-1-4-3c-2 1.5-4 4-4 7 0 4 3 7.5 7 10h2z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  ),
  lightbulb: (
    <>
      <path d="M9 18h6M10 22h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 3h6v2H9V3z" stroke="currentColor" strokeWidth="2" />
      <path d="M9 10h6M9 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  memo: (
    <>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  chart: (
    <>
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  camera: (
    <>
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="14" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M9 8L7 2h3l2 3 2-3h3l-2 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 13l1.5 1.5L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  celebration: (
    <>
      <path d="M4 20l4.5-13L21.5 2.5 8.5 15.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 4l1 3M20 8l-3 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="18" cy="18" r="1" fill="currentColor" />
      <circle cx="3" cy="14" r="1" fill="currentColor" />
    </>
  ),
  "comment-bubble": (
    <path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  ),
  person: (
    <>
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M5.5 21a6.5 6.5 0 0113 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  bell: (
    <path
      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  money: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M14 9a3 3 0 00-3-1H9.5a2 2 0 000 4h3a2 2 0 010 4H11a3 3 0 01-3-1M12 5v2m0 10v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  cycle: (
    <>
      <path d="M1 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  /* ── Face / Condition Icons ── */
  "face-happy": <Face mouth={<path d="M8 14s1.5 3 4 3 4-3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />} />,
  "face-good": <Face mouth={<path d="M8.5 14.5s1.5 2 3.5 2 3.5-2 3.5-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />} />,
  "face-neutral": <Face mouth={<line x1="8.5" y1="15" x2="15.5" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />} />,
  "face-worried": <Face mouth={<path d="M15.5 16s-1.5-2-3.5-2-3.5 2-3.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />} />,
  "face-bad": <Face mouth={<path d="M16 17s-1.5-3-4-3-4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />} />,

  /* ── Colored Circles / Indicators ── */
  "red-circle": <Circle color="#EF4444" />,
  "orange-circle": <Circle color="#F97316" />,
  "yellow-circle": <Circle color="#EAB308" />,
  "green-circle": <Circle color="#22C55E" />,
  "blue-circle": <Circle color="#3B82F6" />,
  "brown-circle": <Circle color="#92400E" />,
  "black-circle": <Circle color="#374151" />,
  "white-circle": <><circle cx="12" cy="12" r="8" fill="white" stroke="#D1D5DB" strokeWidth="1.5" /></>,
  "purple-heart": <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" fill="#A855F7" />,
  "yellow-heart": <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" fill="#EAB308" />,
  "white-heart": <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5" />,

  /* ── Skincare Product Icons ── */
  bottle: (
    <>
      <rect x="7" y="8" width="10" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="9" y="4" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  bubble: (
    <>
      <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="12" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="14" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="13" cy="15" r="1" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  drop: (
    <path
      d="M12 2C12 2 5 10.5 5 15a7 7 0 0014 0C19 10.5 12 2 12 2z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  ),
  pad: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  diamond: (
    <path
      d="M6 3h12l4 6-10 13L2 9l4-6z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  ),
  orange: (
    <>
      <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6V3M10 4c1-1.5 3-1.5 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  lightning: (
    <path
      d="M13 2L4.09 12.63a1 1 0 00.78 1.62H11l-1 7.75L19.91 11.37a1 1 0 00-.78-1.62H13l1-7.75z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  ),
  droplets: (
    <>
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05S9.5 7 7 3.5C4.5 7 3 10.03 3 12.25s1.8 4.05 4 4.05z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M17 20.3c2.2 0 4-1.83 4-4.05S19.5 11 17 7.5c-2.5 3.5-4 6.53-4 8.75s1.8 4.05 4 4.05z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  jar: (
    <>
      <rect x="4" y="9" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="5" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </>
  ),
  mask: (
    <>
      <path d="M4 8c0 0 2-2 8-2s8 2 8 2v5c0 4-3.5 7-8 7s-8-3-8-7V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 12h0M15 12h0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  package: (
    <>
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  flag: (
    <>
      <path d="M4 21v-16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 5s2-1 5 0 5-1 8 0 3 1 3 1v8s-1-1-3 0-5 1-8 0-5 0-5 0" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </>
  ),

  /* ── Ingredient / Science Icons ── */
  beaker: (
    <>
      <path d="M9 3h6M10 3v5.2L5 18.5A2 2 0 006.7 21h10.6a2 2 0 001.7-2.5L14 8.2V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 15h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  microscope: (
    <>
      <path d="M12 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 20h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="8" y="16" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  dna: (
    <>
      <path d="M7 4c0 4 10 4 10 8s-10 4-10 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 4c0 4-10 4-10 8s10 4 10 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 8h10M7 16h10M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  pill: (
    <path
      d="M10.5 1.5L3 9a4.24 4.24 0 006 6l7.5-7.5a4.24 4.24 0 00-6-6zM7.5 7.5l4.5 4.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  ),
  shield: (
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  "diamond-orange": <path d="M6 3h12l4 6-10 13L2 9l4-6z" fill="#F97316" stroke="#EA580C" strokeWidth="0.5" />,

  /* ── Nature / Ingredient Icons ── */
  leaf: (
    <>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-4.44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.59 5.41A10.61 10.61 0 018.04 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20.59 5.41C17.45 2.27 8 3 8 3s-.73 9.45 2.41 12.59" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  seedling: (
    <>
      <path d="M12 22V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 10c0-4 6-8 6-8s6 4 6 8c0 2-2 4-6 4s-6-2-6-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  plant: (
    <>
      <path d="M12 22V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 13C12 9 8 6 4 6c0 4 3 7 8 7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 10c0-4 4-7 8-7-1 4-4 7-8 7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <rect x="8" y="20" width="8" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  "pine-tree": (
    <>
      <path d="M12 3L6 13h3l-2 4h3l-2 4h8l-2-4h3l-2-4h3L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  mushroom: (
    <>
      <path d="M12 14V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4 14c0-5 3.5-10 8-10s8 5 8 10H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  wheat: (
    <>
      <path d="M12 22V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 10l6-4M18 10l-6-4M6 14l6-4M18 14l-6-4M6 18l6-4M18 18l-6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  burst: (
    <path
      d="M12 2l2 4 4-1-2 4 4 2-4 2 2 4-4-1-2 4-2-4-4 1 2-4-4-2 4-2-2-4 4 1 2-4z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  "cherry-blossom": (
    <>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      {[0, 72, 144, 216, 288].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <ellipse
            key={a}
            cx={12 + 6 * Math.cos(r)}
            cy={12 + 6 * Math.sin(r)}
            rx="2.5"
            ry="3.5"
            transform={`rotate(${a} ${12 + 6 * Math.cos(r)} ${12 + 6 * Math.sin(r)})`}
            stroke="currentColor"
            strokeWidth="1.2"
          />
        );
      })}
    </>
  ),

  /* ── Skin Type Icons ── */
  desert: (
    <>
      <path d="M3 18c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M7 14l2-4 3 2 2-5 3 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  thermometer: (
    <>
      <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" stroke="currentColor" strokeWidth="2" />
      <circle cx="11.5" cy="17.5" r="2" fill="currentColor" />
    </>
  ),
  wavy: (
    <>
      <path d="M3 8c2-2 4 2 6 0s4-2 6 0 4 2 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 14c2-2 4 2 6 0s4-2 6 0 4 2 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),

  /* ── Weather Icons ── */
  "sun-cloud": (
    <>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line key={a} x1={8 + 4 * Math.cos(r)} y1={8 + 4 * Math.sin(r)} x2={8 + 5.5 * Math.cos(r)} y2={8 + 5.5 * Math.sin(r)} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        );
      })}
      <path d="M7 16a4 4 0 014-4h2a5 5 0 015 5H8a4 4 0 01-1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  "partly-cloudy": (
    <>
      <circle cx="9" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 16H8a4 4 0 010-8h1a5 5 0 019 3 3 3 0 012 5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  cloudy: (
    <path
      d="M20 17H8a5 5 0 010-10h.5A6 6 0 0118 10a4 4 0 012 7z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  ),
  foggy: (
    <>
      <path d="M4 6h16M4 10h12M4 14h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  drizzle: (
    <>
      <path d="M18 14H7a4 4 0 010-8h.5A5 5 0 0116 8a3 3 0 012 6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 18v1M12 17v2M16 18v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  rainy: (
    <>
      <path d="M18 14H7a4 4 0 010-8h.5A5 5 0 0116 8a3 3 0 012 6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 18l-1 3M11 17l-1 3M15 18l-1 3M19 17l-1 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  snowy: (
    <>
      <path d="M18 14H7a4 4 0 010-8h.5A5 5 0 0116 8a3 3 0 012 6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="8" cy="18" r="1" fill="currentColor" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
      <circle cx="16" cy="18" r="1" fill="currentColor" />
    </>
  ),
  thunderstorm: (
    <>
      <path d="M18 12H7a4 4 0 010-8h.5A5 5 0 0116 6a3 3 0 012 6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M13 12l-3 5h4l-2 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  /* ── Weather-tip / misc Icons ── */
  "cold-face": <Face mouth={<><path d="M8 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M6 7l2 1M18 7l-2 1" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" /></>} />,
  jacket: (
    <>
      <path d="M6 4l-3 6v10h6V10l3-6h0l3 6v10h6V10l-3-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 4v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  "hot-face": <Face mouth={<><path d="M9 15s1 2 3 2 3-2 3-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M4 3l2 2M20 3l-2 2" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" /></>} />,
  "mask-face": (
    <>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" />
      <circle cx="15" cy="9" r="1.2" fill="currentColor" />
      <rect x="7" y="12" width="10" height="5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 14h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </>
  ),
  wind: (
    <>
      <path d="M17.7 7.7A2.5 2.5 0 0119.5 5 2.5 2.5 0 0121 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 12h15.5a2.5 2.5 0 001-4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 16h11a3 3 0 010 6 3 3 0 01-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  leaves: (
    <>
      <path d="M6 19c0-5 3-9 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 10C14 6 10 3 6 3c0 4 3 7 8 7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 15c0-4-3-7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 8c0-3 3-6 7-6 0 3-3 6-7 6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </>
  ),
  ice: (
    <>
      <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07L19.07 4.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  "autumn-leaf": (
    <>
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 8c0 5 3 9 8 9s8-4 8-9C16 4 12 2 12 2S8 4 4 8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 12l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  scarf: (
    <>
      <path d="M4 6c0-1 1-2 3-2h10c2 0 3 1 3 2v3c0 1-1 2-3 2H7c-2 0-3-1-3-2V6z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 11v7a2 2 0 01-2 2h0a2 2 0 01-2-2v-7" stroke="currentColor" strokeWidth="2" />
      <path d="M6 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),

  /* ── Rank Medals ── */
  "gold-medal": (
    <>
      <circle cx="12" cy="14" r="6" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" />
      <path d="M9 8L7 2h3l2 3 2-3h3l-2 6" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="12" y="17" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#92400E">1</text>
    </>
  ),
  "silver-medal": (
    <>
      <circle cx="12" cy="14" r="6" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1.5" />
      <path d="M9 8L7 2h3l2 3 2-3h3l-2 6" stroke="#6B7280" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="12" y="17" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#374151">2</text>
    </>
  ),
  "thumbs-up": (
    <path
      d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "thumbs-down": (
    <path
      d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "bronze-medal": (
    <>
      <circle cx="12" cy="14" r="6" fill="#FDBA74" stroke="#C2410C" strokeWidth="1.5" />
      <path d="M9 8L7 2h3l2 3 2-3h3l-2 6" stroke="#C2410C" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="12" y="17" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#7C2D12">3</text>
    </>
  ),

  /* ── Community / KakaoTalk ── */
  chat: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="1.5" />
    </>
  ),
  hospital: (
    <>
      <path d="M3 21h18M9 8h6M12 5v6M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14" strokeWidth="1.5" />
      <path d="M9 21v-4h6v4" strokeWidth="1.5" />
    </>
  ),
  "help-circle": (
    <>
      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeWidth="1.5" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="1.5" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="1.5" />
    </>
  ),
  "x-circle": (
    <>
      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
      <path d="M15 9l-6 6M9 9l6 6" strokeWidth="1.5" />
    </>
  ),
  "chevron-right": (
    <path d="M9 18l6-6-6-6" strokeWidth="2" />
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" strokeWidth="1.5" />
      <circle cx="6" cy="12" r="3" strokeWidth="1.5" />
      <circle cx="18" cy="19" r="3" strokeWidth="1.5" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" strokeWidth="1.5" />
    </>
  ),
};

export default function Icon({ name, size = 20, className = "" }: IconProps) {
  const icon = ICONS[name];
  if (!icon) {
    // Fallback: render name as text
    return <span className={className} style={{ fontSize: size }}>{name}</span>;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
    >
      {icon}
    </svg>
  );
}
