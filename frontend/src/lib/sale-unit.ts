export type SaleUnit = { pricePer: string; countOf: string };

const PIECE: SaleUnit = { pricePer: "za szt.", countOf: "szt." };
const PAIR: SaleUnit = { pricePer: "za parę", countOf: "par" };

const SOLD_IN_PAIRS_NAME_STARTS = [
  "rękawice",
  "rękawiczki",
  "buty",
  "półbuty",
  "trzewiki",
  "sandały",
  "klapki",
  "kalosze",
  "gumofilce",
  "chodaki",
  "obuwie",
  "skarpety",
  "skarpetki",
  "nakolanniki",
];

export function saleUnitOf(productName: string): SaleUnit {
  const firstWord = productName.trim().split(/\s+/)[0].toLocaleLowerCase("pl");
  if (SOLD_IN_PAIRS_NAME_STARTS.includes(firstWord)) {
    return PAIR;
  }
  return PIECE;
}
