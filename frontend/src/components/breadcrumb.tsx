import Link from "next/link";
import { toLocalPath } from "@/lib/catalog-paths";
import type { Category } from "@/lib/store-api";

export function Breadcrumb({ trail }: { trail: Category[] }) {
  if (trail.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Ścieżka">
      <ol className="flex flex-wrap gap-x-3 text-small text-mute">
        {trail.map((category) => (
          <li key={category.id}>
            <Link href={toLocalPath(category.permalink)}>
              <span className="link-line">{category.name}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
