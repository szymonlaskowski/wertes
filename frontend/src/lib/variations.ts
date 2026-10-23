import type { Product } from "@/lib/store-api";

const LETTER_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "XXXL", "3XL", "4XL", "5XL", "6XL"];

export type VariationOption = { id: number; label: string };

export function variationOptions(product: Product) {
  const options: VariationOption[] = product.variations.map((variation) => ({
    id: variation.id,
    label: variationLabel(product, variation),
  }));
  options.sort((first, second) => compareSizes(first.label, second.label));
  return options;
}

function variationLabel(product: Product, variation: Product["variations"][number]) {
  const termNames: string[] = [];
  for (const attribute of variation.attributes) {
    if (attribute.value === null) {
      continue;
    }
    termNames.push(termName(product, { name: attribute.name, value: attribute.value }));
  }
  return termNames.join(", ");
}

function termName(product: Product, variationAttribute: { name: string; value: string }) {
  const productAttribute = product.attributes.find((attribute) => attribute.name === variationAttribute.name);
  if (!productAttribute) {
    return variationAttribute.value;
  }
  const term = productAttribute.terms.find((candidate) => candidate.slug === variationAttribute.value);
  if (!term) {
    return variationAttribute.value;
  }
  return term.name;
}

export function compareSizes(first: string, second: string) {
  const firstLetterRank = LETTER_SIZES.indexOf(first.toUpperCase());
  const secondLetterRank = LETTER_SIZES.indexOf(second.toUpperCase());
  const bothAreLetterSizes = firstLetterRank !== -1 && secondLetterRank !== -1;
  if (bothAreLetterSizes) {
    return firstLetterRank - secondLetterRank;
  }
  return first.localeCompare(second, "pl", { numeric: true });
}
