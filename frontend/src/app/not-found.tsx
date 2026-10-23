import type { Metadata } from "next";
import { LogoDot } from "@/components/logo-dot";
import { PageTitle } from "@/components/page-title";
import { ProductTile } from "@/components/product-tile";
import { CATALOG_ROOT_SLUG, findBySlug } from "@/lib/catalog";
import { company } from "@/lib/company";
import { listBestsellersInStock, listCategories } from "@/lib/store-api";

const BESTSELLERS_COUNT = 6;

export const metadata: Metadata = { title: "Nic tu nie ma" };

export default async function NotFound() {
  const categories = await listCategories();
  const catalogRoot = findBySlug(categories, CATALOG_ROOT_SLUG);
  const bestsellers = await listBestsellersInStock(catalogRoot.id, BESTSELLERS_COUNT);

  return (
    <main className="page-width pt-4 pb-10">
      <PageTitle>nic tu nie ma</PageTitle>
      <p className="mt-2 max-w-95">
        Pod tym adresem nie ma strony. Produkt mógł zmienić nazwę albo zniknąć z&nbsp;oferty. Wpisz nazwę
        albo kod w&nbsp;pole wyżej albo zadzwoń:{" "}
        <a href={company.phoneHref} className="link-line font-semibold">
          {company.phone}
        </a>
        .
      </p>
      <section aria-labelledby="najczesciej-kupowane" className="mt-10">
        <h2 id="najczesciej-kupowane" className="mb-4 text-title">
          najczęściej kupowane
          <LogoDot />
        </h2>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4 lg:grid-cols-6">
          {bestsellers.map((product) => (
            <ProductTile key={product.id} product={product} />
          ))}
        </ul>
      </section>
    </main>
  );
}
