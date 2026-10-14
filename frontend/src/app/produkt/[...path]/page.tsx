import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { routeSegments, toLocalPath } from "@/lib/catalog-paths";
import { findAnyProductPermalink, findProductBySlug } from "@/lib/store-api";

export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const permalink = await findAnyProductPermalink();
  return [{ path: routeSegments(permalink) }];
}

export async function generateMetadata(props: PageProps<"/produkt/[...path]">): Promise<Metadata> {
  const { path } = await props.params;
  const product = await loadProduct(path);
  return { title: product.name };
}

export default async function ProductPage(props: PageProps<"/produkt/[...path]">) {
  const { path } = await props.params;
  const product = await loadProduct(path);
  const mainImage = product.images.at(0);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <ul className="flex flex-wrap gap-x-4 text-sm">
        {product.categories.map((category) => (
          <li key={category.link}>
            <Link href={toLocalPath(category.link)}>{category.name}</Link>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        {mainImage && (
          <div className="relative aspect-square">
            <Image
              src={mainImage.src}
              alt={mainImage.alt}
              fill
              preload
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain"
            />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-2 text-sm">SKU: {product.sku}</p>
          <div className="mt-4" dangerouslySetInnerHTML={{ __html: product.price_html }} />
          <p className="mt-2 text-sm">{product.is_in_stock ? "Na stanie" : "Brak"}</p>

          <table className="mt-6 text-sm">
            <tbody>
              {product.attributes.map((attribute) => (
                <tr key={attribute.name}>
                  <th className="pr-4 text-left font-medium">{attribute.name}</th>
                  <td>{attribute.terms.map((term) => term.name).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="mt-8 max-w-prose text-sm"
        dangerouslySetInnerHTML={{ __html: product.description }}
      />
    </main>
  );
}

async function loadProduct(path: string[]) {
  const slug = path.at(-1);
  if (!slug) {
    notFound();
  }

  const product = await findProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const canonicalPath = toLocalPath(product.permalink);
  const requestedPath = `/produkt/${path.join("/")}/`;
  if (requestedPath !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }
  return product;
}
