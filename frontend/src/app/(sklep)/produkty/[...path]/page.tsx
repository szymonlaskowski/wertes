import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/button";
import { MoreSummary } from "@/components/more-summary";
import { Pager } from "@/components/pager";
import { ProductTile } from "@/components/product-tile";
import { categoryTrail, formatCount, productCountLabel, splitCategoryDescription } from "@/lib/catalog";
import {
  CATEGORY_FILTERS,
  type CategoryFilter,
  type CategoryView,
  categoryViewUrl,
  type FacetRow,
  facetRows,
  hasSelectedFilters,
  readCategoryView,
  SORT_OPTIONS,
  splitFacetRows,
  toAttributeFilters,
  withoutFilters,
  withSort,
  withToggledInStockOnly,
  withToggledValue,
} from "@/lib/category-filters";
import { categoryPagePath, parseCategorySegments, routeSegments, toLocalPath } from "@/lib/catalog-paths";
import {
  type Category,
  countAttributeTermsInCategory,
  getCategoryDescription,
  listAttributeTerms,
  listCategories,
  listProductsInCategory,
} from "@/lib/store-api";
import { CategoryGuide } from "./category-guide";
import { CategoryHeader } from "./category-header";
import { CategoryResultsPlaceholder } from "./loading";

const VISIBLE_FACET_ROWS = 8;
const VISIBLE_SIZES = 12;

const filterLinkProps = { scroll: false, prefetch: false } as const;

export async function generateStaticParams() {
  const categories = await listCategories();
  const topLevelCategories = categories.filter((category) => category.parent === 0);
  return topLevelCategories.map((category) => ({ path: routeSegments(category.permalink) }));
}

export async function generateMetadata(props: PageProps<"/produkty/[...path]">): Promise<Metadata> {
  const { path } = await props.params;
  const { category } = await loadCategory(path);
  return { title: category.name };
}

export default async function CategoryPage(props: PageProps<"/produkty/[...path]">) {
  const { path } = await props.params;
  const { category, categories, page } = await loadCategory(path);
  const ancestors = categoryTrail(categories, category).slice(0, -1);
  const view = readCategoryView(await props.searchParams);
  const viewKey = categoryViewUrl("", view, page);
  const description = splitCategoryDescription(await getCategoryDescription(category.id));
  const isFirstPage = page === 1;

  return (
    <main className="page-width pt-3 pb-10">
      <CategoryHeader category={category} categories={categories} ancestors={ancestors} intro={description.intro} />
      <Suspense key={viewKey} fallback={<CategoryResultsPlaceholder />}>
        <CategoryResults category={category} page={page} view={view} />
      </Suspense>
      {isFirstPage && (
        <Suspense>
          <CategoryGuide category={category} descriptionHtml={description.restHtml} />
        </Suspense>
      )}
    </main>
  );
}

async function loadCategory(path: string[]) {
  const location = parseCategorySegments(path);
  if (!location) {
    notFound();
  }

  const categories = await listCategories();
  const slug = location.categorySegments.at(-1);
  const category = categories.find((candidate) => candidate.slug === slug);
  if (!category) {
    notFound();
  }

  const canonicalPath = categoryPagePath(toLocalPath(category.permalink), location.page);
  const requestedPath = categoryPagePath(`/produkty/${location.categorySegments.join("/")}/`, location.page);
  if (requestedPath !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }
  return { category, categories, page: location.page };
}

type CategoryResultsProps = {
  category: Category;
  page: number;
  view: CategoryView;
};

