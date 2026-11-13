import { expect, test } from "bun:test";
import { yoastHead, yoastMetadata } from "./yoast";

test("yoast title replaces the whole page title and keeps the description", () => {
  const head = yoastHead.assert({ title: "Ochrona r&#261;k | Wertes", description: "Opis" });
  expect(yoastMetadata(head, "Ochrona rąk")).toEqual({
    title: { absolute: "Ochrona rąk | Wertes" },
    description: "Opis",
  });
});

test("pages without yoast data fall back to their own name", () => {
  expect(yoastMetadata(undefined, "Ochrona rąk")).toEqual({ title: "Ochrona rąk" });
  expect(yoastMetadata(yoastHead.assert({}), "Ochrona rąk")).toEqual({ title: "Ochrona rąk", description: undefined });
});
