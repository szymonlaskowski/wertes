import { expect, test } from "bun:test";
import type { Category } from "@/lib/store-api";
import { firstParagraph, listBrands, listDepartments, productCountLabel } from "./catalog";

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

test("departments are grandchildren of the catalog root, without brands, plus standalone ones", () => {
  const slugs = listDepartments(categories).map((department) => department.slug);
  expect(slugs).toEqual(["ochrona-nog", "ochrona-rak", "przemysl"]);
});

test("brands are alphabetical and skip empty ones", () => {
  const slugs = listBrands(categories).map((brand) => brand.slug);
  expect(slugs).toEqual(["3m", "reis"]);
});

test("product count uses the Polish plural form", () => {
  expect(productCountLabel(1)).toBe("1 produkt");
  expect(productCountLabel(4554)).toBe("4554 produkty");
  expect(productCountLabel(1220)).toBe("1220 produktów");
  expect(productCountLabel(10532)).toBe("10\u00a0532 produkty");
});

test("first paragraph of a department description is plain text", () => {
  const html = `<h2><strong>Nagłówek</strong></h2>\n<p data-x="1">Rękawice <em>ochronne</em> &#8211; i&nbsp;nie tylko.</p><p>Drugi.</p>`;
  expect(firstParagraph(html)).toBe("Rękawice ochronne – i\u00a0nie tylko.");
});
