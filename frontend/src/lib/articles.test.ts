import { expect, test } from "bun:test";
import { cleanArticleHtml, linkedProductSlugs, readingMinutes } from "./articles";

const site = "https://wp.example";

test("links to products and categories on the live shop become local", () => {
  const html = `<a href="https://wertes.pl/produkty/artykuly-bhp/">BHP</a><a href="https://wertes.pl/o-nas/">O nas</a>`;
  expect(cleanArticleHtml(html, site)).toBe(`<a href="/produkty/artykuly-bhp/">BHP</a><a href="https://wertes.pl/o-nas/">O nas</a>`);
});

test("article html loses lightbox icons and inline colors, product links become local", () => {
  const html = [
    `<p><mark style="color:#f00" class="has-inline-color">Uwaga</mark></p>`,
    `<figure><img src="${site}/a.jpg"><a href="${site}/a.jpg" class="wpcp-lightbox-trigger"><span><svg><path d="M0"/></svg></span></a></figure>`,
    `<a href="${site}/produkt/artykuly-bhp/reis/rekawice-rdz/">RDZ</a>`,
  ].join("");
  expect(cleanArticleHtml(html, site)).toBe(
    `<p><mark class="has-inline-color">Uwaga</mark></p><figure><img src="${site}/a.jpg"></figure><a href="/produkt/artykuly-bhp/reis/rekawice-rdz/">RDZ</a>`,
  );
});

test("linked products are listed once, in order of appearance", () => {
  const html = `<a href="/produkt/a/rdz/">x</a><a href="/produkt/b/nitrix/">y</a><a href="/produkt/a/rdz/">z</a>`;
  expect(linkedProductSlugs(html)).toEqual(["rdz", "nitrix"]);
});

test("reading time is at least one minute", () => {
  expect(readingMinutes("<p>krótko</p>")).toBe(1);
  expect(readingMinutes(`<p>${"słowo ".repeat(1000)}</p>`)).toBe(5);
});
