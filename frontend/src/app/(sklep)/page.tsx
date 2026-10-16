import { listLatestArticles } from "@/lib/articles";
import {
  countProducts,
  getDepartmentProfile,
  listBestsellersInStock,
  listCategories,
} from "@/lib/store-api";
import { BrandBand } from "./home/brand-band";
import { BrandsIndex } from "./home/brands-index";
import { findBySlug, listBrands, listDepartments } from "./home/catalog";
import { Chapter } from "./home/chapter";
import { chapters } from "./home/chapters";
import { DepartmentProfiles } from "./home/department-profiles";
import { LatestArticles } from "./home/latest-articles";
import { OtherDepartments } from "./home/other-departments";
import { WholesaleBand } from "./home/wholesale-band";

const LATEST_ARTICLES = 6;
const HERO_IMAGE_CATEGORY = 2062;
const DEPARTMENT_PROFILE_IDS = [2039, 2036];

export default async function HomePage() {
  const [categories, totalProducts, articles, heroProducts, departmentProfiles] =
    await Promise.all([
      listCategories(),
      countProducts(),
      listLatestArticles(LATEST_ARTICLES),
      listBestsellersInStock(HERO_IMAGE_CATEGORY, 1),
      Promise.all(DEPARTMENT_PROFILE_IDS.map(getDepartmentProfile)),
    ]);
  const brands = listBrands(categories);
  const chapterSlugs = chapters.map((chapter) => chapter.slug);
  const otherDepartments = listDepartments(categories).filter(
    (department) => !chapterSlugs.includes(department.slug),
  );

  return (
    <main className="w-full">
      <BrandBand
        categories={categories}
        totalProducts={totalProducts}
        brandCount={brands.length}
        heroImage={heroProducts.at(0)?.images.at(0)}
      />

      <div className="mx-auto max-w-180 px-2 md:px-5">
        {chapters.map((chapter) => (
          <Chapter
            key={chapter.slug}
            title={chapter.title}
            category={findBySlug(categories, chapter.slug)}
            categories={categories}
          />
        ))}

        <OtherDepartments departments={otherDepartments} />

        <DepartmentProfiles profiles={departmentProfiles} />

        <LatestArticles articles={articles} />

        <BrandsIndex brands={brands} />
      </div>

      <WholesaleBand />
    </main>
  );
}
