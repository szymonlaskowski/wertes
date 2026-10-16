import type { ReactNode } from "react";
import { LogoDot } from "@/components/logo-dot";

export function AsideSection({
  id,
  title,
  lead,
  aside,
  children,
}: {
  id: string;
  title: string;
  lead: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-10 grid gap-5 md:grid-cols-[336px_1fr]">
      <div>
        <h2 id={id} className="text-title lowercase">
          {title}
          <LogoDot />
        </h2>
        <p className="mt-1 text-mute">{lead}</p>
        {aside}
      </div>
      {children}
    </section>
  );
}
