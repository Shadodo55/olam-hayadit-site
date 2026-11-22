/**
 * Button/link-button class names. One place for sizes and variants so every
 * control has the same 44px+ touch target and focus behaviour.
 */
type Variant = "solid" | "outline" | "quiet" | "onDark" | "paper";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-semibold transition-colors duration-150 disabled:opacity-50";

const variants: Record<Variant, string> = {
  solid: "bg-ink text-paper hover:bg-ink/85",
  outline: "border border-line-strong text-ink hover:bg-surface",
  quiet: "text-ink underline-offset-4 hover:underline",
  onDark: "border border-paper/40 text-paper hover:bg-paper/10",
  paper: "bg-paper text-ink hover:bg-surface",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 text-base",
  sm: "min-h-11 px-3 text-sm",
};

export function buttonClass(
  variant: Variant = "solid",
  size: Size = "md",
  extra = "",
): string {
  return [base, variants[variant], sizes[size], extra]
    .filter(Boolean)
    .join(" ");
}
