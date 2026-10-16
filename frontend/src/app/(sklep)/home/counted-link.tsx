import Link from "next/link";
import { toLocalPath } from "@/lib/catalog-paths";
import type { Category } from "@/lib/store-api";
import { formatCount } from "./catalog";

export function CountedLink({ category }: { category: Category }) {
  return (
    <Link
      href={toLocalPath(category.permalink)}
      className="group/row relative flex justify-between gap-1 link-line"
    >
      <HoverDot />
      <span>{category.name}</span>
      <span className="text-mute tabular-nums">{formatCount(category.count)}</span>
    </Link>
  );
}

function HoverDot() {
  return (
    <span
      aria-hidden="true"
      className="absolute top-1/2 -left-1.5 size-1 -translate-y-1/2 scale-0 rounded-full bg-accent transition-transform duration-(--duration-hide) ease-(--ease-out) group-hover/row:scale-100 group-hover/row:duration-(--duration-reveal) group-focus-visible/row:scale-100 motion-reduce:transition-none"
    />
  );
}
