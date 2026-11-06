import { expect, test } from "bun:test";
import { matchCategories, type SuggestedCategory, splitAtMatch } from "./search-suggestions";

function suggested(name: string, count: number): SuggestedCategory {
  return { id: count, name, count, path: `/produkty/${count}/`, parentName: undefined };
}

test("categories match without Polish letters, most products first, at most four", () => {
  const categories = [
    suggested("Rękawice powlekane", 355),
    suggested("Wszystkie rękawice", 1136),
    suggested("Kaski", 50),
    suggested("Rękawice nitrylowe", 175),
    suggested("Rękawice skórzane", 166),
    suggested("Rękawice lateksowe", 161),
  ];
  const names = matchCategories(categories, " rekaw").map((category) => category.name);
  expect(names).toEqual(["Wszystkie rękawice", "Rękawice powlekane", "Rękawice nitrylowe", "Rękawice skórzane"]);
});

test("the typed fragment is found in the original spelling", () => {
  expect(splitAtMatch("Półmaska z łącznikiem", "lacz")).toEqual({
    before: "Półmaska z ",
    match: "łącz",
    after: "nikiem",
  });
  expect(splitAtMatch("Kask", "rek")).toBeUndefined();
});
