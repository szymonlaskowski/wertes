import Image from "next/image";
import Link from "next/link";
import { StockDot } from "@/components/stock-dot";
import { toLocalPath } from "@/lib/catalog-paths";
import type { ProductSummary } from "@/lib/store-api";
import { wordpressUrl } from "@/lib/store-api";

const priceClassName =
  "mt-1 tabular-nums [&_.amount]:block [&_.amount]:text-small [&_.amount]:text-mute [&_.amount--netto]:text-body [&_.amount--netto]:font-semibold [&_.amount--netto]:text-ink [&_br]:hidden [&_small]:[font-size:inherit]";

const revealClassName =
  "absolute inset-x-0 bottom-0 bg-accent p-1 text-center text-small font-semibold text-ink hover:bg-ink hover:text-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink mouse:translate-y-[calc(100%+1px)] mouse:transition-transform mouse:duration-(--duration-hide) mouse:ease-out mouse:group-hover:translate-y-0 mouse:group-hover:duration-(--duration-reveal) mouse:group-focus-within:translate-y-0 motion-reduce:transition-none";

export function ProductTile({ product }: { product: ProductSummary }) {
  const mainImage = product.images.at(0);
  const productPath = toLocalPath(product.permalink);

  return (
    <li className="group">
      <div className="relative aspect-square overflow-hidden bg-paper">
        <Link href={productPath} tabIndex={-1} aria-hidden className="relative block size-full">
          {mainImage && (
            <Image
              src={mainImage.src}
              alt={mainImage.alt}
              fill
              sizes="(min-width: 768px) 20vw, 50vw"
              className="object-contain"
            />
          )}
        </Link>
        <span className="absolute top-1 left-1 flex">
          <StockDot inStock={product.is_in_stock} />
        </span>
        {product.is_in_stock && <CartAction product={product} productPath={productPath} />}
      </div>
      <Link href={productPath} className="mt-1 line-clamp-3 min-h-[3lh]">
        <span className="link-line">{product.name}</span>
      </Link>
      <div className={priceClassName} dangerouslySetInnerHTML={{ __html: product.price_html }} />
    </li>
  );
}

function CartAction({ product, productPath }: { product: ProductSummary; productPath: string }) {
  if (product.type === "simple") {
    return (
      <a href={wordpressUrl(`/koszyk/?add-to-cart=${product.id}`)} className={revealClassName}>
        Dodaj do koszyka<span className="sr-only">: {product.name}</span>
      </a>
    );
  }

  return (
    <Link href={productPath} className={revealClassName}>
      Wybierz rozmiar<span className="sr-only">: {product.name}</span>
    </Link>
  );
}
