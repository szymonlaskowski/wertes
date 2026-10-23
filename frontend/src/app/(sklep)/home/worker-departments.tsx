import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { NormPlate } from "@/components/norm-plate";
import { findBySlug, formatCount } from "@/lib/catalog";
import { toLocalPath } from "@/lib/catalog-paths";
import { type Category, wordpressUrl } from "@/lib/store-api";

type FigureStyle = CSSProperties & Record<`--${string}`, string>;

type Photo = { path: string; x: number; y: number; width: number; aspect: string };

type Zone = {
  slug: string;
  norm: string;
  photos: Photo[];
  label: { side: "left" | "right"; y: number; leader: number };
};

export const zones: Zone[] = [
  {
    slug: "ochrona-glowy",
    norm: "EN 397",
    photos: [{ path: "2025/11/0082410960.jpg", x: 325, y: 0, width: 130, aspect: "1002 / 1024" }],
    label: { side: "left", y: 39, leader: 165 },
  },
  {
    slug: "ochrona-sluchu",
    norm: "EN 352",
    photos: [{ path: "2024/03/e388c84a-cc50-4a02-aa94-907beb571871.jpg", x: 478, y: 29, width: 92, aspect: "724 / 867" }],
    label: { side: "right", y: 58, leader: 60 },
  },
  {
    slug: "ochronna-drog-oddechowych",
    norm: "FFP3",
    photos: [{ path: "2024/03/bf5661f5-a125-45a1-a3af-5335b0e883bc.jpg", x: 190, y: 145, width: 100, aspect: "1121 / 1051" }],
    label: { side: "left", y: 164, leader: 30 },
  },
  {
    slug: "ochrona-oczu-i-twarzy",
    norm: "EN 166",
    photos: [{ path: "2024/03/9dba0d89-7123-42e7-b648-1c8b37efbe3c.jpg", x: 315, y: 141, width: 150, aspect: "1326 / 757" }],
    label: { side: "right", y: 164, leader: 165 },
  },
  {
    slug: "ochrona-ciala",
    norm: "EN ISO 20471",
    photos: [{ path: "2026/03/lahtipro-11.jpg", x: 315, y: 237, width: 150, aspect: "993 / 1599" }],
    label: { side: "left", y: 280, leader: 155 },
  },
  {
    slug: "ochrona-przed-upadkiem-z-wysokosci-sprzet-bhp",
    norm: "EN 361",
    photos: [{ path: "2023/08/FP11RER-1.jpg", x: 492, y: 253, width: 112, aspect: "459 / 1047" }],
    label: { side: "right", y: 347, leader: 26 },
  },
  {
    slug: "ochrona-rak",
    norm: "EN 388",
    photos: [{ path: "2025/08/ca5dd882-dd5a-43c8-8c8d-295254142d34.jpg", x: 172, y: 366, width: 128, aspect: "815 / 636" }],
    label: { side: "left", y: 386, leader: 12 },
  },
  {
    slug: "ochrona-nog",
    norm: "S3",
    photos: [
      { path: "2026/08/lahtipro-26.jpg", x: 347, y: 476, width: 86, aspect: "606 / 1600" },
      { path: "2026/09/BCFORTIS-B-big.jpg", x: 338, y: 690, width: 104, aspect: "435 / 450" },
    ],
    label: { side: "left", y: 569, leader: 187 },
  },
];

const FIGURE_SIZE = 800;
const LABEL_WIDTH = FIGURE_SIZE / 5;

export function WorkerDepartments({ categories, others }: { categories: Category[]; others: Category[] }) {
  return (
    <section id="dzialy" aria-labelledby="dzialy-naglowek" className="page-width pt-10">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="max-lg:contents">
          <div>
            <h2 id="dzialy-naglowek" className="text-title">
              Wybierz dział
            </h2>
            <p className="mt-2">Każda rzecz na pracowniku prowadzi do swojego działu, od kasku EN&nbsp;397 po trzewiki S3.</p>
          </div>
          <OtherDepartments departments={others} />
        </div>
        <nav aria-label="Działy według części ciała" className="relative grid grid-cols-2 gap-x-2 gap-y-4 md:block md:aspect-square lg:col-span-2">
          {zones.map((zone) => (
            <ZoneLink key={zone.slug} zone={zone} category={findBySlug(categories, zone.slug)} />
          ))}
        </nav>
      </div>
    </section>
  );
}

function ZoneLink({ zone, category }: { zone: Zone; category: Category }) {
  return (
    <Link href={toLocalPath(category.permalink)} className="flex flex-col gap-1 focus-visible:outline-2 focus-visible:outline-ink md:block">
      <span className="flex h-16 items-end justify-center gap-1 md:contents">
        {zone.photos.map((photo) => (
          <ZonePhoto key={photo.path} photo={photo} />
        ))}
      </span>
      <ZoneLabel zone={zone} category={category} />
    </Link>
  );
}

function ZonePhoto({ photo }: { photo: Photo }) {
  const style: FigureStyle = {
    "--x": percentOfFigure(photo.x),
    "--y": percentOfFigure(photo.y),
    "--width": percentOfFigure(photo.width),
    "--aspect": photo.aspect,
  };

  return (
    <span
      style={style}
      className="relative block aspect-(--aspect) h-full max-w-full md:absolute md:top-(--y) md:left-(--x) md:h-auto md:w-(--width)"
    >
      <Image src={wordpressUrl(`/wp-content/uploads/${photo.path}`)} alt="" fill sizes="200px" className="object-cover" />
    </span>
  );
}

function ZoneLabel({ zone, category }: { zone: Zone; category: Category }) {
  const isLeft = zone.label.side === "left";
  const style: FigureStyle = {
    "--y": percentOfFigure(zone.label.y),
    "--leader": `${(zone.label.leader / LABEL_WIDTH) * 100}%`,
  };
  const sideClassName = isLeft
    ? "md:left-0 md:items-end md:pr-1 md:text-right md:after:left-full"
    : "md:left-4/5 md:pl-1 md:after:right-full";

  return (
    <span
      style={style}
      className={`flex flex-col items-start gap-0.5 text-small md:absolute md:top-(--y) md:w-1/5 md:after:absolute md:after:top-1 md:after:w-(--leader) md:after:border-t-2 md:after:border-ink md:after:content-[''] ${sideClassName}`}
    >
      <b className="font-semibold">
        <span className="link-line">{category.name}</span>
      </b>
      <span className="flex items-center gap-1">
        <span className="tabular-nums">{formatCount(category.count)}</span>
        <NormPlate norm={zone.norm} />
      </span>
    </span>
  );
}

function OtherDepartments({ departments }: { departments: Category[] }) {
  return (
    <div className="max-lg:order-last lg:mt-5">
      <h3 className="font-semibold">Pozostałe działy</h3>
      <ul className="mt-1">
        {departments.map((department) => (
          <li key={department.id}>
            <Link href={toLocalPath(department.permalink)} className="flex justify-between gap-2 py-0.5">
              <span className="link-line">{department.name}</span>
              <span className="text-mute tabular-nums">{formatCount(department.count)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function percentOfFigure(units: number) {
  return `${(units / FIGURE_SIZE) * 100}%`;
}
