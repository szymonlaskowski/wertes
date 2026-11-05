import { compareSizes } from "@/lib/variations";
import jhkTsOcean from "./jhk-ts-ocean.json";
import komW from "./kom-w.json";

export type PreviewVariant = {
  id: number;
  sku: string;
  color: string | null;
  size: string;
  image: string;
  inStock: boolean;
  netGrosze: number;
  grossGrosze: number;
};

export type PreviewProduct = {
  name: string;
  sku: string;
  brand: string;
  unit: string;
  images: string[];
  variants: PreviewVariant[];
};

export const colorAndSizeProduct: PreviewProduct = { ...jhkTsOcean, unit: "szt." };
export const sizeOnlyProduct: PreviewProduct = { ...komW, unit: "szt." };

export const QUANTITY_TIERS = [
  { fromQuantity: 1, percentOff: 0 },
  { fromQuantity: 5, percentOff: 2 },
  { fromQuantity: 11, percentOff: 5 },
  { fromQuantity: 21, percentOff: 6 },
  { fromQuantity: 51, percentOff: 8 },
  { fromQuantity: 91, percentOff: 10 },
  { fromQuantity: 141, percentOff: 12 },
  { fromQuantity: 301, percentOff: 14 },
];
export type QuantityTier = (typeof QUANTITY_TIERS)[number];

export function tierForQuantity(quantity: number) {
  let matchingTier = QUANTITY_TIERS[0];
  for (const tier of QUANTITY_TIERS) {
    if (quantity >= tier.fromQuantity) {
      matchingTier = tier;
    }
  }
  return matchingTier;
}

export function discountedGrosze(grosze: number, tier: QuantityTier) {
  return Math.round((grosze * (100 - tier.percentOff)) / 100);
}

export function formatPrice(grosze: number) {
  return `${(grosze / 100).toFixed(2)} zł`;
}

export function colorsOf(product: PreviewProduct) {
  const colors: string[] = [];
  for (const variant of product.variants) {
    const color = variant.color;
    if (color !== null && !colors.includes(color)) {
      colors.push(color);
    }
  }
  return colors.sort((first, second) => first.localeCompare(second, "pl"));
}

export function sizesOf(product: PreviewProduct) {
  const sizes: string[] = [];
  for (const variant of product.variants) {
    if (!sizes.includes(variant.size)) {
      sizes.push(variant.size);
    }
  }
  return sizes.sort(compareSizes);
}

export function findVariant(product: PreviewProduct, color: string | null, size: string | null) {
  return product.variants.find((variant) => variant.color === color && variant.size === size);
}

export function imageForColor(product: PreviewProduct, color: string | null) {
  const variantInColor = product.variants.find((variant) => variant.color === color);
  if (!variantInColor) {
    return product.images[0];
  }
  return variantInColor.image;
}

export function lowestAndHighestNet(product: PreviewProduct) {
  const netPrices = product.variants.map((variant) => variant.netGrosze);
  return { lowest: Math.min(...netPrices), highest: Math.max(...netPrices) };
}
