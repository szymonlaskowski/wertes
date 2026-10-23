import { listLatestArticles } from "@/lib/articles";
import { BRANDS_SLUG, findBySlug, listBrands, listDepartments } from "@/lib/catalog";
import { type Category, countProducts, listBestsellersInStock, listCategories } from "@/lib/store-api";
import { BrandsIndex } from "./home/brands-index";
import { Hero } from "./home/hero";
import { LatestArticles } from "./home/latest-articles";
import { MostChosen, OwnBrand } from "./home/product-sections";
import { WholesaleBand } from "./home/wholesale-band";
import { WorkerDepartments, zones } from "./home/worker-departments";

const LATEST_ARTICLES = 4;
const OWN_BRAND_PRODUCTS = 3;
const OWN_BRAND_SLUG = "wertes-safe";
const FOOTWEAR_SLUG = "buty-ochronne-i-robocze";

export default async function HomePage() {
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

  return (
    <main className="w-full">
      <Hero
        totalProducts={totalProducts}
        brandCount={brands.length}
        footwear={findBySlug(categories, FOOTWEAR_SLUG)}
        ownBrandProduct={ownBrandProducts.at(0)}
      />
      <WorkerDepartments categories={categories} others={listOtherDepartments(categories, zoneCategories)} />
      <MostChosen products={mostChosen} />
      <OwnBrand brand={ownBrand} products={ownBrandProducts} />
      <LatestArticles articles={articles} />
      <WholesaleBand />
      <BrandsIndex brands={brands} allBrands={findBySlug(categories, BRANDS_SLUG)} />
    </main>
  );
}

async function listTopProductOfEach(departments: Category[]) {
  const topProducts = await Promise.all(departments.map((department) => listBestsellersInStock(department.id, 1)));
  return topProducts.flat();
}

function listOtherDepartments(categories: Category[], zoneCategories: Category[]) {
  return listDepartments(categories).filter(
    (department) => department.count > 0 && !zoneCategories.includes(department),
  );
}
