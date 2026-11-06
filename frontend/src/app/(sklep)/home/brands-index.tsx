import Link from "next/link";
import { formatCount } from "@/lib/catalog";
import { toLocalPath } from "@/lib/catalog-paths";
import type { Category } from "@/lib/store-api";

const LARGEST_BRANDS = 13;

export function BrandsIndex({ brands, allBrands }: { brands: Category[]; allBrands: Category }) {
  const largestBrands = brands.toSorted((first, second) => second.count - first.count).slice(0, LARGEST_BRANDS);

  return (
    <section aria-labelledby="producenci" className="page-width grid gap-5 py-10 lg:grid-cols-3">
      <h2 id="producenci" className="font-semibold">
        Producenci
        <span className="block text-display tabular-nums">{brands.length}</span>
      </h2>
      <ul className="flex flex-wrap items-baseline gap-x-3 gap-y-1 lg:col-span-2">
        {largestBrands.map((brand) => (
          <li key={brand.id}>
            <Link href={toLocalPath(brand.permalink)} className="text-title">
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
