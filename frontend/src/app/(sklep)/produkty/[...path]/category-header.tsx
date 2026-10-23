import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { MoreSummary } from "@/components/more-summary";
import { BRANDS_SLUG, childrenOf, formatCount, productCountLabel } from "@/lib/catalog";
import { toLocalPath } from "@/lib/catalog-paths";
import { DEFAULT_SORT } from "@/lib/category-filters";
import { type Category, listProductsInCategory } from "@/lib/store-api";

const SHELF_TILES = 8;

type CategoryHeaderProps = {
  category: Category;
  categories: Category[];
  ancestors: Category[];
  intro: string;
};

export function CategoryHeader({ category, categories, ancestors, intro }: CategoryHeaderProps) {
  const shelves = shelvesNextTo(categories, category);

  return (
    <header>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Breadcrumb trail={ancestors} />
          <h1 className="mt-3 text-title hyphens-auto">{category.name}</h1>
          <p className="mt-1 text-mute">{productCountLabel(category.count)}</p>
          {intro && <p className="mt-2 max-w-prose">{intro}</p>}
        </div>
        <div className="relative aspect-square w-full max-w-35 justify-self-end max-md:hidden">
          <Suspense>
            <BestsellerPhoto category={category} />
          </Suspense>
        </div>
      </div>
      {shelves.length > 0 && <Shelves shelves={shelves} current={category} />}
    </header>
  );
}

async function BestsellerPhoto({ category }: { category: Category }) {
  const unfilteredFirstPage = await listProductsInCategory(category.id, [], false, DEFAULT_SORT.sort, 1);
  const photo = unfilteredFirstPage.products.at(0)?.images.at(0);
  if (!photo) {
    return null;
  }
  return <Image src={photo.src} alt="" fill priority sizes="280px" className="object-contain" />;
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
  const remainingShelves = shelves.slice(SHELF_TILES);
  const currentShelfIsRemaining = remainingShelves.includes(current);

  return (
    <nav aria-label="Półki" className="mt-5">
      <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
        {tileShelves.map((shelf) => (
          <li key={shelf.id}>
            <ShelfTile shelf={shelf} isCurrent={shelf === current} />
          </li>
        ))}
      </ul>
      {remainingShelves.length > 0 && (
        <details open={currentShelfIsRemaining} className="mt-1">
          <MoreSummary label={`Pozostałe półki, ${remainingShelves.length}`} />
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {remainingShelves.map((shelf) => (
              <li key={shelf.id}>
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
      className={`block h-full rounded-box px-2 py-1 transition-colors duration-(--duration-reveal) ease-(--ease-out) motion-reduce:transition-none ${stateClassName}`}
    >
      <span className="block font-semibold">{shelf.name}</span>
      <span className="text-small tabular-nums">{formatCount(shelf.count)}</span>
    </Link>
  );
}
