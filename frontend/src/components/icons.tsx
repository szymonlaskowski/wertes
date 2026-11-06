const ICON_STROKE_WIDTH = 1.4;
const iconClassName =
  "size-3.5 fill-none stroke-ink [stroke-linecap:round] [stroke-linejoin:round] group-hover:stroke-2";

export function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" strokeWidth={ICON_STROKE_WIDTH} className={iconClassName}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

export function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" strokeWidth={ICON_STROKE_WIDTH} className={iconClassName}>
      <path d="M2.5 9.5h19l-2.2 10.5H4.7z" />
      <path d="M7 9.5 11 3.5M17 9.5 13 3.5" />
      <path d="M9 13v4M15 13v4" />
    </svg>
  );
}
