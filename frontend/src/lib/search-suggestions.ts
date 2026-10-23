export const MAX_QUERY_LENGTH = 100;
export const MIN_SUGGESTION_QUERY_LENGTH = 2;
const MAX_CATEGORY_SUGGESTIONS = 4;

export type SuggestedCategory = {
  id: number;
  name: string;
  count: number;
  path: string;
  parentName: string | undefined;
};

export function foldPolish(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "").replaceAll("ł", "l");
}

export function matchCategories(categories: SuggestedCategory[], query: string) {
  const foldedQuery = foldPolish(query.trim());
  const matches = categories.filter((category) => foldPolish(category.name).includes(foldedQuery));
  matches.sort((first, second) => second.count - first.count);
  return matches.slice(0, MAX_CATEGORY_SUGGESTIONS);
}

export function splitAtMatch(text: string, query: string) {
  const foldedText = foldPolish(text);
  const foldedQuery = foldPolish(query.trim());
  const foldingKeptPositions = foldedText.length === text.length;
  const start = foldedText.indexOf(foldedQuery);
  if (!foldingKeptPositions || foldedQuery === "" || start === -1) {
    return undefined;
  }
  const end = start + foldedQuery.length;
  return { before: text.slice(0, start), match: text.slice(start, end), after: text.slice(end) };
}
