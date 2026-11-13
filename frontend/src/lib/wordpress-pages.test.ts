import { expect, test } from "bun:test";
import { cleanPageHtml } from "./wordpress-pages";

const site = "https://wp.example";

test("page html drops the duplicate title and links shop pages locally", () => {
  const html =
    '<h1 class="wp-block-heading">Reklamacje</h1>' +
    '<p>Zobacz <a href="https://wertes.pl/regulamin/">regulamin</a>, ' +
    '<a href="https://wp.example/tabela-rozmiarow-base/">tabelę</a>, ' +
    '<a href="https://wertes.pl/tabela-rozmiarow-portwest">Portwest</a> ' +
    'i <a href="https://wp.example/moje-konto/">konto</a>.</p>';

  expect(cleanPageHtml(html, site)).toBe(
    '<p>Zobacz <a href="/regulamin/">regulamin</a>, ' +
      '<a href="/tabela-rozmiarow-base/">tabelę</a>, ' +
      '<a href="/tabela-rozmiarow-portwest/">Portwest</a> ' +
      'i <a href="https://wp.example/moje-konto/">konto</a>.</p>',
  );
});
