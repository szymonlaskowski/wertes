import { LogoDot } from "@/components/logo-dot";
import { ProductTile } from "@/components/product-tile";
import { CATALOG_ROOT_SLUG, findBySlug } from "@/lib/catalog";
import { listBestsellersInStock, listCategories } from "@/lib/store-api";

const BESTSELLERS_COUNT = 6;

export async function Bestsellers() {
  const categories = await listCategories();
  const catalogRoot = findBySlug(categories, CATALOG_ROOT_SLUG);
  const bestsellers = await listBestsellersInStock(catalogRoot.id, BESTSELLERS_COUNT);

  return (
    <section aria-labelledby="najczesciej-kupowane" className="mt-10">
      <h2 id="najczesciej-kupowane" className="mb-4 text-title">
        Najczęściej kupowane
        <LogoDot />
      </h2>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4 lg:grid-cols-6">
        {bestsellers.map((product) => (
          <ProductTile key={product.id} product={product} />
        ))}
      </ul>
    </section>
  );
}
