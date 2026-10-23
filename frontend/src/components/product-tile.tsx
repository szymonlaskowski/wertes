import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/button";
import { priceClassName } from "@/components/price";
import { StockStatus } from "@/components/stock-dot";
import { toLocalPath } from "@/lib/catalog-paths";
import type { ProductSummary } from "@/lib/store-api";
import { wordpressUrl } from "@/lib/store-api";
import { bindSingleLetterWords } from "@/lib/typography";

export function ProductTile({ product }: { product: ProductSummary }) {
  const mainImage = product.images.at(0);
  const productPath = toLocalPath(product.permalink);

  return (
    <li className="group flex flex-col">
      <Link href={productPath} tabIndex={-1} aria-hidden className="relative block aspect-square rounded-box bg-surface">
        {mainImage && (
          <Image
            src={mainImage.src}
            alt={mainImage.alt}
            fill
            sizes="(min-width: 768px) 20vw, 50vw"
            className="object-contain p-2 mix-blend-multiply"
          />
        )}
      </Link>
      <StockStatus inStock={product.is_in_stock} />
      <Link href={productPath} className="mt-0.5 line-clamp-3 min-h-[3lh] hyphens-auto">
        <span className="link-line">{bindSingleLetterWords(product.name)}</span>
      </Link>
      {product.sku && <p className="truncate text-small text-mute">Kod {product.sku}</p>}
      <div className={`mt-1 mb-2 ${priceClassName}`} dangerouslySetInnerHTML={{ __html: product.price_html }} />
      {product.is_in_stock && (
        <p className="mt-auto">
          <CartAction product={product} productPath={productPath} />
        </p>
      )}
    </li>
  );
}

function CartAction({ product, productPath }: { product: ProductSummary; productPath: string }) {
  if (product.type === "simple") {
    return (
      <Button variant="primary" href={wordpressUrl(`/koszyk/?add-to-cart=${product.id}`)}>
        Dodaj do koszyka<span className="sr-only">: {product.name}</span>
      </Button>
    );
  }

  return (
    <Button variant="primary" href={productPath}>
      Wybierz rozmiar<span className="sr-only">: {product.name}</span>
    </Button>
  );
}
