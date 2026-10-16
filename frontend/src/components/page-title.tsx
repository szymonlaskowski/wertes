import type { ReactNode } from "react";
import { LogoDot } from "@/components/logo-dot";

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-title">
      {children}
      <LogoDot />
    </h1>
  );
}
