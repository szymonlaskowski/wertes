import { expect, test } from "bun:test";
import type { Product, VariationDetails } from "@/lib/store-api";
import { buildVariantPicker, findSelectedVariant, isOptionAvailable, selectOption } from "./variations";

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
    attributes: [{ name: "Rozmiar", taxonomy: "pa_rozmiar", has_variations: true, terms }],
    variations: variationSlugs.map((slug, index) => ({
      id: index + 10,
      attributes: [{ name: "Rozmiar", value: slug }],
    })),
  };
}

function detailsFor(product: Product, outOfStockIds: number[] = []): VariationDetails[] {
  return product.variations.map((variation) => ({
    id: variation.id,
    sku: `SKU${variation.id}`,
    price_html: "",
    is_in_stock: !outOfStockIds.includes(variation.id),
    images: [{ src: `https://x/${variation.id}.jpg`, alt: "" }],
  }));
}

function sizeLabels(product: Product) {
  const picker = buildVariantPicker(product, detailsFor(product));
  return picker.choices[0].options.map((option) => option.label);
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
  expect(sizeLabels(product)).toEqual(["7", "8", "10"]);
});

test("letter sizes follow the clothing order, not the alphabet", () => {
  const terms = ["4XL", "L", "M", "S", "XL", "XS", "XXL"].map((name) => ({ name, slug: name.toLowerCase() }));
  const product = productWithSizes(terms, ["4xl", "l", "m", "s", "xl", "xs", "xxl"]);
  expect(sizeLabels(product)).toEqual(["XS", "S", "M", "L", "XL", "XXL", "4XL"]);
});

test("an attribute with one value is hidden, and sent to the cart only where the variation accepts any value", () => {
  const terms = ["7XL", "L", "M"].map((name) => ({ name, slug: name.toLowerCase() }));
  const product = productWithSizes(terms, ["7xl", "l", "m"]);
  product.attributes.push({ name: "Kolor", taxonomy: "pa_kolor", has_variations: true, terms: [{ name: "Biały", slug: "bialy" }] });
  product.variations[0].attributes.push({ name: "Kolor", value: null });
  product.variations[1].attributes.push({ name: "Kolor", value: "bialy" });
  product.variations[2].attributes.push({ name: "Kolor", value: "bialy" });

  const picker = buildVariantPicker(product, detailsFor(product));

  expect(picker.choices.map((choice) => choice.name)).toEqual(["Rozmiar"]);
  expect(picker.choices[0].options.map((option) => option.label)).toEqual(["M", "L", "7XL"]);
  expect(picker.variants[0].hiddenFields).toEqual([{ name: "attribute_pa_kolor", value: "bialy" }]);
  expect(picker.variants[1].hiddenFields).toEqual([]);
});

function colorAndSizeProduct() {
  const product = productWithSizes(
    [
      { name: "M", slug: "m" },
      { name: "L", slug: "l" },
    ],
    ["m", "l", "m", "l"],
  );
  product.attributes.unshift({
    name: "Kolor",
    taxonomy: "pa_kolor",
    has_variations: true,
    terms: [
      { name: "Czarny", slug: "czarny" },
      { name: "Niebieski", slug: "niebieski" },
    ],
  });
  const colors = ["czarny", "czarny", "niebieski", "niebieski"];
  product.variations.forEach((variation, index) => {
    variation.attributes.unshift({ name: "Kolor", value: colors[index] });
  });
  return product;
}

test("a size out of stock in the chosen color cannot be picked, but stays available in other colors", () => {
  const product = colorAndSizeProduct();
  const blackLargeId = 11;
  const picker = buildVariantPicker(product, detailsFor(product, [blackLargeId]));

  expect(isOptionAvailable(picker, { Kolor: "czarny" }, "Rozmiar", "l")).toBe(false);
  expect(isOptionAvailable(picker, { Kolor: "niebieski" }, "Rozmiar", "l")).toBe(true);
  expect(isOptionAvailable(picker, { Rozmiar: "l" }, "Kolor", "czarny")).toBe(true);
});

test("switching to a color without the chosen size clears the size", () => {
  const product = colorAndSizeProduct();
  const blackLargeId = 11;
  const picker = buildVariantPicker(product, detailsFor(product, [blackLargeId]));

  const blueLarge = { Kolor: "niebieski", Rozmiar: "l" };
  expect(findSelectedVariant(picker, blueLarge)?.sku).toBe("SKU13");
  expect(selectOption(picker, blueLarge, "Kolor", "czarny")).toEqual({ Kolor: "czarny" });
});
