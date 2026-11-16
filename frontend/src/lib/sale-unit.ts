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

const STATED_UNIT = /Cena dotyczy 1: (\p{L}+)/u;

export function parseStatedSaleUnit(productPageHtml: string): SaleUnit | null {
  const match = productPageHtml.match(STATED_UNIT);
  if (!match) {
    return null;
  }
  const statedUnit = match[1].toLocaleLowerCase("pl");
  if (statedUnit === "pary") {
    return PAIR;
  }
  if (statedUnit === "sztuki") {
    return PIECE;
  }
  return null;
}

export function saleUnitOf(productName: string, statedUnit: SaleUnit | null): SaleUnit {
  if (statedUnit) {
    return statedUnit;
  }
  const firstWord = productName.trim().split(/\s+/)[0].toLocaleLowerCase("pl");
  if (SOLD_IN_PAIRS_NAME_STARTS.includes(firstWord)) {
    return PAIR;
  }
  return PIECE;
}
