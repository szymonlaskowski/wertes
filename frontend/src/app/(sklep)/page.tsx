import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/button";
import { ProductTile } from "@/components/product-tile";
import { toLocalPath } from "@/lib/catalog-paths";
import type { Article } from "@/lib/articles";
import { listLatestArticles } from "@/lib/articles";
import { LogoDot } from "@/components/logo-dot";
import { company } from "@/lib/company";
import {
  countProducts,
  getDepartmentProfile,
  listBestsellersInStock,
  listCategories,
} from "@/lib/store-api";
import type { Category, DepartmentProfile, ProductSummary } from "@/lib/store-api";
import {
  childrenOf,
  findBySlug,
  firstParagraph,
  formatCount,
  listBrands,
  listDepartments,
  productCountLabel,
} from "./home-catalog";

const chapters = [
  { title: "Rękawice", slug: "ochrona-rak" },
  { title: "Obuwie", slug: "ochrona-nog" },
  { title: "Odzież", slug: "ochrona-ciala" },
  { title: "Głowa", slug: "ochrona-glowy" },
  { title: "Przemysł", slug: "przemysl" },
];
const LATEST_ARTICLES = 6;
const HERO_IMAGE_CATEGORY = 2062;
const DEPARTMENT_PROFILE_IDS = [2039, 2036];
const articleDate = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });
const PRODUCTS_PER_CHAPTER = 4;
const SUBCATEGORIES_PER_CHAPTER = 7;

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

        <section aria-labelledby="pozostale-dzialy" className="mt-8">
          <h2 id="pozostale-dzialy" className="font-semibold">
            Pozostałe działy
          </h2>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {otherDepartments.map((department) => (
              <li key={department.id}>
                <Link href={toLocalPath(department.permalink)} className="link-line">
                  <span className="font-semibold">{department.name}</span>{" "}
                  <span className="text-small text-mute">{formatCount(department.count)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <DepartmentProfiles profiles={departmentProfiles} />

        <LatestArticles articles={articles} />

        <section aria-labelledby="producenci" className="mt-8">
          <h2 id="producenci" className="font-semibold">
            Producenci <span className="text-small font-normal text-mute">{brands.length}</span>
          </h2>
          <ul className="mt-2 columns-2 gap-x-4 text-small sm:columns-3 lg:columns-6 [&_li]:break-inside-avoid">
            {brands.map((brand) => (
              <li key={brand.id}>
                <CountedLink category={brand} />
              </li>
            ))}
          </ul>
        </section>

      </div>

      <WholesaleBand />
    </main>
  );
}

function WholesaleBand() {
  return (
    <section aria-labelledby="hurt" className="mt-12 bg-ink text-paper">
      <div className="mx-auto max-w-180 px-2 py-8 md:px-5">
        <p className="text-small font-semibold tracking-[0.08em] text-accent uppercase">
          Dla firm
        </p>
        <h2 id="hurt" className="mt-1 text-title lowercase">
          Ubierzemy całą załogę
          <LogoDot />
        </h2>
        <div className="mt-5 grid max-w-140 gap-4 md:grid-cols-3">
          <p>
            <b className="block font-semibold">Faktura VAT</b>
            na firmę, do każdego zamówienia.
          </p>
          <p>
            <b className="block font-semibold">Darmowa dostawa</b>
            od {company.freeShippingFrom}.
          </p>
          <p>
            <b className="block font-semibold">
              <a href={company.phoneHref} className="whitespace-nowrap link-line">
                {company.phone}
              </a>
            </b>
            odbiera osoba, która zna magazyn, albo napisz:{" "}
            <a href={company.emailHref} className="link-line">
              {company.email}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

function DepartmentProfiles({ profiles }: { profiles: DepartmentProfile[] }) {
  return (
    <section aria-labelledby="nasze-dzialy" className="mt-10">
      <h2 id="nasze-dzialy" className="text-title lowercase">
        Nasze działy
        <LogoDot />
      </h2>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        {profiles.map((profile) => (
          <Link
            key={profile.id}
            href={toLocalPath(profile.permalink)}
            className="block"
          >
            {profile.image && (
              <span className="relative block aspect-[8/3] overflow-hidden">
                <Image
                  src={profile.image.src}
                  alt={profile.image.alt}
                  fill
                  sizes="(min-width: 768px) 45vw, 90vw"
                  className="object-cover"
                />
              </span>
            )}
            <span className="mt-2 flex items-baseline justify-between gap-2">
              <span className="font-semibold link-line">{profile.name}</span>
              <span className="text-small text-mute tabular-nums">
                {productCountLabel(profile.count)}
              </span>
            </span>
            <span className="mt-1 block text-small text-mute">
              {firstParagraph(profile.description)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BrandBand({
  categories,
  totalProducts,
  brandCount,
  heroImage,
}: {
  categories: Category[];
  totalProducts: number;
  brandCount: number;
  heroImage: ProductSummary["images"][number] | undefined;
}) {
  return (
    <section className="relative overflow-hidden bg-accent">
      <div className="mx-auto max-w-180 px-2 pt-7 pb-7 md:px-5">
        <h1 className="relative z-1 text-title lowercase lg:text-display">
          wszystko do&nbsp;bhp
          <LogoDot color="ink" />
        </h1>
        {heroImage && (
          <Image
            src={heroImage.src}
            alt=""
            width={560}
            height={560}
            priority
            className="absolute -top-10 -right-12 hidden rotate-12 mix-blend-multiply lg:block"
          />
        )}
        <p className="relative z-1 mt-4">
          {productCountLabel(totalProducts)} od {brandCount} producentów. Darmowa dostawa
          od&nbsp;{company.freeShippingFrom}.
        </p>
        <form action="/szukaj/" role="search" className="relative z-1 mt-5 flex max-w-95 border-2 border-ink bg-paper">
          <label htmlFor="szukaj-pas" className="sr-only">
            Szukaj produktu po nazwie albo kodzie
          </label>
          <input
            id="szukaj-pas"
            name="q"
            type="search"
            required
            maxLength={100}
            placeholder="Nazwa albo kod produktu"
            className="min-w-0 flex-1 px-3 py-2 text-body placeholder:text-mute focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink"
          />
          <button
            type="submit"
            className="bg-ink px-4 font-semibold text-paper transition-colors duration-(--duration-reveal) ease-(--ease-out) hover:text-accent focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
          >
            Szukaj
          </button>
        </form>
        <ul className="relative z-1 mt-3 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
          {chapters.map((chapter) => {
            const category = findBySlug(categories, chapter.slug);
            return (
              <li key={chapter.slug}>
                <Link href={toLocalPath(category.permalink)} className="link-line">
                  {chapter.title} {formatCount(category.count)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

async function Chapter({
  title,
  category,
  categories,
}: {
  title: string;
  category: Category;
  categories: Category[];
}) {
  const products = await listBestsellersInStock(category.id, PRODUCTS_PER_CHAPTER);
  const subcategories = childrenOf(categories, category).slice(0, SUBCATEGORIES_PER_CHAPTER);
  const headingId = `rozdzial-${category.slug}`;

  return (
    <section aria-labelledby={headingId} className="mt-10 grid gap-5 md:grid-cols-[340px_1fr]">
      <div>
        <h2 id={headingId} className="text-title lowercase">
          {title}
          <LogoDot />
        </h2>
        <p className="mt-1 text-mute">{productCountLabel(category.count)}</p>
        <ul className="my-3">
          {subcategories.map((subcategory) => (
            <li key={subcategory.id}>
              <CountedLink category={subcategory} />
            </li>
          ))}
        </ul>
        <Button variant="outline" href={toLocalPath(category.permalink)}>
          Cały dział
        </Button>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4">
        {products.map((product) => (
          <ProductTile key={product.id} product={product} />
        ))}
      </ul>
    </section>
  );
}

function CountedLink({ category }: { category: Category }) {
  return (
    <Link
      href={toLocalPath(category.permalink)}
      className="group/row relative flex justify-between gap-1 link-line"
    >
      <span
        aria-hidden="true"
        className="absolute top-1/2 -left-1.5 size-1 -translate-y-1/2 scale-0 rounded-full bg-accent transition-transform duration-(--duration-hide) ease-(--ease-out) group-hover/row:scale-100 group-hover/row:duration-(--duration-reveal) group-focus-visible/row:scale-100 motion-reduce:transition-none"
      />
      <span>{category.name}</span>
      <span className="text-mute tabular-nums">{formatCount(category.count)}</span>
    </Link>
  );
}

function LatestArticles({ articles }: { articles: Article[] }) {
  return (
    <section aria-labelledby="artykuly" className="mt-10 grid gap-5 md:grid-cols-[340px_1fr]">
      <div>
        <h2 id="artykuly" className="text-title lowercase">
          Artykuły
          <LogoDot />
        </h2>
        <p className="mt-1 text-mute">Jak dobrać rękawice, okulary i&nbsp;odzież do&nbsp;pracy.</p>
      </div>
      <ol className="grid gap-2 md:grid-cols-2 md:gap-x-5">
        {articles.map((article) => (
          <li key={article.link}>
            <a href={article.link} className="block">
              <time dateTime={article.date} className="block text-small text-mute tabular-nums">
                {articleDate.format(new Date(article.date))}
              </time>
              <span className="link-line">{article.title.rendered}</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
