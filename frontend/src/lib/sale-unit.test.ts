import { expect, test } from "bun:test";
import { parseStatedSaleUnit, saleUnitOf } from "./sale-unit";

test("the unit stated in the technical parameters wins over the product name", () => {
  const parameters = "<p>EAN 5907522992187<br />Cena dotyczy 1: pary<br />Małe opakowanie: 12.00</p>";
  const statedUnit = parseStatedSaleUnit(parameters);

  expect(saleUnitOf("Czarne rękawice ochronne Ogrifox", statedUnit).countOf).toBe("par");
});

test("a product page without a stated unit falls back to the name", () => {
  const statedUnit = parseStatedSaleUnit("<p>EAN 5907522992187</p>");

  expect(statedUnit).toBeNull();
  expect(saleUnitOf("Trzewiki bezpieczne 4WRK AVIOR S3", statedUnit).countOf).toBe("par");
  expect(saleUnitOf("Kurtka korporacyjna TrafficS437", statedUnit).countOf).toBe("szt.");
});
