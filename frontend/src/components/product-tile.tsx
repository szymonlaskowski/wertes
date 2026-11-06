import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { QuickAddButton } from "@/components/cart/quick-add-button";
import { priceClassName } from "@/components/price";
import { productImageTransitionName } from "@/components/product-image-transition";
import { StockStatus } from "@/components/stock-dot";
import { toLocalPath } from "@/lib/catalog-paths";
import type { ProductSummary } from "@/lib/store-api";
import { wordpressUrl } from "@/lib/store-api";
import { bindSingleLetterWords } from "@/lib/typography";

const quickAddRevealClassName =
  "absolute right-1 bottom-1 grid transition-[opacity,translate] duration-(--duration-reveal) ease-(--ease-out) mouse:left-1 mouse:translate-y-0.5 mouse:opacity-0 mouse:group-hover:translate-y-0 mouse:group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 motion-reduce:transition-none";

export function ProductTile({ product }: { product: ProductSummary }) {
  const mainImage = product.images.at(0);
  const productPath = toLocalPath(product.permalink);
  const canAddFromTile = product.is_in_stock && product.type === "simple";

  return (
    <li className="group flex flex-col">
      <div className="relative">
        <ViewTransition name={productImageTransitionName(product.id)} share="product-image" default="none">
          <Link href={productPath} tabIndex={-1} aria-hidden className="relative block aspect-square overflow-hidden bg-surface">
            {mainImage && (
              <Image
                src={mainImage.src}
                alt={mainImage.alt}
                fill
                sizes="(min-width: 768px) 20vw, 50vw"
                className="zoom-on-hover object-contain p-2 mix-blend-multiply"
              />
            )}
          </Link>
        </ViewTransition>
        {canAddFromTile && (
          <div className={quickAddRevealClassName}>
            <QuickAddButton productId={product.id} productName={product.name} cartUrl={wordpressUrl("/koszyk/")} />
          </div>
        )}
      </div>
      <div className="mt-1 flex min-w-0 items-center gap-1 text-small text-mute">
        <StockStatus inStock={product.is_in_stock} />
        {product.sku && (
          <>
            <span aria-hidden="true">·</span>
            <span className="truncate">Kod {product.sku}</span>
          </>
        )}
      </div>
      <Link href={productPath} className="mt-0.5 line-clamp-3 text-pretty">
        {bindSingleLetterWords(product.name)}
      </Link>
      <div className={`mt-auto pt-1 ${priceClassName}`} dangerouslySetInnerHTML={{ __html: product.price_html }} />
    </li>
  );
}