async function CategoryResults({ category, page, view }: CategoryResultsProps) {
  const taxonomies = CATEGORY_FILTERS.map((filter) => filter.taxonomy);
  const [{ products, total, perPage }, termCounts, termLists] = await Promise.all([
    listProductsInCategory(category.id, toAttributeFilters(view), view.inStockOnly, view.sort.sort, page),
    countAttributeTermsInCategory(category.id, taxonomies),
    Promise.all(CATEGORY_FILTERS.map((filter) => listAttributeTerms(filter.taxonomy))),
  ]);
  const pageIsPastTheEnd = page > 1 && products.length === 0;
  if (pageIsPastTheEnd) {
    notFound();
  }

  const categoryPath = toLocalPath(category.permalink);
  const facets = CATEGORY_FILTERS.map((filter, index) => ({
    filter,
    rows: facetRows(termLists[index], termCounts),
  }));

  return (
    <div className="mt-5 grid gap-8 md:grid-cols-[240px_1fr]">
      <div className="md:col-start-2">
        <SelectedFilters categoryPath={categoryPath} view={view} facets={facets} />
        <SortBar categoryPath={categoryPath} view={view} total={total} />
        {products.length === 0 ? (
          <NoMatches categoryPath={categoryPath} view={view} />
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 lg:grid-cols-4">
            {products.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </ul>
        )}
        <Pager
          label="Strony produktów"
          page={page}
          perPage={perPage}
          total={total}
          pageUrl={(pageNumber) => categoryViewUrl(categoryPath, view, pageNumber)}
        />
      </div>
      <aside aria-label="Filtry" className="grid content-start gap-5 md:col-start-1 md:row-start-1">
        <InStockOnlyToggle categoryPath={categoryPath} view={view} />
        {facets.map(({ filter, rows }) => (
          <Facet key={filter.param} filter={filter} rows={rows} categoryPath={categoryPath} view={view} />
        ))}
      </aside>
    </div>
  );
}

type FacetProps = { filter: CategoryFilter; rows: FacetRow[]; categoryPath: string; view: CategoryView };

function Facet({ filter, rows, categoryPath, view }: FacetProps) {
  if (rows.length === 0) {
    return null;
  }

  const isSizeFacet = filter.param === "rozmiar";
  const visibleCount = isSizeFacet ? VISIBLE_SIZES : VISIBLE_FACET_ROWS;
  const { visible, hidden } = splitFacetRows(filter, rows, visibleCount);
  const selectedSlugs = view.selected[filter.param];
  const selectedRowIsHidden = hidden.some((row) => selectedSlugs.includes(row.slug));
  const FacetRows = isSizeFacet ? SizeSquares : CheckRows;
  const headingId = `filtr-${filter.param}`;

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-1 font-semibold">
        {filter.title}
      </h2>
      <FacetRows filter={filter} rows={visible} categoryPath={categoryPath} view={view} />
      {hidden.length > 0 && (
        <details open={selectedRowIsHidden} className="mt-1">
          <MoreSummary label={`Pozostałe, ${hidden.length}`} />
          <FacetRows filter={filter} rows={hidden} categoryPath={categoryPath} view={view} />
        </details>
      )}
    </section>
  );
}

