import { Button } from "@/components/button";
import { ProductTile } from "@/components/product-tile";
import { toLocalPath } from "@/lib/catalog-paths";
import type { Category } from "@/lib/store-api";
import { listBestsellersInStock } from "@/lib/store-api";
import { AsideSection } from "./aside-section";
import { childrenOf, productCountLabel } from "./catalog";
import { CountedLink } from "./counted-link";

const PRODUCTS_PER_CHAPTER = 4;
const SUBCATEGORIES_PER_CHAPTER = 7;

export async function Chapter({
  title,
  category,
  categories,
}: {
  title: string;
  category: Category;
  categories: Category[];
}) {
  const products = await listBestsellersInStock(category.id, PRODUCTS_PER_CHAPTER);
  const subcategories = childrenOf(categories, category).slice(0, SUBCATEGORIES_PER_CHAPTER);

  return (
    <AsideSection
      id={`rozdzial-${category.slug}`}
      title={title}
      lead={productCountLabel(category.count)}
      aside={
        <>
          <ul className="my-3">
            {subcategories.map((subcategory) => (
              <li key={subcategory.id}>
                <CountedLink category={subcategory} />
              </li>
            ))}
          </ul>
          <Button variant="outline" href={toLocalPath(category.permalink)}>
            Cały dział
          </Button>
        </>
      }
    >
      <ul className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4">
        {products.map((product) => (
          <ProductTile key={product.id} product={product} />
        ))}
      </ul>
    </AsideSection>
  );
}
