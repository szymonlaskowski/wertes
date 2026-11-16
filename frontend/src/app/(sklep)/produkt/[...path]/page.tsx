import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { NormPlate } from "@/components/norm-plate";
import { ProductTile } from "@/components/product-tile";
import { categoryTrail, findProductShelf, productCountLabel } from "@/lib/catalog";
import { routeSegments, toLocalPath } from "@/lib/catalog-paths";
import type { Category } from "@/lib/store-api";
import { findAnyProductPermalink, findProductBySlug, listBestsellersInStock, listCategories } from "@/lib/store-api";
import { saleUnitOf } from "@/lib/sale-unit";
import { bindSingleLetterWords } from "@/lib/typography";
import { readWordpressProductPage } from "@/lib/wordpress-product-page";
import { GalleryFocusProvider } from "./gallery-focus";
import { NormMeanings } from "./norm-meanings";
import { OrderTerms } from "./order-terms";
import { Description, Parameters, PurchasePanel, attributeValues } from "./product-details";
import { ProductGallery } from "./product-gallery";
import { QuantityDiscounts } from "./quantity-discounts";

export const ensureStatic = "navigation";

const BRAND_ATTRIBUTE = "Marka";
const NORMS_ATTRIBUTE = "Normy";
const SHELF_PRODUCTS = 4;

export async function generateStaticParams() {
  const permalink = await findAnyProductPermalink();
  return [{ path: routeSegments(permalink) }];
}

export async function generateMetadata(props: PageProps<"/produkt/[...path]">): Promise<Metadata> {
  const { path } = await props.params;
  const product = await loadProduct(path);
  return { title: product.name };
}

export default async function ProductPage(props: PageProps<"/produkt/[...path]">) {
  const { path } = await props.params;
  const [product, categories] = await Promise.all([loadProduct(path), listCategories()]);
  const productCategoryIds = product.categories.map((category) => category.id);
  const shelf = findProductShelf(categories, productCategoryIds);
  const brand = attributeValues(product, BRAND_ATTRIBUTE).join(", ");
  const norms = attributeValues(product, NORMS_ATTRIBUTE);
  const wordpressProductPage = await readWordpressProductPage(product.permalink);
  const unit = saleUnitOf(product.name, wordpressProductPage.statedSaleUnit);

  return (
    <main className="page-width pt-3 pb-10">
      {shelf && <Breadcrumb trail={categoryTrail(categories, shelf)} />}
      <GalleryFocusProvider>
        <div className="mt-3 grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <ProductGallery productId={product.id} images={product.images} />
          <div className="flex flex-col gap-3">
            <div>
              {brand && <p className="font-semibold">{brand}</p>}
              <h1 className="font-semibold md:text-title md:font-bold">{bindSingleLetterWords(product.name)}</h1>
              {product.sku && <p className="mt-1 text-small text-mute">Kod {product.sku}</p>}
              {norms.length > 0 && (
                <ul aria-label="Normy" className="mt-2 flex flex-wrap gap-1">
                  {norms.map((norm) => (
                    <li key={norm}>
                      <NormPlate norm={norm} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <PurchasePanel product={product} unit={unit} />
          </div>
        </div>
      </GalleryFocusProvider>
      <section aria-labelledby="karta-katalogowa" className="mt-10 chamfer-panel bg-surface p-3">
        <h2 id="karta-katalogowa" className="text-title">
          Karta katalogowa
        </h2>
        <div className="mt-5 grid items-start gap-6 md:grid-cols-3">
          <div className="grid gap-5">
            <NormMeanings norms={norms} />
            <Parameters product={product} />
          </div>
          <QuantityDiscounts tiers={wordpressProductPage.quantityDiscountTiers} unit={unit} />
          <OrderTerms />
        </div>
      </section>
      <div className="mt-10">
        <Description html={product.description} />
      </div>
      {shelf && (
        <Suspense>
          <ShelfProducts shelf={shelf} currentProductId={product.id} />
        </Suspense>
      )}
    </main>
  );
}

async function loadProduct(path: string[]) {
  const slug = path.at(-1);
  if (!slug) {
    notFound();
  }

  const product = await findProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const canonicalPath = toLocalPath(product.permalink);
  const requestedPath = `/produkt/${path.join("/")}/`;
  const isCanonicalPath = decodeURI(requestedPath) === decodeURI(canonicalPath);
  if (!isCanonicalPath) {
    permanentRedirect(canonicalPath);
  }
  return product;
}

async function ShelfProducts({ shelf, currentProductId }: { shelf: Category; currentProductId: number }) {
  const bestsellers = await listBestsellersInStock(shelf.id, SHELF_PRODUCTS + 1);
  const otherProducts = bestsellers.filter((product) => product.id !== currentProductId).slice(0, SHELF_PRODUCTS);
  if (otherProducts.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="inne-z-polki" className="mt-10">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="inne-z-polki" className="text-title">
          Inne z półki {shelf.name}
        </h2>
        <Link href={toLocalPath(shelf.permalink)} className="font-semibold link-line">
          Cała półka, {productCountLabel(shelf.count)}
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4">
        {otherProducts.map((product) => (
          <ProductTile key={product.id} product={product} />
        ))}
      </ul>
    </section>
  );
}
