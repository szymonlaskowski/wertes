import { expect, test } from "bun:test";
import { contrastRatio, readThemeTokens } from "./theme-tokens";

test("reads only the tokens of the @theme block", () => {
  const css = `@theme inline {\n  --font-sans: x;\n}\n\n@theme {\n  --color-ink: #313131;\n\n  --text-title--line-height: 1.05;\n}\n\nbody { color: red; }`;
  expect(readThemeTokens(css)).toEqual([
    { name: "--color-ink", value: "#313131" },
    { name: "--text-title--line-height", value: "1.05" },
  ]);
});

test("computes WCAG contrast ratios", () => {
  expect(contrastRatio("#000000", "#ffffff")).toBe(21);
  expect(contrastRatio("#fece00", "#ffffff")).toBeCloseTo(1.5, 1);
  expect(contrastRatio("#313131", "#ffffff")).toBeCloseTo(13.0, 1);
});
