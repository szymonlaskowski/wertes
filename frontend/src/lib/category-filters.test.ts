import { expect, test } from "bun:test";
import {
  CATEGORY_FILTERS,
  categoryViewUrl,
  facetRows,
  readCategoryView,
  splitFacetRows,
  toAttributeFilters,
  withoutFilters,
  withToggledInStockOnly,
  withToggledValue,
} from "./category-filters";

const sizeFilter = CATEGORY_FILTERS[1];

test("url params become store filters, invalid slugs and unknown sorts are dropped", () => {
  const view = readCategoryView({
    rozmiar: ["9", "10", "9", "<script>"],
    norma: "en-388",
    sortuj: "losowo",
  });
  expect(toAttributeFilters(view)).toEqual([
    { taxonomy: "pa_rozmiar", slugs: ["9", "10"] },
    { taxonomy: "pa_normy", slugs: ["en-388"] },
  ]);
  expect(view.sort.param).toBe("najczesciej-kupowane");
});

test("toggling a value goes back to the first page and keeps the sort", () => {
  const view = readCategoryView({ rozmiar: "9", sortuj: "najtansze" });
  const withTen = withToggledValue(view, "rozmiar", "10");
  expect(categoryViewUrl("/produkty/ochrona-rak/", withTen, 1)).toBe(
    "/produkty/ochrona-rak/?rozmiar=9&rozmiar=10&sortuj=najtansze",
  );
  const withoutNine = withToggledValue(view, "rozmiar", "9");
  expect(categoryViewUrl("/produkty/ochrona-rak/", withoutNine, 2)).toBe(
    "/produkty/ochrona-rak/page/2/?sortuj=najtansze",
  );
});

test("the most common sizes are shown first, each group in size order", () => {
  const terms = [
    { id: 1, name: "XL", slug: "xl" },
    { id: 2, name: "S", slug: "s" },
    { id: 3, name: "10", slug: "10" },
    { id: 4, name: "M", slug: "m" },
    { id: 5, name: "Brak", slug: "brak" },
  ];
  const counts = [
    { term: 1, count: 30 },
    { term: 2, count: 20 },
    { term: 3, count: 2 },
    { term: 4, count: 50 },
    { term: 5, count: 0 },
  ];
  const { visible, hidden } = splitFacetRows(sizeFilter, facetRows(terms, counts), 3);
  expect(visible.map((row) => row.name)).toEqual(["S", "M", "XL"]);
  expect(hidden.map((row) => row.name)).toEqual(["10"]);
});

test("in stock only lives in the url and is cleared with the other filters", () => {
  const view = withToggledInStockOnly(readCategoryView({ norma: "en-388" }));
  const url = categoryViewUrl("/produkty/ochrona-rak/", view, 1);
  expect(url).toBe("/produkty/ochrona-rak/?norma=en-388&dostepne=tak");
  expect(readCategoryView({ norma: "en-388", dostepne: "tak" })).toEqual(view);
  expect(categoryViewUrl("/produkty/ochrona-rak/", withoutFilters(view), 1)).toBe("/produkty/ochrona-rak/");
});
