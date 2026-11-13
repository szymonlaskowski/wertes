import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/button";
import { PageTitle } from "@/components/page-title";
import { wordpressUrl } from "@/lib/store-api";
import { readAboutPage } from "@/lib/wordpress-pages";

const ABOUT_PHOTO = "/wp-content/uploads/2021/10/O-nas.jpg";
const PROMOTIONS_PATH = "/produkty/promocje-i-nowosci/";

export const metadata: Metadata = { title: "O nas" };

export default async function AboutPage() {
  const about = await readAboutPage();

  return (
    <main className="page-width pt-3 pb-10">
      <PageTitle>O nas</PageTitle>
      <div className="relative mt-5 aspect-1045/400">
        <Image
          src={wordpressUrl(ABOUT_PHOTO)}
          alt="Żółty kask, nauszniki, okulary i rękawice ochronne na stole"
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <section aria-labelledby="kim-jestesmy" className="mt-8 grid gap-5 lg:grid-cols-2">
        <h2 id="kim-jestesmy" className="text-title">
          Kim jesteśmy?
        </h2>
        <div className="grid gap-2">
          <p className="font-semibold">
            Jesteśmy hurtownią zajmującą się kompleksową obsługą zamówień klientów z&nbsp;branży BHP, a&nbsp;także
            branży przemysłowej.
          </p>
          <p>
            W naszym asortymencie znajdą Państwo następujące produkty: odzież roboczą, rękawice robocze, nauszniki
            ochronne, okulary ochronne, obuwie robocze, apteczki, gaśnice oraz wiele innych artykułów ochrony
            indywidualnej, niezbędnej do ochrony zdrowia i&nbsp;życia na stanowisku pracy. Co więcej dysponujemy również
            różnego rodzaju wyłącznikami do elektronarzędzi.
          </p>
        </div>
      </section>
      <section aria-labelledby="o-sklepie" className="mt-8 grid gap-5 lg:grid-cols-2">
        <h2 id="o-sklepie" className="text-title">
          {about.about_us_title}
        </h2>
        <div className="grid gap-2">
          <Paragraphs text={about.about_us_text_left} />
          <Paragraphs text={about.about_us_text_right} />
        </div>
      </section>
      <p className="mt-8">
        <Button variant="accent" href={PROMOTIONS_PATH}>
          Zobacz promocje i&nbsp;nowości
        </Button>
      </p>
    </main>
  );
}

function Paragraphs({ text }: { text: string }) {
  const paragraphs = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  return paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>);
}
