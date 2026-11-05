import type { Metadata } from "next";
import { Bestsellers } from "@/components/bestsellers";
import { PageTitle } from "@/components/page-title";
import { company } from "@/lib/company";

export const metadata: Metadata = { title: "Nic tu nie ma" };

export default function NotFound() {
  return (
    <main className="page-width pt-4 pb-10">
      <PageTitle>Nic tu nie ma</PageTitle>
      <p className="mt-2 max-w-95">
        Pod tym adresem nie ma strony. Produkt mógł zmienić nazwę albo zniknąć z&nbsp;oferty. Wpisz nazwę
        albo kod w&nbsp;pole wyżej albo zadzwoń:{" "}
        <a href={company.phoneHref} className="link-line font-semibold">
          {company.phone}
        </a>
        .
      </p>
      <Bestsellers />
    </main>
  );
}
