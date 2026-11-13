import { cacheLife } from "next/cache";
import { getFromWordpress } from "./store-api";

export type QuantityDiscountTier = { fromQuantity: number; percentOff: number };

export async function findQuantityDiscountTiers(productPermalink: string) {
  "use cache: remote";
  cacheLife("default");

  const path = new URL(productPermalink).pathname;
  const response = await getFromWordpress(path);
  if (!response.ok) {
    throw new Error(`WordPress ${path} responded with ${response.status}`);
  }
  return parseQuantityDiscountTiers(await response.text());
}

export function parseQuantityDiscountTiers(productPageHtml: string) {
  const tableStart = productPageHtml.indexOf("plugify_tbl_row");
  if (tableStart === -1) {
    return [];
  }
  const tableEnd = productPageHtml.indexOf("</table>", tableStart);
  const firstTable = productPageHtml.slice(tableStart, tableEnd);

  const tiers: QuantityDiscountTier[] = [];
  const tierRows = firstTable.matchAll(/id="qtystrt" value="(\d+)"[\s\S]*?plugify_typ_col[^>]*>\s*(\d+(?:[.,]\d+)?)%/g);
  for (const [, fromQuantity, percentOff] of tierRows) {
    tiers.push({ fromQuantity: Number(fromQuantity), percentOff: Number(percentOff.replace(",", ".")) });
  }
  return tiers;
}
