import Link from "next/link";
import { formatCount } from "@/lib/catalog";
import { toLocalPath } from "@/lib/catalog-paths";
import type { Category } from "@/lib/store-api";

const LARGEST_BRANDS = 13;

export function BrandsIndex({ brands, allBrands }: { brands: Category[]; allBrands: Category }) {
  const largestBrands = brands.toSorted((first, second) => second.count - first.count).slice(0, LARGEST_BRANDS);

  return (
    <section aria-labelledby="producenci" className="page-width grid gap-x-3 gap-y-5 py-10 lg:grid-cols-4">
      <h2 id="producenci" className="font-semibold">
        <span className="block text-display">{brands.length}</span>
        producentów
      </h2>
      <ul className="flex flex-wrap items-baseline gap-x-3 gap-y-1 lg:col-span-3">
        {largestBrands.map((brand) => (
          <li key={brand.id}>
            <Link href={toLocalPath(brand.permalink)} className="text-figure md:text-title">
              <span className="link-line">{brand.name}</span>
              <sup className="ml-0.5 text-small text-mute tabular-nums">{formatCount(brand.count)}</sup>
            </Link>
          </li>
        ))}
        <li>
          <Link href={toLocalPath(allBrands.permalink)} className="font-semibold link-line">
            Wszyscy producenci, {brands.length}
          </Link>
        </li>
      </ul>
    </section>
  );
}
