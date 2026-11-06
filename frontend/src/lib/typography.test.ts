import { expect, test } from "bun:test";
import { bindSingleLetterWords } from "./typography";

test("single-letter Polish words stay on the line with the next word", () => {
  expect(bindSingleLetterWords("Rękawice ochronne z mikronakropieniem")).toBe("Rękawice ochronne z\u00a0mikronakropieniem");
  expect(bindSingleLetterWords("Buty i w zimie")).toBe("Buty i\u00a0w\u00a0zimie");
  expect(bindSingleLetterWords("W pracy kod XKS5008 Z")).toBe("W\u00a0pracy kod XKS5008 Z");
});
