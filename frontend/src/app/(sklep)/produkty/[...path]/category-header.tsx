import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { MoreSummary } from "@/components/more-summary";
import { BRANDS_SLUG, childrenOf, formatCount, productCountLabel } from "@/lib/catalog";
import { toLocalPath } from "@/lib/catalog-paths";
import type { Category } from "@/lib/store-api";

const SHELF_TILES = 8;
const PHONE_SHELF_TILES = 4;

type CategoryHeaderProps = {
  category: Category;
  categories: Category[];
  ancestors: Category[];
};

export function CategoryHeader({ category, categories, ancestors }: CategoryHeaderProps) {
  const shelves = shelvesNextTo(categories, category);

  return (
    <header>
      <Breadcrumb trail={ancestors} />
      <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
        <h1 className="text-title hyphens-auto">{category.name}</h1>
        <p className="text-mute tabular-nums">{productCountLabel(category.count)}</p>
      </div>
      {shelves.length > 0 && <Shelves shelves={shelves} current={category} />}
    </header>
  );
}

function shelvesNextTo(categories: Category[], category: Category) {
  const children = nonEmptyShelves(childrenOf(categories, category));
  if (children.length > 0) {
    return children;
  }
  const parent = categories.find((candidate) => candidate.id === category.parent);
  if (!parent) {
    return [];
  }
  return nonEmptyShelves(childrenOf(categories, parent));
}

function nonEmptyShelves(categories: Category[]) {
  return categories.filter((category) => category.count > 0 && category.slug !== BRANDS_SLUG);
}

function Shelves({ shelves, current }: { shelves: Category[]; current: Category }) {
  const tileShelves = shelves.slice(0, SHELF_TILES);
  const remainingOnPhone = shelves.slice(PHONE_SHELF_TILES);
  const currentShelfIsRemaining = remainingOnPhone.includes(current);
  const hasRemainingOnDesktop = shelves.length > SHELF_TILES;

  return (
    <nav aria-label="Półki" className="mt-3">
      <ul className="grid grid-cols-2 gap-1 lg:grid-cols-4">
        {tileShelves.map((shelf, index) => (
          <li key={shelf.id} className={index < PHONE_SHELF_TILES ? "" : "max-lg:hidden"}>
            <ShelfTile shelf={shelf} isCurrent={shelf === current} />
          </li>
        ))}
      </ul>
      {remainingOnPhone.length > 0 && (
        <details open={currentShelfIsRemaining} className={hasRemainingOnDesktop ? "mt-1" : "mt-1 lg:hidden"}>
          <MoreSummary label="Pozostałe półki" />
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {remainingOnPhone.map((shelf) => (
              <li key={shelf.id} className={tileShelves.includes(shelf) ? "lg:hidden" : ""}>
                <Link href={toLocalPath(shelf.permalink)} aria-current={shelf === current ? "page" : undefined} className="aria-[current=page]:font-semibold">
                  <span className="link-line">{shelf.name}</span>{" "}
                  <span className="text-mute tabular-nums">{formatCount(shelf.count)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </nav>
  );
}

function ShelfTile({ shelf, isCurrent }: { shelf: Category; isCurrent: boolean }) {
  const stateClassName = isCurrent ? "bg-ink text-paper" : "bg-surface mouse:hover:bg-accent";

  return (
    <Link
      href={toLocalPath(shelf.permalink)}
      aria-current={isCurrent ? "page" : undefined}
      className={`block h-full rounded-box px-2 py-1 transition-[background-color,scale] duration-(--duration-reveal) ease-(--ease-out) active:scale-[0.98] motion-reduce:transition-none ${stateClassName}`}
    >
      <span className="block font-semibold">{shelf.name}</span>
      <span className="text-small tabular-nums">{formatCount(shelf.count)}</span>
    </Link>
  );
}
