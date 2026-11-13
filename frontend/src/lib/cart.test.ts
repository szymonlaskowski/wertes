import { expect, test } from "bun:test";
import { priceReductionPercent } from "./cart";

test("price reduction compares the paid price with the regular price", () => {
  expect(priceReductionPercent({ prices: { price: "4339", regular_price: "4428" } })).toBe(2);
  expect(priceReductionPercent({ prices: { price: "4428", regular_price: "4428" } })).toBe(0);
});
