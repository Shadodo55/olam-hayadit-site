import type { InputProps } from "sanity";

/** Wraps a field so Hebrew is typed and displayed right-to-left. */
export function RtlInput(props: InputProps) {
  return <div dir="rtl">{props.renderDefault(props)}</div>;
}

export function LtrInput(props: InputProps) {
  return <div dir="ltr">{props.renderDefault(props)}</div>;
}
