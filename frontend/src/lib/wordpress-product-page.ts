import { cacheLife } from "next/cache";
import { parseQuantityDiscountTiers } from "./quantity-discounts";
import { parseStatedSaleUnit } from "./sale-unit";
import { getFromWordpress } from "./store-api";

export async function readWordpressProductPage(productPermalink: string) {
  "use cache: remote";
  cacheLife("default");

  const path = new URL(productPermalink).pathname;
  const response = await getFromWordpress(path);
  if (!response.ok) {
    throw new Error(`WordPress ${path} responded with ${response.status}`);
  }
  const productPageHtml = await response.text();
  return {
    quantityDiscountTiers: parseQuantityDiscountTiers(productPageHtml),
    statedSaleUnit: parseStatedSaleUnit(productPageHtml),
  };
}
