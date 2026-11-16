import type { Metadata } from "next";
import { BrandsIndex } from "./home/brands-index";
import { Hero } from "./home/hero";
import { loadHomeData } from "./home/home-data";
import { LatestArticles } from "./home/latest-articles";
import { MostChosen, OwnBrand } from "./home/product-sections";
import { WholesaleBand } from "./home/wholesale-band";
import { WorkerDepartments } from "./home/worker-departments";

export const metadata: Metadata = {
  title: { absolute: "Sklep i Hurtownia z artykułami BHP | Wertes" },
  description:
    "Jesteśmy sklepem, który za główny cel obrał sobie dostarczanie klientom z branży BHP oraz przemysłowej produktów o jak najwyższej jakości.",
};

export default async function HomePage() {
  const home = await loadHomeData();

  return (
    <main className="flex w-full flex-col">
      <Hero
        totalProducts={home.totalProducts}
        brandCount={home.brands.length}
        footwear={home.footwear}
        ownBrandProduct={home.ownBrandProducts.at(0)}
      />
      <MostChosen products={home.mostChosen} />
      <WorkerDepartments categories={home.categories} others={home.otherDepartments} />
      <OwnBrand brand={home.ownBrand} products={home.ownBrandProducts} />
      <LatestArticles articles={home.articles} />
      <WholesaleBand />
      <BrandsIndex brands={home.brands} allBrands={home.allBrands} />
    </main>
  );
}
