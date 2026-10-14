const namedEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
  ndash: "\u2013",
  mdash: "\u2014",
  hellip: "\u2026",
  bdquo: "\u201e",
  ldquo: "\u201c",
  rdquo: "\u201d",
};

const entityPattern = /&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi;

export function decodeHtmlEntities(text: string) {
  return text.replace(entityPattern, (entity, code: string) => {
    const lowerCode = code.toLowerCase();
    if (lowerCode.startsWith("#x")) {
      return String.fromCodePoint(parseInt(lowerCode.slice(2), 16));
    }
    if (lowerCode.startsWith("#")) {
      return String.fromCodePoint(Number(lowerCode.slice(1)));
    }
    return namedEntities[lowerCode] ?? entity;
  });
}