function CheckRows({ filter, rows, categoryPath, view }: FacetProps) {
  return (
    <ul>
      {rows.map((row) => {
        const isSelected = view.selected[filter.param].includes(row.slug);
        const toggledView = withToggledValue(view, filter.param, row.slug);
        return (
          <li key={row.slug}>
            <Link
              href={categoryViewUrl(categoryPath, toggledView, 1)}
              {...filterLinkProps}
              aria-current={isSelected ? "true" : undefined}
              className="flex items-center justify-between gap-1"
            >
              <span className="flex items-center gap-1">
                <CheckSquare isChecked={isSelected} />
                <span className="link-line">{row.name}</span>
              </span>
              <span className="text-mute tabular-nums">{formatCount(row.count)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function InStockOnlyToggle({ categoryPath, view }: { categoryPath: string; view: CategoryView }) {
  return (
    <Link
      href={categoryViewUrl(categoryPath, withToggledInStockOnly(view), 1)}
      {...filterLinkProps}
      aria-current={view.inStockOnly ? "true" : undefined}
      className="flex items-center gap-1 font-semibold"
    >
      <CheckSquare isChecked={view.inStockOnly} />
      <span className="link-line">Tylko dostępne</span>
    </Link>
  );
}

function CheckSquare({ isChecked }: { isChecked: boolean }) {
  const stateClassName = isChecked ? "border-ink bg-ink" : "border-mute bg-paper";
  return <span aria-hidden="true" className={`size-2 shrink-0 rounded-box border-2 ${stateClassName}`} />;
}

function SizeSquares({ filter, rows, categoryPath, view }: FacetProps) {
  return (
    <ul className="flex flex-wrap gap-1">
      {rows.map((row) => {
        const isSelected = view.selected[filter.param].includes(row.slug);
        const toggledView = withToggledValue(view, filter.param, row.slug);
        const stateClassName = isSelected ? "bg-ink text-paper" : "bg-surface mouse:hover:bg-accent";
        return (
          <li key={row.slug}>
            <Link
              href={categoryViewUrl(categoryPath, toggledView, 1)}
              {...filterLinkProps}
              aria-current={isSelected ? "true" : undefined}
              title={productCountLabel(row.count)}
              className={`flex h-6 min-w-6 items-center justify-center rounded-box px-1 tabular-nums transition-colors duration-(--duration-reveal) ease-(--ease-out) motion-reduce:transition-none ${stateClassName}`}
            >
              {row.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

type SelectedFiltersProps = {
  categoryPath: string;
  view: CategoryView;
  facets: { filter: CategoryFilter; rows: FacetRow[] }[];
};

function SelectedFilters({ categoryPath, view, facets }: SelectedFiltersProps) {
  if (!hasSelectedFilters(view)) {
    return null;
  }

  const chips = selectedFilterChips(categoryPath, view, facets);

  return (
    <ul aria-label="Wybrane filtry" className="mb-3 flex flex-wrap items-center gap-1">
      {chips.map((chip) => (
        <li key={chip.key}>
          <Link
            href={chip.href}
            {...filterLinkProps}
            className="inline-flex items-center gap-1 rounded-box bg-ink px-1.5 py-0.5 text-small text-paper transition-colors duration-(--duration-reveal) ease-(--ease-out) mouse:hover:bg-accent mouse:hover:text-ink motion-reduce:transition-none"
          >
            <span className="sr-only">Usuń filtr: </span>
            {chip.label}
            <span aria-hidden="true">×</span>
          </Link>
        </li>
      ))}
      <li>
        <Link
          href={categoryViewUrl(categoryPath, withoutFilters(view), 1)}
          {...filterLinkProps}
          className="px-1 text-small"
        >
          <span className="link-line">Wyczyść filtry</span>
        </Link>
      </li>
    </ul>
  );
}

function selectedFilterChips(categoryPath: string, view: CategoryView, facets: SelectedFiltersProps["facets"]) {
  const chips: { key: string; label: string; href: string }[] = [];
  if (view.inStockOnly) {
    chips.push({
      key: "dostepne",
      label: "Tylko dostępne",
      href: categoryViewUrl(categoryPath, withToggledInStockOnly(view), 1),
    });
  }
  for (const { filter, rows } of facets) {
    for (const slug of view.selected[filter.param]) {
      const matchingRow = rows.find((row) => row.slug === slug);
      const name = matchingRow ? matchingRow.name : slug;
      const viewWithoutValue = withToggledValue(view, filter.param, slug);
      chips.push({
        key: `${filter.param}-${slug}`,
        label: filter.param === "rozmiar" ? `Rozmiar ${name}` : name,
        href: categoryViewUrl(categoryPath, viewWithoutValue, 1),
      });
    }
  }
  return chips;
}

function SortBar({ categoryPath, view, total }: { categoryPath: string; view: CategoryView; total: number }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-small">
      <nav aria-label="Sortowanie" className="flex flex-wrap gap-x-2">
        <span className="text-mute">Sortuj:</span>
        {SORT_OPTIONS.map((option) => {
          const isActive = option === view.sort;
          return (
            <Link
              key={option.param}
              href={categoryViewUrl(categoryPath, withSort(view, option), 1)}
              {...filterLinkProps}
              aria-current={isActive ? "true" : undefined}
              className={isActive ? "font-semibold" : ""}
            >
              <span className="link-line">{option.label}</span>
            </Link>
          );
        })}
      </nav>
      <p className="text-mute tabular-nums">{productCountLabel(total)}</p>
    </div>
  );
}

function NoMatches({ categoryPath, view }: { categoryPath: string; view: CategoryView }) {
  return (
    <div className="mt-4">
      <p>Żaden produkt w tej kategorii nie pasuje do wszystkich wybranych filtrów.</p>
      <p className="mt-2">
        <Button variant="secondary" href={categoryViewUrl(categoryPath, withoutFilters(view), 1)}>
          Wyczyść filtry
        </Button>
      </p>
    </div>
  );
}
