"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useTranslations } from "next-intl";
import {
  applyTheme,
  defaultTheme,
  isTheme,
  THEME_STORAGE_KEY,
  themes,
  type Theme,
} from "@/lib/theme";

/** Decorative preview colours per theme: paper, accent, band, highlight. */
const swatches: Record<Theme, readonly string[]> = {
  logo: ["#ffffff", "#1aa39a", "#0e1716", "#c8102e"],
  petrol: ["#f5f5f2", "#0e5e66", "#0d2b2f", "#b3462b"],
  classic: ["#f5f1ea", "#d8c49c", "#1e1d1b", "#7a5a22"],
};

const CHANGE_EVENT = "olam-hayadit:theme";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}
function currentTheme(): Theme {
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : defaultTheme;
}

function saveTheme(theme: Theme) {
  applyTheme(theme);
  try {
    if (theme === defaultTheme) localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked (private mode): the theme still applies to this page.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Design demo: lets the store (and anyone testing) switch colour themes.
 * A disclosure button + a radio group; Escape or a click outside closes it.
 */
export function ThemePicker() {
  const t = useTranslations("theme");
  const theme = useSyncExternalStore(
    subscribe,
    currentTheme,
    () => defaultTheme,
  );
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed start-4 bottom-4 z-30 flex flex-col items-start gap-2 print:hidden"
    >
      {open && (
        <div
          id={panelId}
          className="w-80 max-w-[calc(100vw-2rem)] rounded-sm border border-line-strong bg-paper p-4 text-ink"
        >
          <fieldset>
            <legend className="font-display text-lg">{t("legend")}</legend>
            <p className="mt-1 text-sm text-ink-muted">{t("note")}</p>
            <div className="mt-3 grid gap-1">
              {themes.map((option) => (
                <label
                  key={option}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm px-2 hover:bg-surface has-[:checked]:bg-surface"
                >
                  <input
                    type="radio"
                    name="site-theme"
                    value={option}
                    checked={theme === option}
                    onChange={() => saveTheme(option)}
                    className="size-4 accent-[var(--color-button)]"
                  />
                  <span className="flex-1">{t(option)}</span>
                  <span aria-hidden="true" className="flex">
                    {swatches[option].map((color) => (
                      <span
                        key={color}
                        className="-ms-1 size-5 rounded-full border border-line-strong first:ms-0"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-paper px-4 text-sm font-semibold text-ink hover:bg-surface"
      >
        <span aria-hidden="true" className="flex">
          {swatches[theme].slice(1, 4).map((color) => (
            <span
              key={color}
              className="-ms-1.5 size-4 rounded-full border border-paper first:ms-0"
              style={{ backgroundColor: color }}
            />
          ))}
        </span>
        {t("button")}
      </button>
    </div>
  );
}
