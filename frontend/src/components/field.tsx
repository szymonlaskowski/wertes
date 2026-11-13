import type { ReactNode } from "react";

export const inputClassName =
  "w-full bg-surface px-2 py-1 text-body text-ink outline-none placeholder:text-mute focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink aria-invalid:outline-2 aria-invalid:-outline-offset-2 aria-invalid:outline-ink";

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="grid content-start gap-0.5">
      <span className="text-small font-semibold">{label}</span>
      {children}
      {error !== undefined && <span className="text-small font-semibold">{error}</span>}
    </label>
  );
}
