import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/button";
import { productCountLabel } from "@/lib/catalog";
import { toLocalPath } from "@/lib/catalog-paths";
import { company } from "@/lib/company";
import { type Category, type ProductSummary, wordpressUrl } from "@/lib/store-api";

const BANNER_PHOTO = "/wp-content/uploads/2022/02/25-scaled.jpg";
const FOOTWEAR_PHOTO = "/wp-content/uploads/2022/02/14-scaled.jpg";

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
    <section aria-labelledby="od-stop-do-glow" className="page-width pt-3">
      <div className="grid gap-2 lg:grid-cols-3">
        <div className="grid bg-ink text-paper md:grid-cols-2 lg:col-span-2">
          <div className="flex flex-col justify-end p-5 max-md:order-last max-md:p-3">
            <h1 id="od-stop-do-glow" className="text-title">
              Ubierz pracownika od&nbsp;stóp do&nbsp;głów
            </h1>
            <p className="mt-2">
              {productCountLabel(totalProducts)} od {brandCount} producentów dla ciebie i&nbsp;twojej firmy, z&nbsp;darmową
              dostawą od&nbsp;{company.freeShippingFrom}.
            </p>
            <p className="mt-3">
              <Button variant="primary" href="#dzialy">
                Wybierz dział
              </Button>
            </p>
          </div>
          <div className="relative min-h-30">
            <Image
              src={wordpressUrl(BANNER_PHOTO)}
              alt="Pracownik w pomarańczowym kasku niesie rurę na budowie"
              fill
              preload
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-1">
          <FootwearTile footwear={footwear} />
          <OwnBrandTile product={ownBrandProduct} />
        </div>
      </div>
      <Perks />
    </section>
  );
}

function FootwearTile({ footwear }: { footwear: Category }) {
  return (
    <Link href={toLocalPath(footwear.permalink)} className="group relative flex min-h-29 flex-col justify-end">
      <Image src={wordpressUrl(FOOTWEAR_PHOTO)} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
      <TileLabel name={footwear.name} detail={productCountLabel(footwear.count)} />
    </Link>
  );
}

function OwnBrandTile({ product }: { product: ProductSummary | undefined }) {
  const image = product?.images.at(0);

  return (
    <Link href="#wertes-safe" className="group relative flex min-h-29 flex-col justify-end bg-accent">
      {image && (
        <Image
          src={image.src}
          alt=""
          width={240}
          height={240}
          className="absolute top-2 right-0 h-4/5 w-auto mix-blend-multiply"
        />
      )}
      <TileLabel name="Wertes Safe+" detail={"Nasza marka, rękawice i\u00a0fartuchy ze\u00a0skóry"} />
    </Link>
  );
}

function TileLabel({ name, detail }: { name: string; detail: string }) {
  return (
    <span className="relative max-w-2/3 self-start bg-ink px-2 py-1.5 text-paper">
      <b className="block font-semibold">
        <span className="link-line">{name}</span>
      </b>
      <span className="text-small">{detail}</span>
    </span>
  );
}

const perks = [
  { title: "Zakupy dla firm", detail: "Faktura VAT do\u00a0każdego zamówienia" },
  { title: "Pomoc w\u00a0doborze", detail: `${company.phone}, odbiera osoba, która zna magazyn` },
  { title: "Rabaty od\u00a0wartości koszyka", detail: bulkDiscountSummary() },
  { title: "Darmowa dostawa", detail: `Od\u00a0${company.freeShippingFrom}` },
];

function bulkDiscountSummary() {
  const thresholds = company.bulkDiscounts.map((discount) => `${discount.percent} od\u00a0${discount.from}`);
  return thresholds.join(", ");
}

function Perks() {
  return (
    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-4">
      {perks.map((perk) => (
        <div key={perk.title}>
          <dt className="font-semibold">{perk.title}</dt>
          <dd className="text-small text-mute">{perk.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
