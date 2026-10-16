import type { Category } from "@/lib/store-api";
import { CountedLink } from "./counted-link";

export function BrandsIndex({ brands }: { brands: Category[] }) {
  return (
    <section aria-labelledby="producenci" className="mt-8">
      <h2 id="producenci" className="font-semibold">
        Producenci <span className="text-small font-normal text-mute">{brands.length}</span>
      </h2>
      <ul className="mt-2 columns-2 gap-x-4 text-small sm:columns-3 lg:columns-6 [&_li]:break-inside-avoid">
        {brands.map((brand) => (
          <li key={brand.id}>
            <CountedLink category={brand} />
          </li>
        ))}
      </ul>
    </section>
  );
}
