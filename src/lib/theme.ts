/**
 * Colour themes (design demo). The CSS for each theme lives in globals.css
 * under [data-theme="…"]; "logo" (the store's new logo) is the default and
 * needs no attribute.
 *
 * While the store is choosing colours, a small picker (ThemePicker) lets
 * visitors switch themes; the choice is kept in localStorage. Once a theme
 * is chosen: make it the default in globals.css and turn the picker off by
 * setting NEXT_PUBLIC_THEME_PICKER=off (or deleting the picker).
 */
export const themes = ["logo", "petrol", "classic"] as const;
export type Theme = (typeof themes)[number];
export const defaultTheme: Theme = "logo";

// v2: the default changed to the new logo; earlier picks start over.
export const THEME_STORAGE_KEY = "olam-hayadit.theme.v2";

export const themePickerEnabled =
  process.env.NEXT_PUBLIC_THEME_PICKER !== "off";

export function isTheme(value: unknown): value is Theme {
  return themes.includes(value as Theme);
}

/** Apply a theme to <html>. The default theme is "no attribute". */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === defaultTheme) delete root.dataset.theme;
  else root.dataset.theme = theme;
}

/**
 * Runs in <head> before the first paint, so a saved theme doesn't flash.
 * Plain ES5, no imports: it's inlined as a string.
 */
export const themeInitScript = `try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(${JSON.stringify(themes.filter((t) => t !== defaultTheme))}.indexOf(t)>-1)document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
