import type { Metadata } from "next";
import { PageTitle } from "@/components/page-title";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Kasa", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <main className="page-width pt-3 pb-10">
      <PageTitle>Kasa</PageTitle>
      <CheckoutForm />
    </main>
  );
}
