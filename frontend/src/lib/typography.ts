const SINGLE_LETTER_WORD_FOLLOWED_BY_SPACE = /(?<=^|\s)([aiouwz]) /gi;

export function bindSingleLetterWords(text: string) {
  return text.replace(SINGLE_LETTER_WORD_FOLLOWED_BY_SPACE, "$1\u00a0");
}
