import Image from "next/image";
import Link from "next/link";
import { LogoDot } from "@/components/logo-dot";
import { toLocalPath } from "@/lib/catalog-paths";
import { company } from "@/lib/company";
import type { Category, ProductSummary } from "@/lib/store-api";
import { findBySlug, formatCount, productCountLabel } from "./catalog";
import { chapters } from "./chapters";

export function BrandBand({
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
        {heroImage && <HeroImage image={heroImage} />}
        <p className="relative z-1 mt-4">
          {productCountLabel(totalProducts)} od {brandCount} producentów. Darmowa dostawa
          od&nbsp;{company.freeShippingFrom}.
        </p>
        <SearchForm />
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

function HeroImage({ image }: { image: ProductSummary["images"][number] }) {
  return (
    <Image
      src={image.src}
      alt=""
      width={560}
      height={560}
      priority
      className="absolute -top-10 -right-12 hidden rotate-12 mix-blend-multiply lg:block"
    />
  );
}

function SearchForm() {
  return (
    <form
      action="/szukaj/"
      role="search"
      className="relative z-1 mt-5 flex max-w-95 border-2 border-ink bg-paper"
    >
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
  );
}
