import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTitle } from "@/components/page-title";
import { PasswordForms } from "./password-forms";

export const metadata: Metadata = { title: "Nowe hasło", robots: { index: false } };

export default function NewPasswordPage() {
  return (
    <main className="page-width pt-3 pb-10">
      <PageTitle>Nowe hasło</PageTitle>
      <Suspense>
        <PasswordForms />
      </Suspense>
    </main>
  );
}
