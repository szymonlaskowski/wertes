import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/button";
import { PageTitle } from "@/components/page-title";
import { StockDot } from "@/components/stock-dot";
import { contrastRatio, readThemeTokens } from "./theme-tokens";
import type { ThemeToken } from "./theme-tokens";
import "./podglad.css";

export const metadata: Metadata = {
  title: "Podgląd wyglądu",
  robots: { index: false },
};

const themeTokens = readThemeTokens(
  readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8"),
);

const TEXT_MINIMUM_CONTRAST = 4.5;
const SHAPE_MINIMUM_CONTRAST = 3;

type ContrastPair = {
  foreground: string;
  background: string;
  usage: string;
  minimum: number;
};

const contrastPairs: ContrastPair[] = [
  { foreground: "ink", background: "paper", usage: "tekst", minimum: TEXT_MINIMUM_CONTRAST },
  { foreground: "mute", background: "paper", usage: "tekst drugi", minimum: TEXT_MINIMUM_CONTRAST },
  { foreground: "ink", background: "accent", usage: "tekst przycisku", minimum: TEXT_MINIMUM_CONTRAST },
  { foreground: "accent", background: "paper", usage: "kropka motywu i braku", minimum: SHAPE_MINIMUM_CONTRAST },
  { foreground: "in-stock", background: "paper", usage: "kropka dostępny", minimum: SHAPE_MINIMUM_CONTRAST },
];

const spacingSamples = [
  { pixels: 8, widthClassName: "w-1" },
  { pixels: 16, widthClassName: "w-2" },
  { pixels: 24, widthClassName: "w-3" },
  { pixels: 32, widthClassName: "w-4" },
  { pixels: 64, widthClassName: "w-8" },
];

const sections = [
  { id: "kolory", title: "Kolory" },
  { id: "tekst", title: "Tekst" },
  { id: "odstep", title: "Odstęp" },
  { id: "kontrasty", title: "Kontrasty" },
  { id: "przyciski", title: "Przyciski" },
  { id: "motyw", title: "Motyw" },
  { id: "ruch", title: "Ruch" },
  { id: "tokeny", title: "Wszystkie tokeny" },
];

