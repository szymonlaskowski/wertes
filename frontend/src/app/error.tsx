"use client";

import { Button } from "@/components/button";
import { PageTitle } from "@/components/page-title";
import { company } from "@/lib/company";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="page-width pt-4 pb-10">
      <PageTitle>coś się zacięło</PageTitle>
      <p className="mt-2 max-w-95">
        Ta strona nie załadowała się, to błąd po naszej stronie. Spróbuj jeszcze raz, a&nbsp;jeśli dalej nie działa, zadzwoń:{" "}
        <a href={company.phoneHref} className="link-line font-semibold">
          {company.phone}
        </a>
        .
      </p>
      <div className="mt-4">
        <Button variant="primary" type="button" onClick={retry}>
          Spróbuj ponownie
        </Button>
      </div>
    </main>
  );
}
