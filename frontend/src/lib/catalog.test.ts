import { expect, test } from "bun:test";
import type { Category } from "@/lib/store-api";
import {
  categoryTrail,
  findProductShelf,
  listBrands,
  listDepartments,
  listSuggestibleCategories,
  productCountLabel,
  splitCategoryDescription,
  splitSearchCounts,
} from "./catalog";

function category(id: number, slug: string, parent: number, count: number): Category {
  return { id, name: slug, slug, parent, count, permalink: `https://x/produkty/${slug}/` };
}

const categories = [
  category(1, "artykuly-bhp", 0, 100),
  category(2, "odziez-rekawice-obuwie", 1, 60),
  category(3, "ochrona-rak", 2, 10),
  category(4, "ochrona-nog", 2, 50),
  category(5, "rekawice-nitrylowe", 3, 5),
  category(6, "producenci", 1, 90),
  category(7, "reis", 6, 30),
  category(8, "3m", 6, 20),
  category(9, "pusta-marka", 6, 0),
  category(10, "przemysl", 0, 7),
];

test("suggestions cover shelf categories with products, without brands, with the parent name", () => {
  const suggestible = listSuggestibleCategories(categories);
  expect(suggestible.map((category) => category.id)).toEqual([1, 2, 3, 4, 5, 10]);
  expect(suggestible.find((category) => category.id === 5)?.parentName).toBe("ochrona-rak");
});

test("search counts split into leaf shelves and brands, most hits first, without promotions", () => {
  const withPromotions = [...categories, category(11, "promocje-i-nowosci", 0, 3), category(12, "nowosci", 11, 3)];
  const counts = [1, 3, 4, 5, 7, 8, 10, 11, 12].map((term) => ({ term, count: term }));
  const { shelves, brands } = splitSearchCounts(withPromotions, counts);
  expect(shelves.map((shelf) => shelf.category.slug)).toEqual(["przemysl", "rekawice-nitrylowe", "ochrona-nog"]);
  expect(brands.map((brand) => brand.category.slug)).toEqual(["3m", "reis"]);
});

test("departments are grandchildren of the catalog root, without brands, plus standalone ones", () => {
  const slugs = listDepartments(categories).map((department) => department.slug);
  expect(slugs).toEqual(["ochrona-nog", "ochrona-rak", "przemysl"]);
});

test("brands are alphabetical and skip empty ones", () => {
  const slugs = listBrands(categories).map((brand) => brand.slug);
  expect(slugs).toEqual(["3m", "reis"]);
});

test("product shelf is its smallest category that is not a brand, with the trail from the root", () => {
  const shelf = findProductShelf(categories, [7, 3, 5]);
  expect(shelf?.slug).toBe("rekawice-nitrylowe");
  const trail = categoryTrail(categories, categories[2]);
  expect(trail.map((category) => category.slug)).toEqual(["artykuly-bhp", "odziez-rekawice-obuwie", "ochrona-rak"]);
  expect(findProductShelf(categories, [7])).toBeUndefined();
});

test("product count uses the Polish plural form", () => {
  expect(productCountLabel(1)).toBe("1 produkt");
  expect(productCountLabel(4554)).toBe("4554 produkty");
  expect(productCountLabel(1220)).toBe("1220 produktów");
  expect(productCountLabel(10532)).toBe("10\u00a0532 produkty");
});

test("description with markup keeps headings and lists, the first paragraph becomes the intro", () => {
  const html = `<div class="x"><h2 style="a"><strong>Nagłówek</strong></h2>\n<p data-x="1">Rękawice <em>ochronne</em> &#8211; i&nbsp;nie tylko.</p><ul><li onclick="x()">Nitryl</li></ul><script>alert(1)</script></div>`;
  expect(splitCategoryDescription(html)).toEqual({
    intro: "Rękawice ochronne – i\u00a0nie tylko.",
    restHtml: "<h2><strong>Nagłówek</strong></h2>\n<ul><li>Nitryl</li></ul>alert(1)",
  });
});

test("plain text description splits into paragraphs on blank lines", () => {
  const text = `<div class="prose">\r\n\r\nPierwszy akapit.\r\n\r\nDrugi akapit.\r\n\r\nTrzeci.</div>`;
  expect(splitCategoryDescription(text)).toEqual({
    intro: "Pierwszy akapit.",
    restHtml: "<p>Drugi akapit.</p>\n<p>Trzeci.</p>",
  });
});

test("empty description gives no intro and no text", () => {
  expect(splitCategoryDescription("")).toEqual({ intro: "", restHtml: "" });
});