export default function PreviewPage() {
  return (
    <div className="preview">
      <nav className="preview-nav" aria-label="Spis treści">
        <strong>Wertes, podgląd wyglądu</strong>
        <ol>
          {sections.map((section, index) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>
                {index + 1}. {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <main className="preview-main">
        <h1 className="text-title">Podgląd wyglądu</h1>
        <p className="mt-1">
          Renderowany z kodu: tokeny czytane z <code>@theme</code> w <code>globals.css</code>,
          przyciski, tytuł i kropka stanu to te same komponenty, których używają strony.
        </p>
        <ColorsSection />
        <TextSection />
        <SpacingSection />
        <ContrastSection />
        <ButtonsSection />
        <MotifSection />
        <MotionSection />
        <TokensSection />
      </main>
    </div>
  );
}

function PreviewSection({
  number,
  children,
}: {
  number: number;
  children: ReactNode;
}) {
  const section = sections[number - 1];
  const headingId = `${section.id}-naglowek`;
  return (
    <section id={section.id} aria-labelledby={headingId}>
      <h2 id={headingId}>
        {number}. {section.title}
      </h2>
      {children}
    </section>
  );
}

function ColorsSection() {
  const colorTokens = themeTokens.filter((token) => token.name.startsWith("--color-"));
  return (
    <PreviewSection number={1}>
      <p>Cztery kolory i zielony tylko na kropce stanu.</p>
      <ul className="preview-specimen flex flex-wrap gap-3">
        {colorTokens.map((token) => (
          <li key={token.name}>
            <div
              className="size-12 outline-1 outline-mute"
              style={{ background: `var(${token.name})` }}
            />
            <p className="mt-1 text-small">{token.name.replace("--color-", "")}</p>
            <p className="text-small text-mute">{token.value}</p>
          </li>
        ))}
      </ul>
    </PreviewSection>
  );
}

function TextSection() {
  return (
    <PreviewSection number={2}>
      <p>Dokładnie trzy rozmiary: title 40, body 16, small 13. Montserrat 400 i 600.</p>
      <div className="preview-specimen">
        <p className="text-small">Ochrona nóg / Buty ochronne i robocze</p>
        <p className="mt-1 text-title">Buty Robocze S3</p>
        <p className="mt-1 max-w-80 text-body">
          169 modeli w&nbsp;rozmiarach 36–50, z&nbsp;podnoskiem, wkładką antyprzebiciową
          i&nbsp;wodoodporną cholewką.
        </p>
        <p className="mt-2 text-body font-semibold tabular-nums">114,58 zł netto</p>
        <p className="text-small text-mute tabular-nums">140,93 zł brutto</p>
      </div>
    </PreviewSection>
  );
}

function SpacingSection() {
  return (
    <PreviewSection number={3}>
      <p>Jednostka 8 px. Każdy odstęp to jej wielokrotność.</p>
      <ul className="preview-specimen grid gap-1">
        {spacingSamples.map((sample) => (
          <li key={sample.pixels} className="flex items-center gap-2 text-small">
            <span className="w-6">{sample.pixels} px</span>
            <span className={`h-1 bg-ink ${sample.widthClassName}`} />
          </li>
        ))}
      </ul>
    </PreviewSection>
  );
}

function ContrastSection() {
  return (
    <PreviewSection number={4}>
      <p>
        Tekst wymaga 4,5:1, kształt bez tekstu 3:1. Wartości liczone z tokenów przy każdym
        renderze.
      </p>
      <table className="preview-table">
        <thead>
          <tr>
            <th scope="col">Pierwszy plan</th>
            <th scope="col">Tło</th>
            <th scope="col">Użycie</th>
            <th scope="col">Kontrast</th>
            <th scope="col">Wynik</th>
          </tr>
        </thead>
        <tbody>
          {contrastPairs.map((pair) => (
            <ContrastRow key={`${pair.foreground}-${pair.background}`} pair={pair} />
          ))}
        </tbody>
      </table>
    </PreviewSection>
  );
}

function ContrastRow({ pair }: { pair: ContrastPair }) {
  const ratio = contrastRatio(colorValue(pair.foreground), colorValue(pair.background));
  const passes = ratio >= pair.minimum;
  return (
    <tr>
      <td>{pair.foreground}</td>
      <td>{pair.background}</td>
      <td>{pair.usage}</td>
      <td className="tabular-nums">{ratio.toFixed(1).replace(".", ",")}:1</td>
      <td>{passes ? "spełnia" : `poniżej ${pair.minimum.toString().replace(".", ",")}:1`}</td>
    </tr>
  );
}

function colorValue(colorName: string) {
  const token = themeTokens.find((candidate) => candidate.name === `--color-${colorName}`);
  if (!token) {
    throw new Error(`Missing color token --color-${colorName}`);
  }
  return token.value;
}

function ButtonsSection() {
  return (
    <PreviewSection number={5}>
      <p>
        Dokładnie dwa warianty. Najedź myszą (podkreślenie), przejdź klawiszem Tab (obrys
        fokusu). Ostatni rząd to stan wyłączony.
      </p>
      <div className="preview-specimen grid gap-2">
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" type="button">
            Dodaj do koszyka
          </Button>
          <Button variant="outline" href="#przyciski">
            Pokaż kolejne 12
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" type="button" disabled>
            Dodaj do koszyka
          </Button>
          <Button variant="outline" type="button" disabled>
            Pokaż kolejne 12
          </Button>
        </div>
      </div>
    </PreviewSection>
  );
}

function MotifSection() {
  return (
    <PreviewSection number={6}>
      <p>
        Żółta kropka z logo. Pięć miejsc: logo, koniec tytułu, aktywny filtr, licznik koszyka,
        aktywna kategoria. Obok kropki stanu magazynu.
      </p>
      <div className="preview-specimen grid gap-3">
        <Image src="/wertes-logo.svg" alt="wertes" width={132} height={26} />
        <PageTitle>Buty Robocze S3</PageTitle>
        <ul className="flex items-center gap-2 text-small font-semibold">
          <li className="flex items-center gap-1">
            <span aria-hidden="true" className="size-1 rounded-full bg-accent" />
            Rozmiar 43
          </li>
          <li>Marka</li>
          <li>Płeć</li>
          <li className="ml-3 flex items-center gap-1">
            Koszyk
            <span className="inline-flex size-3 items-center justify-center rounded-full bg-accent">
              2
            </span>
          </li>
        </ul>
        <ul className="grid gap-1 text-body">
          <li>Ochrona głowy</li>
          <li className="flex items-center gap-1 font-semibold">
            <span aria-hidden="true" className="size-1 rounded-full bg-accent" />
            Ochrona nóg
          </li>
          <li>Odzież robocza</li>
        </ul>
        <p className="flex gap-2 text-small">
          <span className="flex items-center gap-1">
            <StockDot inStock /> dostępny
          </span>
          <span className="flex items-center gap-1">
            <StockDot inStock={false} /> brak w magazynie
          </span>
        </p>
      </div>
    </PreviewSection>
  );
}

function MotionSection() {
  return (
    <PreviewSection number={7}>
      <p>
        Jedyny ruch to żółty pas „Dodaj do koszyka” na zdjęciu dostępnego produktu. Pokażę go na
        stronie kategorii, pierwszej podstronie.
      </p>
      <TokenTable tokens={themeTokens.filter(isMotionToken)} />
    </PreviewSection>
  );
}

function isMotionToken(token: ThemeToken) {
  return token.name.startsWith("--ease-") || token.name.startsWith("--duration-");
}

function TokensSection() {
  return (
    <PreviewSection number={8}>
      <p>Wszystko z bloku <code>@theme</code>, w kolejności z pliku.</p>
      <TokenTable tokens={themeTokens} />
    </PreviewSection>
  );
}

function TokenTable({ tokens }: { tokens: ThemeToken[] }) {
  return (
    <table className="preview-table">
      <tbody>
        {tokens.map((token) => (
          <tr key={token.name}>
            <th scope="row">
              <code>{token.name}</code>
            </th>
            <td>
              <code>{token.value}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
