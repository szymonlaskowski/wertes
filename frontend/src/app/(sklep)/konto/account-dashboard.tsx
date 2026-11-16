"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { Field, inputClassName } from "@/components/field";
import { type Account, type Address, listOrders, type OrderSummary, saveAddress, signOut } from "@/lib/account";
import { formatGrosze } from "@/lib/cart";
import { FormError, useAccountForm } from "./account-form";

const POSTCODE_PATTERN = "[0-9]{2}-[0-9]{3}";

type AccountDashboardProps = {
  account: Account;
  onAccountChange: (account: Account) => void;
  onSignedOut: () => void;
};

export function AccountDashboard({ account, onAccountChange, onSignedOut }: AccountDashboardProps) {
  async function signOutAndForget() {
    await signOut();
    onSignedOut();
  }

  return (
    <>
      <p className="mt-2 flex flex-wrap gap-x-3">
        <span>
          Zalogowano jako <b className="font-semibold">{account.email}</b>
        </span>
        <button type="button" onClick={signOutAndForget} className="link-line">
          Wyloguj
        </button>
      </p>
      <div className="mt-5 grid items-start gap-8 lg:grid-cols-2">
        <Orders />
        <AddressForm address={account.address} onSaved={onAccountChange} />
      </div>
    </>
  );
}

function Orders() {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    listOrders().then(setOrders);
  }, []);

  return (
    <section aria-labelledby="zamowienia" className="grid gap-3">
      <h2 id="zamowienia" className="font-semibold">
        Zamówienia
      </h2>
      <OrderTable orders={orders} />
    </section>
  );
}

function OrderTable({ orders }: { orders: OrderSummary[] | null }) {
  if (orders === null) {
    return <p role="status">Wczytuję zamówienia…</p>;
  }
  if (orders.length === 0) {
    return (
      <p>
        Nie masz jeszcze zamówień złożonych po zalogowaniu.{" "}
        <Link href="/" className="link-line">
          Wróć do sklepu
        </Link>
        .
      </p>
    );
  }
  return (
    <table className="w-full text-left tabular-nums">
      <thead className="text-small text-mute">
        <tr>
          <th className="pb-1 font-normal">Numer</th>
          <th className="pb-1 font-normal">Data</th>
          <th className="pb-1 font-normal">Status</th>
          <th className="pb-1 text-right font-normal">Brutto</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td className="py-0.5">
              <Link href={orderPagePath(order)} className="font-semibold link-line">
                {order.number}
              </Link>
            </td>
            <td className="py-0.5">{new Date(order.date).toLocaleDateString("pl-PL")}</td>
            <td className="py-0.5">{order.status}</td>
            <td className="py-0.5 text-right">{formatGrosze(order.totalGrosze)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function orderPagePath(order: OrderSummary) {
  const params = new URLSearchParams({ id: String(order.id), key: order.key, email: order.email });
  return `/zamowienie/?${params}`;
}

function AddressForm({ address, onSaved }: { address: Address; onSaved: (account: Account) => void }) {
  const [isSaved, setIsSaved] = useState(false);
  const { isSending, errorMessage, submit } = useAccountForm((account) => {
    setIsSaved(true);
    onSaved(account);
  });

  return (
    <section aria-labelledby="dane-do-faktury" className="grid gap-3">
      <h2 id="dane-do-faktury" className="font-semibold">
        Dane do faktury i&nbsp;dostawy
      </h2>
      <p>Wpiszemy je za Ciebie w&nbsp;kasie.</p>
      <form
        onSubmit={(event) => submit(event, (fields) => saveAddress(addressFrom(fields)))}
        onChange={() => setIsSaved(false)}
        className="grid gap-2 sm:grid-cols-2"
      >
        <Field label="Imię">
          <input name="first_name" defaultValue={address.first_name} autoComplete="given-name" required className={inputClassName} />
        </Field>
        <Field label="Nazwisko">
          <input name="last_name" defaultValue={address.last_name} autoComplete="family-name" required className={inputClassName} />
        </Field>
        <Field label="Firma (opcjonalnie)">
          <input name="company" defaultValue={address.company} autoComplete="organization" className={inputClassName} />
        </Field>
        <Field label="NIP (opcjonalnie)">
          <input name="nip" defaultValue={address.nip} inputMode="numeric" className={inputClassName} />
        </Field>
        <Field label="Telefon">
          <input name="phone" type="tel" defaultValue={address.phone} autoComplete="tel" required className={inputClassName} />
        </Field>
        <Field label="Ulica i numer">
          <input name="address_1" defaultValue={address.address_1} autoComplete="street-address" required className={inputClassName} />
        </Field>
        <Field label="Kod pocztowy">
          <input
            name="postcode"
            defaultValue={address.postcode}
            autoComplete="postal-code"
            required
            pattern={POSTCODE_PATTERN}
            placeholder="00-000"
            className={inputClassName}
          />
        </Field>
        <Field label="Miejscowość">
          <input name="city" defaultValue={address.city} autoComplete="address-level2" required className={inputClassName} />
        </Field>
        <div className="grid gap-2 sm:col-span-2">
          <FormError message={errorMessage} />
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" type="submit" disabled={isSending}>
              Zapisz dane
            </Button>
            {isSaved && <p role="status">Zapisane.</p>}
          </div>
        </div>
      </form>
    </section>
  );
}

function addressFrom(fields: FormData): Address {
  const text = (name: keyof Address) => String(fields.get(name)).trim();
  return {
    first_name: text("first_name"),
    last_name: text("last_name"),
    company: text("company"),
    nip: text("nip"),
    phone: text("phone"),
    address_1: text("address_1"),
    postcode: text("postcode"),
    city: text("city"),
  };
}
