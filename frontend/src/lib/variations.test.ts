import { expect, test } from "bun:test";
import type { Product } from "@/lib/store-api";
import { variationOptions } from "./variations";

function productWithSizes(terms: { name: string; slug: string }[], variationSlugs: string[]): Product {
  return {
    id: 1,
    name: "Rękawice",
    slug: "rekawice",
    permalink: "https://x/produkt/rekawice/",
    type: "variable",
    sku: "R",
    price_html: "",
    is_in_stock: true,
    images: [],
    description: "",
    categories: [],
    attributes: [{ name: "Rozmiar", has_variations: true, terms }],
    variations: variationSlugs.map((slug, index) => ({
      id: index + 10,
      attributes: [{ name: "Rozmiar", value: slug }],
    })),
  };
}

test("numeric sizes are ordered by number and labelled with the term name", () => {
  const product = productWithSizes(
    [
      { name: "10", slug: "10" },
      { name: "7", slug: "7" },
      { name: "8", slug: "rozmiar-8" },
    ],
    ["10", "rozmiar-8", "7"],
  );
  expect(variationOptions(product).map((option) => option.label)).toEqual(["7", "8", "10"]);
});

test("letter sizes follow the clothing order, not the alphabet", () => {
  const terms = ["4XL", "L", "M", "S", "XL", "XS", "XXL"].map((name) => ({ name, slug: name.toLowerCase() }));
  const product = productWithSizes(terms, ["4xl", "l", "m", "s", "xl", "xs", "xxl"]);
  expect(variationOptions(product).map((option) => option.label)).toEqual(["XS", "S", "M", "L", "XL", "XXL", "4XL"]);
});

test("an attribute that accepts any value is left out of the label", () => {
  const product = productWithSizes([{ name: "L", slug: "l" }], ["l"]);
  product.attributes.push({ name: "Kolor", has_variations: true, terms: [] });
  product.variations[0].attributes.push({ name: "Kolor", value: null });
  expect(variationOptions(product).map((option) => option.label)).toEqual(["L"]);
});
