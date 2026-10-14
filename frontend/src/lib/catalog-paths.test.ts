import { expect, test } from "bun:test";
import { categoryPagePath, parseCategorySegments, routeSegments } from "./catalog-paths";

test("reads the page number from a WordPress style /page/N/ suffix", () => {
  expect(parseCategorySegments(["przemysl", "wylaczniki", "page", "3"])).toEqual({
    categorySegments: ["przemysl", "wylaczniki"],
    page: 3,
  });
  expect(parseCategorySegments(["przemysl"])).toEqual({ categorySegments: ["przemysl"], page: 1 });
});

test("rejects page numbers WordPress would not link to", () => {
  expect(parseCategorySegments(["przemysl", "page", "1"])).toBeUndefined();
  expect(parseCategorySegments(["przemysl", "page", "abc"])).toBeUndefined();
  expect(parseCategorySegments(["przemysl", "page", "2.5"])).toBeUndefined();
});

test("builds the same paths WordPress uses", () => {
  expect(categoryPagePath("/produkty/przemysl/", 1)).toBe("/produkty/przemysl/");
  expect(categoryPagePath("/produkty/przemysl/", 2)).toBe("/produkty/przemysl/page/2/");
  expect(routeSegments("https://wertes.pl/produkty/przemysl/wylaczniki/")).toEqual([
    "przemysl",
    "wylaczniki",
  ]);
});
