import { decodeHtmlEntities } from "@/lib/html-entities";
import { toLocalPath } from "@/lib/catalog-paths";
import type { SuggestedCategory } from "@/lib/search-suggestions";
import type { Category, SearchCategoryCount } from "@/lib/store-api";

export const CATALOG_ROOT_SLUG = "artykuly-bhp";
export const BRANDS_SLUG = "producenci";
const STANDALONE_DEPARTMENT_SLUGS = ["przemysl"];

const productNouns: Record<string, string> = {
  one: "produkt",
  few: "produkty",
  many: "produktów",
  other: "produktu",
};
const polishPlural = new Intl.PluralRules("pl-PL");
const polishNumber = new Intl.NumberFormat("pl-PL");

export function childrenOf(categories: Category[], parent: Category) {
  const children = categories.filter((candidate) => candidate.parent === parent.id);
  children.sort((first, second) => second.count - first.count);
  return children;
}

export function findBySlug(categories: Category[], slug: string) {
  const category = categories.find((candidate) => candidate.slug === slug);
  if (!category) {
    throw new Error(`Category ${slug} is missing in the Store API`);
  }
  return category;
}

function findById(categories: Category[], id: number) {
  const category = categories.find((candidate) => candidate.id === id);
  if (!category) {
    throw new Error(`Category ${id} is missing in the Store API`);
  }
  return category;
}

export function findProductShelf(categories: Category[], productCategoryIds: number[]) {
  const brandsParent = findBySlug(categories, BRANDS_SLUG);
  let shelf: Category | undefined;
  for (const id of productCategoryIds) {
    const candidate = findById(categories, id);
    const isBrand = candidate.parent === brandsParent.id;
    if (isBrand) {
      continue;
    }
    if (!shelf || candidate.count < shelf.count) {
      shelf = candidate;
    }
  }
  return shelf;
}

export function categoryTrail(categories: Category[], category: Category) {
  const trail = [category];
  let current = category;
  while (current.parent !== 0) {
    current = findById(categories, current.parent);
    trail.unshift(current);
  }
  return trail;
}

export function listDepartments(categories: Category[]) {
  const catalogRoot = findBySlug(categories, CATALOG_ROOT_SLUG);
  const departments: Category[] = [];
  for (const group of childrenOf(categories, catalogRoot)) {
    if (group.slug === BRANDS_SLUG) {
      continue;
    }
    departments.push(...childrenOf(categories, group));
  }
  for (const slug of STANDALONE_DEPARTMENT_SLUGS) {
    departments.push(findBySlug(categories, slug));
  }
  return departments;
}

export function listBrands(categories: Category[]) {
  const brandsParent = findBySlug(categories, BRANDS_SLUG);
  const brands = childrenOf(categories, brandsParent).filter((brand) => brand.count > 0);
  brands.sort((first, second) => first.name.localeCompare(second.name, "pl"));
  return brands;
}

export type CountedCategory = { category: Category; count: number };

function isShelfTrail(trail: Category[], brandsParent: Category) {
  const shelfRootSlugs = [CATALOG_ROOT_SLUG, ...STANDALONE_DEPARTMENT_SLUGS];
  const isUnderShelfRoot = shelfRootSlugs.includes(trail[0].slug);
  const isUnderBrands = trail.includes(brandsParent);
  return isUnderShelfRoot && !isUnderBrands;
}

export function splitSearchCounts(categories: Category[], counts: SearchCategoryCount[]) {
  const brandsParent = findBySlug(categories, BRANDS_SLUG);
  const shelves: CountedCategory[] = [];
  const brands: CountedCategory[] = [];

  for (const { term, count } of counts) {
    const category = findById(categories, term);
    if (category.parent === brandsParent.id) {
      brands.push({ category, count });
      continue;
    }
    const trail = categoryTrail(categories, category);
    const isLeaf = !categories.some((candidate) => candidate.parent === category.id);
    if (isShelfTrail(trail, brandsParent) && isLeaf) {
      shelves.push({ category, count });
    }
  }

  shelves.sort((first, second) => second.count - first.count);
  brands.sort((first, second) => second.count - first.count);
  return { shelves, brands };
}

export function listSuggestibleCategories(categories: Category[]) {
  const brandsParent = findBySlug(categories, BRANDS_SLUG);
  const suggestible: SuggestedCategory[] = [];

  for (const category of categories) {
    if (category.count === 0) {
      continue;
    }
    const trail = categoryTrail(categories, category);
    if (!isShelfTrail(trail, brandsParent)) {
      continue;
    }
    const parent = trail.at(-2);
    suggestible.push({
      id: category.id,
      name: category.name,
      count: category.count,
      path: toLocalPath(category.permalink),
      parentName: parent?.name,
    });
  }

  return suggestible;
}

export function formatCount(count: number) {
  return polishNumber.format(count);
}

export function productCountLabel(count: number) {
  const noun = productNouns[polishPlural.select(count)];
  return `${formatCount(count)} ${noun}`;
}

const READABLE_TAGS = ["p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "br"];
const BLOCK_TAG_PATTERN = /<(p|h2|h3|h4|ul|ol)>/;
const BLANK_LINE_PATTERN = /\r?\n\s*\r?\n/;

export function splitCategoryDescription(descriptionHtml: string) {
  const readableHtml = keepReadableTags(descriptionHtml);
  const paragraphHtml = BLOCK_TAG_PATTERN.test(readableHtml) ? readableHtml : wrapParagraphs(readableHtml);
  const firstParagraph = paragraphHtml.match(/<p>([\s\S]*?)<\/p>/);
  if (!firstParagraph) {
    return { intro: "", restHtml: paragraphHtml.trim() };
  }

  const introText = firstParagraph[1].replace(/<[^>]*>/g, "");
  return {
    intro: decodeHtmlEntities(introText).trim(),
    restHtml: paragraphHtml.replace(firstParagraph[0], "").trim(),
  };
}

function keepReadableTags(html: string) {
  return html.replace(/<(\/?)([a-z0-9]+)[^>]*>/gi, (_tag, closingSlash: string, tagName: string) => {
    const name = tagName.toLowerCase();
    if (!READABLE_TAGS.includes(name)) {
      return "";
    }
    return `<${closingSlash}${name}>`;
  });
}

function wrapParagraphs(text: string) {
  const blocks = text.split(BLANK_LINE_PATTERN).map((block) => block.trim());
  const nonEmptyBlocks = blocks.filter((block) => block.length > 0);
  return nonEmptyBlocks.map((block) => `<p>${block}</p>`).join("\n");
}
