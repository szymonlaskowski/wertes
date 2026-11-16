import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/button";
import { productCountLabel } from "@/lib/catalog";
import { toLocalPath } from "@/lib/catalog-paths";
import { company } from "@/lib/company";
import { type Category, type ProductSummary, wordpressUrl } from "@/lib/store-api";

const BANNER_PHOTO = "/wp-content/uploads/2022/02/25-scaled.jpg";
const FOOTWEAR_PHOTO = "/wp-content/uploads/2022/02/11-scaled.jpg";

export function Hero({
  totalProducts,
  brandCount,
  footwear,
  ownBrandProduct,
}: {
  totalProducts: number;
  brandCount: number;
  footwear: Category;
  ownBrandProduct: ProductSummary | undefined;
}) {
  return (
    <section aria-labelledby="od-stop-do-glow" className="max-md:-order-2">
      <div className="relative flex min-h-80 items-end">
        <Image
          src={wordpressUrl(BANNER_PHOTO)}
          alt="Pracownik w pomarańczowym kasku niesie rurę na budowie"
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
        <div className="page-width relative grid gap-x-3 lg:grid-cols-4">
          <div className="chamfer-tile bg-ink p-3 text-paper md:chamfer-panel md:p-5 lg:col-span-2">
            <h1 id="od-stop-do-glow" className="text-title md:text-display">
              Od&nbsp;stóp do&nbsp;głów.
            </h1>
            <p className="mt-2">
              {productCountLabel(totalProducts)} od {brandCount} producentów dla ciebie i&nbsp;twojej firmy, z&nbsp;darmową
              dostawą od&nbsp;{company.freeShippingFrom}.
            </p>
            <p className="mt-3">
              <Button variant="accent" onInk href="#dzialy">
                Wybierz dział
              </Button>
            </p>
          </div>
        </div>
      </div>
      <div aria-hidden className="hazard-tape h-1" />
      <div className="page-width">
        <div className="mt-3 grid gap-3 max-md:hidden md:grid-cols-2">
          <FootwearTile footwear={footwear} />
          <OwnBrandTile product={ownBrandProduct} />
        </div>
        <Perks />
      </div>
    </section>
  );
}

function FootwearTile({ footwear }: { footwear: Category }) {
  return (
    <Link href={toLocalPath(footwear.permalink)} className="group relative flex min-h-29 flex-col justify-end overflow-hidden">
      <Image src={wordpressUrl(FOOTWEAR_PHOTO)} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="zoom-on-hover object-cover" />
      <TileLabel name={footwear.name} detail={productCountLabel(footwear.count)} />
    </Link>
  );
}

function OwnBrandTile({ product }: { product: ProductSummary | undefined }) {
  const image = product?.images.at(0);

  return (
    <Link href="#wertes-safe" className="group relative flex min-h-29 flex-col justify-end overflow-hidden bg-accent">
      {image && (
        <Image
          src={image.src}
          alt=""
          width={240}
          height={240}
          className="zoom-on-hover absolute top-2 right-0 h-4/5 w-auto origin-bottom-right mix-blend-multiply"
        />
      )}
      <TileLabel name="Wertes Safe+" detail={"Nasza marka, rękawice i\u00a0fartuchy ze\u00a0skóry"} />
    </Link>
  );
}

function TileLabel({ name, detail }: { name: string; detail: string }) {
  return (
    <span className="relative max-w-2/3 chamfer-control self-start bg-ink py-1.5 pr-3 pl-2 text-paper">
      <b className="block font-semibold tracking-control uppercase">
        <span className="link-line">{name}</span>
      </b>
      <span className="text-small">{detail}</span>
    </span>
  );
}

const perks = [
  { figure: "Faktura VAT", detail: "Do\u00a0każdego zamówienia, zakupy na\u00a0firmę" },
  { figure: company.phone, detail: "Pomoc w\u00a0doborze, odbiera osoba, która zna magazyn" },
  { figure: bulkDiscountPercents(), detail: `Rabatu od\u00a0koszyka za\u00a0${bulkDiscountThresholds()}` },
  { figure: "Dostawa 0\u00a0zł", detail: `Przy zamówieniu od\u00a0${company.freeShippingFrom}` },
];

function bulkDiscountPercents() {
  const percents = company.bulkDiscounts.map((discount) => discount.percent);
  return percents.join(" / ");
}

function bulkDiscountThresholds() {
  const thresholds = company.bulkDiscounts.map((discount) => discount.from);
  return thresholds.join(" i\u00a0");
}

function Perks() {
  return (
    <dl className="mt-4 grid gap-x-3 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
      {perks.map((perk) => (
        <div key={perk.figure} className="border-t-4 border-ink pt-2">
          <dt className="text-figure">{perk.figure}</dt>
          <dd>{perk.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
