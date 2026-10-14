import { expect, test } from "bun:test";
import { decodeHtmlEntities } from "./html-entities";

test("decodes the entities WooCommerce puts in product and category names", () => {
  expect(decodeHtmlEntities("BIZET 70&#215;140 RED &#8211; kolor")).toBe(
    "BIZET 70×140 RED – kolor",
  );
  expect(decodeHtmlEntities("Leber&amp;Hollman")).toBe("Leber&Hollman");
  expect(decodeHtmlEntities("&bdquo;Ręcznik&rdquo; &#x41;")).toBe("„Ręcznik” A");
});

test("leaves unknown entities untouched", () => {
  expect(decodeHtmlEntities("a &unknown; b")).toBe("a &unknown; b");
});
