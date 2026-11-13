import { expect, test } from "bun:test";
import { parseQuantityDiscountTiers } from "./quantity-discounts";

const tierRow = (from: number, to: number, percent: string) =>
  `<tr class="plugify_tbl_row"> <td class="plugify_qty_col"> ${from}-${to} <input type="hidden" id="qtystrt" value="${from}"> <input type="hidden" id="qtyend" value="${to}"> </td> <td class="plugify_typ_col" style="width:33.33%; "> ${percent}% </td> <td class="plugify_pip_col">15,10 zł</td> </tr>`;

test("tiers come from the first discount table on the product page", () => {
  const firstVariantTable = `<table><tr class="plugify_tbl_row"><th>Ilość</th></tr>${tierRow(5, 10, "2")}${tierRow(11, 20, "5")}</table>`;
  const secondVariantTable = `<table>${tierRow(5, 10, "3")}</table>`;

  expect(parseQuantityDiscountTiers(firstVariantTable + secondVariantTable)).toEqual([
    { fromQuantity: 5, percentOff: 2 },
    { fromQuantity: 11, percentOff: 5 },
  ]);
});

test("a product page without the discount table has no tiers", () => {
  expect(parseQuantityDiscountTiers("<main>Ręcznik</main>")).toEqual([]);
});
