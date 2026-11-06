import type { ReactNode } from "react";
import { LogoDot } from "@/components/logo-dot";

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-title hyphens-auto [hyphenate-limit-chars:12_5_5]">
      {children}
      <LogoDot />
    </h1>
  );
}
