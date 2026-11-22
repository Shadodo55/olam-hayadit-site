import type { SVGProps } from "react";

/** Small inline icon set. Decorative by default: always pair with visible or sr-only text. */
type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="M15 15l5 5" />
  </Svg>
);

/** "My list": a ruled list with a check, i.e. a shopping/visit list. */
export const ListIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 7h10M10 12h10M10 17h10" />
    <path d="M4 7l1.2 1.2L7.5 6M4 12l1.2 1.2 2.3-2.2M4 17h3" />
  </Svg>
);

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 4h3.5l1.8 4.5-2.3 1.4a10 10 0 0 0 6.1 6.1l1.4-2.3L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z" />
  </Svg>
);

/** Generic chat bubble (not a brand logo). */
export const ChatIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.1A8 8 0 1 1 20 11.5z" />
  </Svg>
);

export const PinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s6.5-5.6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.4 6.5 11 6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg width="14" height="14" {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);

/**
 * The brand mark: a bar pull handle seen from the side. It doubles as a
 * hole-to-hole dimension line (the two posts are the screw centres).
 */
export const HandleMark = (p: IconProps) => (
  <svg
    viewBox="0 0 40 14"
    width="40"
    height="14"
    aria-hidden="true"
    focusable="false"
    {...p}
  >
    <rect x="0" y="0" width="40" height="3.2" rx="1.6" fill="currentColor" />
    <rect x="6" y="3" width="3.2" height="11" fill="currentColor" />
    <rect x="30.8" y="3" width="3.2" height="11" fill="currentColor" />
  </svg>
);
