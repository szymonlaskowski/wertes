import Link from "next/link";
import { ProductTile } from "@/components/product-tile";
import { toLocalPath } from "@/lib/catalog-paths";
import type { Category, ProductSummary } from "@/lib/store-api";

export function MostChosen({ products }: { products: ProductSummary[] }) {
  return (
    <section aria-labelledby="najczesciej" className="page-width py-10">
      <h2 id="najczesciej" className="text-title">
        Najczęściej wybierane
      </h2>
      <p className="mt-1 text-mute">Najchętniej kupowany produkt z&nbsp;każdego działu.</p>
      <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4">
        {products.map((product) => (
          <ProductTile key={product.id} product={product} />
        ))}
      </ul>
    </section>
  );
}

export function OwnBrand({ brand, products }: { brand: Category; products: ProductSummary[] }) {
  return (
    <section id="wertes-safe" aria-labelledby="wertes-safe-naglowek" className="bg-accent">
      <div className="page-width grid gap-5 py-10 lg:grid-cols-3">
        <div>
          <h2 id="wertes-safe-naglowek" className="text-title md:text-display">
            Wertes Safe+
          </h2>
          <p className="mt-2">Nasza marka: rękawice i&nbsp;fartuchy ze skóry bydlęcej i&nbsp;koziej, z&nbsp;normami nadrukowanymi na&nbsp;wyrobie.</p>
          <Link href={toLocalPath(brand.permalink)} className="mt-3 inline-block font-semibold link-line">
            Wszystkie produkty Wertes Safe+
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 lg:col-span-2">
          {products.map((product) => (
            <ProductTile key={product.id} product={product} />
          ))}
        </ul>
      </div>
    </section>
  );
}
