import { decodeHtmlEntities } from "@/lib/html-entities";
import type { Category } from "@/lib/store-api";

const CATALOG_ROOT_SLUG = "artykuly-bhp";
const BRANDS_SLUG = "producenci";
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

export function formatCount(count: number) {
  return polishNumber.format(count);
}

export function productCountLabel(count: number) {
  const noun = productNouns[polishPlural.select(count)];
  return `${formatCount(count)} ${noun}`;
}

export function firstParagraph(descriptionHtml: string) {
  const paragraph = descriptionHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  if (!paragraph) {
    return "";
  }
  return decodeHtmlEntities(paragraph[1].replace(/<[^>]*>/g, "").trim());
}
