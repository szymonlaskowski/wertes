import { categoryPagePath } from "@/lib/catalog-paths";
import type { AttributeFilter, AttributeTerm, AttributeTermCount, ProductSort } from "@/lib/store-api";
import { compareSizes } from "@/lib/variations";

const MAX_VALUES_PER_FILTER = 20;
const TERM_SLUG = /^[a-z0-9-]{1,80}$/;

export const CATEGORY_FILTERS = [
  { param: "producent", taxonomy: "pa_marka", title: "Producenci" },
  { param: "rozmiar", taxonomy: "pa_rozmiar", title: "Rozmiar" },
  { param: "norma", taxonomy: "pa_normy", title: "Normy" },
] as const;

export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];
export type FilterParam = CategoryFilter["param"];

export const SORT_OPTIONS = [
  { param: "najczesciej-kupowane", label: "najczęściej kupowane", sort: { orderby: "popularity", order: "desc" } },
  { param: "najnowsze", label: "najnowsze", sort: { orderby: "date", order: "desc" } },
  { param: "najtansze", label: "najtańsze", sort: { orderby: "price", order: "asc" } },
  { param: "najdrozsze", label: "najdroższe", sort: { orderby: "price", order: "desc" } },
] as const satisfies { param: string; label: string; sort: ProductSort }[];

export type SortOption = (typeof SORT_OPTIONS)[number];
export const DEFAULT_SORT = SORT_OPTIONS[0];

const IN_STOCK_PARAM = "dostepne";
const IN_STOCK_VALUE = "tak";

export type CategoryView = { selected: Record<FilterParam, string[]>; inStockOnly: boolean; sort: SortOption };

type SearchParams = Record<string, string | string[] | undefined>;

export function readCategoryView(searchParams: SearchParams): CategoryView {
  return {
    selected: {
      producent: readSlugs(searchParams.producent),
      rozmiar: readSlugs(searchParams.rozmiar),
      norma: readSlugs(searchParams.norma),
    },
    inStockOnly: searchParams[IN_STOCK_PARAM] === IN_STOCK_VALUE,
    sort: readSort(searchParams.sortuj),
  };
}

function readSlugs(value: string | string[] | undefined) {
  if (value === undefined) {
    return [];
  }
  const values = typeof value === "string" ? [value] : value;
  const validSlugs = values.filter((slug) => TERM_SLUG.test(slug));
  return [...new Set(validSlugs)].slice(0, MAX_VALUES_PER_FILTER);
}

function readSort(value: string | string[] | undefined) {
  const option = SORT_OPTIONS.find((candidate) => candidate.param === value);
  return option ?? DEFAULT_SORT;
}

export function toAttributeFilters(view: CategoryView) {
  const filters: AttributeFilter[] = [];
  for (const filter of CATEGORY_FILTERS) {
    const slugs = view.selected[filter.param];
    if (slugs.length > 0) {
      filters.push({ taxonomy: filter.taxonomy, slugs });
    }
  }
  return filters;
}

export function hasSelectedFilters(view: CategoryView) {
  return view.inStockOnly || toAttributeFilters(view).length > 0;
}

export function categoryViewUrl(categoryPath: string, view: CategoryView, page: number) {
  const params = new URLSearchParams();
  for (const filter of CATEGORY_FILTERS) {
    for (const slug of view.selected[filter.param]) {
      params.append(filter.param, slug);
    }
  }
  if (view.inStockOnly) {
    params.set(IN_STOCK_PARAM, IN_STOCK_VALUE);
  }
  if (view.sort !== DEFAULT_SORT) {
    params.set("sortuj", view.sort.param);
  }

  const path = categoryPagePath(categoryPath, page);
  const query = params.toString();
  if (query === "") {
    return path;
  }
  return `${path}?${query}`;
}

export function withToggledValue(view: CategoryView, param: FilterParam, slug: string): CategoryView {
  const current = view.selected[param];
  const next = current.includes(slug) ? current.filter((value) => value !== slug) : [...current, slug];
  return { ...view, selected: { ...view.selected, [param]: next } };
}

export function withToggledInStockOnly(view: CategoryView): CategoryView {
  return { ...view, inStockOnly: !view.inStockOnly };
}

export function withSort(view: CategoryView, sort: SortOption): CategoryView {
  return { ...view, sort };
}

export function withoutFilters(view: CategoryView): CategoryView {
  return { ...view, selected: { producent: [], rozmiar: [], norma: [] }, inStockOnly: false };
}

export type FacetRow = { slug: string; name: string; count: number };

export function facetRows(terms: AttributeTerm[], counts: AttributeTermCount[]) {
  const rows: FacetRow[] = [];
  for (const term of terms) {
    const termCount = counts.find((candidate) => candidate.term === term.id);
    if (termCount && termCount.count > 0) {
      rows.push({ slug: term.slug, name: term.name, count: termCount.count });
    }
  }
  rows.sort((first, second) => second.count - first.count);
  return rows;
}

export function splitFacetRows(filter: CategoryFilter, rows: FacetRow[], visibleCount: number) {
  const visible = rows.slice(0, visibleCount);
  const hidden = rows.slice(visibleCount);
  if (filter.param === "rozmiar") {
    visible.sort((first, second) => compareSizes(first.name, second.name));
    hidden.sort((first, second) => compareSizes(first.name, second.name));
  }
  return { visible, hidden };
}
