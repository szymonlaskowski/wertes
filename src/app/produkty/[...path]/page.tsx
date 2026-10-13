import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  categoryPagePath,
  parseCategorySegments,
  routeSegments,
  toLocalPath,
} from "@/lib/catalog-paths";
import { listCategories, listProductsInCategory } from "@/lib/store-api";
import type { ProductSummary } from "@/lib/store-api";

export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const categories = await listCategories();
  const topLevelCategories = categories.filter((category) => category.parent === 0);
  return topLevelCategories.map((category) => ({ path: routeSegments(category.permalink) }));
}

export async function generateMetadata(props: PageProps<"/produkty/[...path]">): Promise<Metadata> {
  const { path } = await props.params;
  const { category } = await loadCategoryPage(path);
  return { title: category.name };
}

export default async function CategoryPage(props: PageProps<"/produkty/[...path]">) {
  const { path } = await props.params;
  const { category, subcategories, products, page, totalPages } = await loadCategoryPage(path);
  const categoryPath = toLocalPath(category.permalink);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/" className="text-sm">
        Wszystkie kategorie
      </Link>
      <h1 className="mt-2 mb-4 text-2xl font-semibold">
        {category.name} ({category.count})
      </h1>

      <ul className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {subcategories.map((subcategory) => (
          <li key={subcategory.id}>
            <Link href={toLocalPath(subcategory.permalink)}>{subcategory.name}</Link>
          </li>
        ))}
      </ul>

      <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>

      <nav className="mt-8 flex gap-4 text-sm">
        {page > 1 && <Link href={categoryPagePath(categoryPath, page - 1)}>Poprzednia</Link>}
        <span>
          Strona {page} z {totalPages}
        </span>
        {page < totalPages && <Link href={categoryPagePath(categoryPath, page + 1)}>Następna</Link>}
      </nav>
    </main>
  );
}

async function loadCategoryPage(path: string[]) {
  const location = parseCategorySegments(path);
  if (!location) {
    notFound();
  }

  const categories = await listCategories();
  const slug = location.categorySegments.at(-1);
  const category = categories.find((candidate) => candidate.slug === slug);
  if (!category) {
    notFound();
  }

  const canonicalPath = categoryPagePath(toLocalPath(category.permalink), location.page);
  const requestedPath = categoryPagePath(
    `/produkty/${location.categorySegments.join("/")}/`,
    location.page,
  );
  if (requestedPath !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }

  const { products, totalPages } = await listProductsInCategory(category.id, location.page);
  const isPastLastPage = location.page > 1 && location.page > totalPages;
  if (isPastLastPage) {
    notFound();
  }

  const subcategories = categories.filter((candidate) => candidate.parent === category.id);
  return { category, subcategories, products, page: location.page, totalPages };
}

function ProductCard({ product }: { product: ProductSummary }) {
  const mainImage = product.images.at(0);

  return (
    <li className="text-sm">
      <Link href={toLocalPath(product.permalink)}>
        {mainImage && (
          <div className="relative aspect-square">
            <Image
              src={mainImage.src}
              alt={mainImage.alt}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-contain"
            />
          </div>
        )}
        <span className="mt-2 block">{product.name}</span>
      </Link>
      <div dangerouslySetInnerHTML={{ __html: product.price_html }} />
    </li>
  );
}
