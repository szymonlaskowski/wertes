export type QuantityDiscountTier = { fromQuantity: number; percentOff: number };

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
