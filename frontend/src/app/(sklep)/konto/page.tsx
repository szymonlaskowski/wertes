import type { Metadata } from "next";
import { PageTitle } from "@/components/page-title";
import { AccountView } from "./account-view";

export const metadata: Metadata = { title: "Konto", robots: { index: false } };

export default function AccountPage() {
  return (
    <main className="page-width pt-3 pb-10">
      <PageTitle>Konto</PageTitle>
      <AccountView />
    </main>
  );
}
