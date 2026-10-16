import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTitle } from "@/components/page-title";
import { ProductTile } from "@/components/product-tile";
import { searchProducts } from "@/lib/store-api";

const MAX_QUERY_LENGTH = 100;

export const metadata: Metadata = { title: "Szukaj" };

export default function SearchPage(props: PageProps<"/szukaj">) {
  return (
    <main className="mx-auto w-full max-w-180 px-2 pt-4 md:px-5">
      <Suspense fallback={<PageTitle>Szukam</PageTitle>}>
        <SearchResults searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function SearchResults({ searchParams }: Pick<PageProps<"/szukaj">, "searchParams">) {
  const { q } = await searchParams;
  const query = readQuery(q);

  if (!query) {
    return <PageTitle>Wpisz nazwę albo kod produktu</PageTitle>;
  }

  const { products, total } = await searchProducts(query);

  return (
    <>
      <PageTitle>„{query}”</PageTitle>
      <p className="mt-1 text-mute">{resultCountLabel(total, products.length)}</p>
      <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4 lg:grid-cols-6">
        {products.map((product) => (
          <ProductTile key={product.id} product={product} />
        ))}
      </ul>
    </>
  );
}

function readQuery(value: string | string[] | undefined) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, MAX_QUERY_LENGTH);
}

function resultCountLabel(total: number, shown: number) {
  if (total === 0) {
    return "Nic nie znaleziono. Spróbuj krótszej nazwy albo samego kodu.";
  }
  if (total > shown) {
    return `Pierwsze ${shown} z ${total} wyników.`;
  }
  return `Wyniki: ${total}.`;
}
