/** Serializable navigation data, built on the server and passed to client menus. */
export interface NavLink {
  label: string;
  href: string;
}

export interface NavItem extends NavLink {
  /** "All handles"-style link to the parent category, shown first in its submenu. */
  allLabel?: string;
  children?: NavLink[];
}

/** True when `pathname` is `href` or inside it (for aria-current / active styling). */
export function isActivePath(
  pathname: string,
  href: string,
): "page" | "section" | null {
  if (pathname === href) return "page";
  if (href !== "/" && href !== "/en" && pathname.startsWith(`${href}/`))
    return "section";
  return null;
}
