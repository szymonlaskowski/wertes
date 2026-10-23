import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/breadcrumb";
import { NormPlate } from "@/components/norm-plate";
import { ProductTile } from "@/components/product-tile";
import { StockDot } from "@/components/stock-dot";
import { categoryTrail, findProductShelf, productCountLabel } from "@/lib/catalog";
import { routeSegments, toLocalPath } from "@/lib/catalog-paths";
import { company } from "@/lib/company";
import type { Category, Product } from "@/lib/store-api";
import {
  findAnyProductPermalink,
  findProductBySlug,
  listBestsellersInStock,
  listCategories,
  wordpressUrl,
} from "@/lib/store-api";
import { bindSingleLetterWords } from "@/lib/typography";
import { ProductGallery } from "./product-gallery";
import { PurchaseForm } from "./purchase-form";

export const ensureStatic = "navigation";

const BRAND_ATTRIBUTE = "Marka";
const NORMS_ATTRIBUTE = "Normy";
const AVAILABILITY_ATTRIBUTE = "Dostępność";
const SHELF_PRODUCTS = 4;

const priceClassName =
  "tabular-nums [&_.amount]:block [&_.amount]:text-small [&_.amount]:text-mute [&_.amount--netto]:text-title [&_.amount--netto]:font-semibold [&_.amount--netto]:text-ink [&_br]:hidden [&_small]:[font-size:inherit]";

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

  return (
    <main className="page-width pt-3 pb-10">
      {shelf && <Breadcrumb trail={categoryTrail(categories, shelf)} />}
      <div className="mt-3 grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <ProductGallery images={product.images} />
        <div className="flex flex-col gap-3">
          <div>
            {brand && <p className="font-semibold">{brand}</p>}
            <h1 className="font-semibold md:text-title">{bindSingleLetterWords(product.name)}</h1>
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
          <div className={priceClassName} dangerouslySetInnerHTML={{ __html: product.price_html }} />
          <Availability inStock={product.is_in_stock} />
          {product.is_in_stock && <PurchaseForm product={product} />}
          <div className="grid gap-3 rounded-box bg-surface p-3">
            <BulkDiscounts />
            <OrderHelp />
          </div>
        </div>
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <Description html={product.description} />
        <Parameters product={product} />
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
  if (requestedPath !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }
  return product;
}

function attributeValues(product: Product, attributeName: string) {
  const attribute = product.attributes.find((candidate) => candidate.name === attributeName);
  if (!attribute) {
    return [];
  }
  return attribute.terms.map((term) => term.name);
}

function Availability({ inStock }: { inStock: boolean }) {
  if (inStock) {
    return (
      <p className="flex items-center gap-1 text-small">
        <StockDot inStock />
        Na stanie, wysyłka w 48 h
      </p>
    );
  }

  return (
    <p className="flex flex-wrap items-center gap-x-1 text-small">
      <StockDot inStock={false} />
      Brak w magazynie, zapytaj o termin:
      <a href={company.phoneHref} className="link-line">
        {company.phone}
      </a>
    </p>
  );
}

function BulkDiscounts() {
  return (
    <section aria-labelledby="rabaty">
      <h2 id="rabaty" className="font-semibold">
        Kupujesz więcej? Zapłacisz mniej
      </h2>
      <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 text-small">
        {company.bulkDiscounts.map((discount) => (
          <div key={discount.code} className="contents">
            <dt>Koszyk od {discount.from}</dt>
            <dd>
              <b className="font-semibold">{discount.percent}</b> z kodem{" "}
              <b className="font-semibold">{discount.code}</b>
            </dd>
          </div>
        ))}
      </dl>
      <a href={wordpressUrl("/rabaty-na-duze-zamowienia/")} className="mt-1 inline-block text-small font-semibold link-line">
        Warunki rabatów i wycena dla firm
      </a>
    </section>
  );
}

function OrderHelp() {
  return (
    <dl className="grid gap-2 text-small sm:grid-cols-2">
      <div>
        <dt className="font-semibold">Dostawa</dt>
        <dd>
          Darmowa od {company.freeShippingFrom}, faktura VAT do każdego zamówienia.
        </dd>
      </div>
      <div>
        <dt className="font-semibold">Pomoc w doborze</dt>
        <dd>
          <a href={company.phoneHref} className="link-line">
            {company.phone}
          </a>{" "}
          albo{" "}
          <a href={company.emailHref} className="link-line">
            {company.email}
          </a>
        </dd>
      </div>
    </dl>
  );
}

function Description({ html }: { html: string }) {
  if (!html) {
    return null;
  }

  return (
    <section aria-labelledby="opis">
      <h2 id="opis" className="mb-1 font-semibold">
        Opis produktu
      </h2>
      <div className="max-w-prose [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}

function Parameters({ product }: { product: Product }) {
  const parameters = product.attributes.filter(
    (attribute) => !attribute.has_variations && attribute.name !== AVAILABILITY_ATTRIBUTE,
  );

  return (
    <section aria-labelledby="parametry">
      <h2 id="parametry" className="mb-1 font-semibold">
        Parametry
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {product.sku && <ParameterRow name="Kod" value={product.sku} />}
        {parameters.map((attribute) => (
          <ParameterRow
            key={attribute.name}
            name={attribute.name}
            value={attribute.terms.map((term) => term.name).join(", ")}
          />
        ))}
      </dl>
    </section>
  );
}

function ParameterRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="contents">
      <dt className="text-mute">{name}</dt>
      <dd>{value}</dd>
    </div>
  );
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
