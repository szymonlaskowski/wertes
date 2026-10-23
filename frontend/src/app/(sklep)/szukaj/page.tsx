import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/button";
import { PageTitle } from "@/components/page-title";
import { Pager } from "@/components/pager";
import { priceClassName } from "@/components/price";
import { StockDot } from "@/components/stock-dot";
import { type CountedCategory, formatCount, productCountLabel, splitSearchCounts } from "@/lib/catalog";
import { toLocalPath } from "@/lib/catalog-paths";
import { MAX_QUERY_LENGTH } from "@/lib/search-suggestions";
import {
  type Category,
  countSearchResultsByCategory,
  listCategories,
  type ProductSummary,
  searchProducts,
  wordpressUrl,
} from "@/lib/store-api";
import SearchLoading from "./loading";

const VISIBLE_FACET_ROWS = 10;

export const metadata: Metadata = { title: "Szukaj" };

type SearchState = { query: string; category: Category | undefined };

export default async function SearchPage(props: PageProps<"/szukaj">) {
  const params = await props.searchParams;
  const searchKey = JSON.stringify(params);

  return (
    <Suspense key={searchKey} fallback={<SearchLoading />}>
      <main className="page-width pt-4 pb-10">
        <SearchResults params={params} />
      </main>
    </Suspense>
  );
}

async function SearchResults({ params }: { params: Awaited<PageProps<"/szukaj">["searchParams"]> }) {
  const query = readQuery(params.q);
  if (!query) {
    return <PageTitle>Wpisz nazwę albo kod produktu</PageTitle>;
  }

  const categories = await listCategories();
  const category = readCategory(categories, params.kategoria);
  const page = readPage(params.strona);
  const search: SearchState = { query, category };

  const [{ products, total, perPage }, categoryCounts] = await Promise.all([
    searchProducts(query, category?.id, page),
    countSearchResultsByCategory(query),
  ]);
  const pageIsPastTheEnd = page > 1 && products.length === 0;
  if (pageIsPastTheEnd) {
    notFound();
  }
  const { shelves, brands } = splitSearchCounts(categories, categoryCounts);

  return (
    <>
      <PageTitle>„{query}”</PageTitle>
      <p className="mt-1 text-mute">{resultCountLabel(total, category)}</p>
      <div className="mt-5 grid gap-8 md:grid-cols-[240px_1fr]">
        <div className="md:col-start-2">
          <ul>
            {products.map((product) => (
              <ResultRow key={product.id} product={product} />
            ))}
          </ul>
          <Pager
            label="Strony wyników"
            page={page}
            perPage={perPage}
            total={total}
            pageUrl={(pageNumber) => searchUrl(search, pageNumber)}
          />
        </div>
        <aside className="grid content-start gap-5 md:col-start-1 md:row-start-1">
          {category && (
            <Link href={searchUrl({ query, category: undefined }, 1)} className="font-semibold">
              <span className="link-line">Wszystkie wyniki</span>
            </Link>
          )}
          <Facet id="kategorie" title="Kategorie" rows={shelves} search={search} />
          <Facet id="producenci" title="Producenci" rows={brands} search={search} />
        </aside>
      </div>
    </>
  );
}

function ResultRow({ product }: { product: ProductSummary }) {
  const mainImage = product.images.at(0);
  const productPath = toLocalPath(product.permalink);

  return (
    <li className="group grid grid-cols-[72px_1fr] gap-x-2 gap-y-1 py-1.5 md:grid-cols-[96px_1fr_160px_200px] md:items-center md:gap-x-3">
      <Link
        href={productPath}
        tabIndex={-1}
        aria-hidden
        className="relative block size-9 rounded-box bg-surface max-md:row-span-3 md:size-12"
      >
        {mainImage && <Image src={mainImage.src} alt={mainImage.alt} fill sizes="96px" className="object-contain p-1 mix-blend-multiply" />}
        <span className="absolute top-1 left-1 flex">
          <StockDot inStock={product.is_in_stock} />
        </span>
      </Link>
      <div>
        <Link href={productPath}>
          <span className="link-line">{product.name}</span>
        </Link>
        {product.sku && <p className="text-small text-mute">Kod {product.sku}</p>}
      </div>
      <div className={priceClassName} dangerouslySetInnerHTML={{ __html: product.price_html }} />
      <div className="md:justify-self-end">
        <RowAction product={product} productPath={productPath} />
      </div>
    </li>
  );
}

function RowAction({ product, productPath }: { product: ProductSummary; productPath: string }) {
  if (!product.is_in_stock) {
    return null;
  }

  if (product.type === "simple") {
    return (
      <Button variant="primary" href={wordpressUrl(`/koszyk/?add-to-cart=${product.id}`)}>
        Dodaj do koszyka<span className="sr-only">: {product.name}</span>
      </Button>
    );
  }

  return (
    <Button variant="primary" href={productPath}>
      Wybierz rozmiar<span className="sr-only">: {product.name}</span>
    </Button>
  );
}

function Facet({ id, title, rows, search }: { id: string; title: string; rows: CountedCategory[]; search: SearchState }) {
  if (rows.length === 0) {
    return null;
  }

  const visibleRows = rows.slice(0, VISIBLE_FACET_ROWS);
  const hiddenRows = rows.slice(VISIBLE_FACET_ROWS);
  const selectedRowIsHidden = hiddenRows.some((row) => row.category.id === search.category?.id);

  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-1 font-semibold">
        {title}
      </h2>
      <FacetRows rows={visibleRows} search={search} />
      {hiddenRows.length > 0 && (
        <details open={selectedRowIsHidden}>
          <summary className="mt-1 cursor-pointer list-none font-semibold [&::-webkit-details-marker]:hidden">
            <span className="link-line">Pozostałe, {hiddenRows.length}</span>
          </summary>
          <FacetRows rows={hiddenRows} search={search} />
        </details>
      )}
    </section>
  );
}

function FacetRows({ rows, search }: { rows: CountedCategory[]; search: SearchState }) {
  return (
    <ul>
      {rows.map(({ category, count }) => {
        const isSelected = category.id === search.category?.id;
        return (
          <li key={category.id}>
            <Link
              href={searchUrl({ query: search.query, category }, 1)}
              aria-current={isSelected ? "true" : undefined}
              className={`flex justify-between gap-1 ${isSelected ? "font-semibold" : ""}`}
            >
              <span>
                <span className="link-line">{category.name}</span>
              </span>
              <span className="text-mute tabular-nums">{formatCount(count)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function searchUrl({ query, category }: SearchState, page: number) {
  const params = new URLSearchParams({ q: query });
  if (category) {
    params.set("kategoria", category.slug);
  }
  if (page > 1) {
    params.set("strona", String(page));
  }
  return `/szukaj/?${params}`;
}

function readQuery(value: string | string[] | undefined) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, MAX_QUERY_LENGTH);
}

function readCategory(categories: Category[], value: string | string[] | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }
  const category = categories.find((candidate) => candidate.slug === value);
  if (!category) {
    notFound();
  }
  return category;
}

function readPage(value: string | string[] | undefined) {
  const page = Number(value);
  const isValidPage = Number.isInteger(page) && page >= 1;
  if (!isValidPage) {
    return 1;
  }
  return page;
}

function resultCountLabel(total: number, category: Category | undefined) {
  if (total === 0) {
    return "Nic nie znaleziono. Spróbuj krótszej nazwy albo samego kodu.";
  }
  if (category) {
    return `${productCountLabel(total)} w: ${category.name}`;
  }
  return productCountLabel(total);
}
