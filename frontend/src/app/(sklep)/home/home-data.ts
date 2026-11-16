import { listLatestArticles } from "@/lib/articles";
import { BRANDS_SLUG, findBySlug, listBrands, listDepartments } from "@/lib/catalog";
import { type Category, countProducts, listBestsellersInStock, listCategories } from "@/lib/store-api";
import { zones } from "./worker-departments";

const LATEST_ARTICLES = 4;
const OWN_BRAND_PRODUCTS = 3;
const OWN_BRAND_SLUG = "wertes-safe";
const FOOTWEAR_SLUG = "buty-ochronne-i-robocze";

export async function loadHomeData() {
  const categories = await listCategories();
  const zoneCategories = zones.map((zone) => findBySlug(categories, zone.slug));
  const ownBrand = findBySlug(categories, OWN_BRAND_SLUG);
  const brands = listBrands(categories);

  const [totalProducts, articles, ownBrandProducts, mostChosen] = await Promise.all([
    countProducts(),
    listLatestArticles(LATEST_ARTICLES),
    listBestsellersInStock(ownBrand.id, OWN_BRAND_PRODUCTS),
    listTopProductOfEach(zoneCategories),
  ]);

  return {
    categories,
    zoneCategories,
    ownBrand,
    brands,
    allBrands: findBySlug(categories, BRANDS_SLUG),
    footwear: findBySlug(categories, FOOTWEAR_SLUG),
    otherDepartments: listOtherDepartments(categories, zoneCategories),
    totalProducts,
    articles,
    ownBrandProducts,
    mostChosen,
  };
}

export type HomeData = Awaited<ReturnType<typeof loadHomeData>>;

async function listTopProductOfEach(departments: Category[]) {
  const topProducts = await Promise.all(departments.map((department) => listBestsellersInStock(department.id, 1)));
  return topProducts.flat();
}

function listOtherDepartments(categories: Category[], zoneCategories: Category[]) {
  const others = listDepartments(categories).filter(
    (department) => department.count > 0 && !zoneCategories.includes(department),
  );
  return others.sort((first, second) => second.count - first.count);
}
