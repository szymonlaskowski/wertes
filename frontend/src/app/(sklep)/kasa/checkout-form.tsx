"use client";

import Link from "next/link";
import { type FormEvent, type KeyboardEvent, useState } from "react";
import { Button } from "@/components/button";
import { useCart } from "@/components/cart/cart-provider";
import { Field, inputClassName, inputOnSurfaceClassName } from "@/components/field";
import { type Cart, formatGrosze, type ShippingRate } from "@/lib/cart";
import { company } from "@/lib/company";
import {
  type OrderRequest,
  PARCEL_POINT_OPERATOR_BY_SHIPPING_INSTANCE,
  type ParcelPoint,
  SUPPORTED_PAYMENT_METHODS,
} from "@/lib/checkout";
import { ParcelPointPicker } from "./parcel-point-picker";

const POSTCODE_PATTERN = "[0-9]{2}-[0-9]{3}";

export function CheckoutForm() {
  const { cart } = useCart();

  if (cart === null) {
    return <p role="status">Wczytuję koszyk…</p>;
  }
  if (cart.items_count === 0) {
    return (
      <p>
        Twój koszyk jest pusty.{" "}
        <Link href="/" className="link-line">
          Wróć do sklepu
        </Link>
        .
      </p>
    );
  }
  return <FilledCheckout cart={cart} />;
}

function FilledCheckout({ cart }: { cart: Cart }) {
  const { isUpdating, errorMessage, submitOrder } = useCart();
  const [pickedPoint, setPickedPoint] = useState<{ operator: string; point: ParcelPoint } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [searchNear, setSearchNear] = useState("");

  const shippingPackage = cart.shipping_rates.at(0);
  const selectedRate = shippingPackage?.shipping_rates.find((rate) => rate.selected);
  const parcelPointOperator =
    selectedRate === undefined ? undefined : PARCEL_POINT_OPERATOR_BY_SHIPPING_INSTANCE.get(selectedRate.instance_id);
  const needsParcelPoint = parcelPointOperator !== undefined;
  const isPickedForThisOperator = pickedPoint !== null && pickedPoint.operator === parcelPointOperator;
  const parcelPoint = isPickedForThisOperator ? pickedPoint.point : null;
  const paymentMethods = SUPPORTED_PAYMENT_METHODS.filter((method) => cart.payment_methods.includes(method.id));
  const isMissingParcelPoint = needsParcelPoint && parcelPoint === null;
  const shownError = submitError ?? errorMessage;

  async function order(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isMissingParcelPoint || paymentMethod === null) {
      return;
    }
    setSubmitError(null);
    const orderRequest = orderFromForm(new FormData(event.currentTarget), paymentMethod, parcelPoint);
    const result = await submitOrder(orderRequest);
    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }
    window.location.assign(result.redirectUrl);
  }

  return (
    <form onSubmit={order} className="mt-5 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
      <div className="grid gap-8">
        <BuyerSection onAddressChange={setSearchNear} />
        <section aria-labelledby="dostawa" className="grid gap-2">
          <h2 id="dostawa" className="font-semibold">
            Dostawa
          </h2>
          {shippingPackage === undefined ? (
            <p>Podaj adres, żeby zobaczyć sposoby dostawy.</p>
          ) : (
            <ShippingOptions packageId={shippingPackage.package_id} rates={shippingPackage.shipping_rates} />
          )}
          {parcelPointOperator !== undefined && (
            <ParcelPointPicker
              key={parcelPointOperator}
              operator={parcelPointOperator}
              searchNear={searchNear}
              point={parcelPoint}
              onPick={(point) => setPickedPoint({ operator: parcelPointOperator, point })}
            />
          )}
        </section>
        <section aria-labelledby="platnosc" className="grid gap-2">
          <h2 id="platnosc" className="font-semibold">
            Płatność
          </h2>
          <ul className="grid gap-1">
            {paymentMethods.map((method) => (
              <li key={method.id}>
                <label className="flex items-start gap-1">
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.id}
                    required
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="mt-0.5 size-2 shrink-0 accent-ink"
                  />
                  <span>
                    <span className="block font-semibold">{method.label}</span>
                    <span className="text-small text-mute">{method.description}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
        <Field label="Uwagi do zamówienia (opcjonalnie)">
          <textarea name="customer_note" rows={3} className={inputClassName} />
        </Field>
      </div>
      <aside aria-labelledby="podsumowanie" className="grid gap-3 bg-surface p-3 lg:sticky lg:top-2">
        <h2 id="podsumowanie" className="font-semibold">
          Podsumowanie
        </h2>
        <OrderSummary cart={cart} />
        <CouponForm appliedCodes={cart.coupons.map((coupon) => coupon.code)} />
        <label className="flex items-start gap-1 text-small">
          <input type="checkbox" required className="mt-0.5 size-2 shrink-0 accent-ink" />
          <span>
            Przeczytałem i&nbsp;akceptuję{" "}
            <Link href="/regulamin/" className="link-line">
              regulamin sklepu
            </Link>
            . Dane przetwarza {company.legalName} zgodnie z&nbsp;
            <Link href="/polityka-prywatnosci/" className="link-line">
              polityką prywatności
            </Link>
            .
          </span>
        </label>
        {shownError !== null && (
          <p role="alert" className="font-semibold">
            {shownError}
          </p>
        )}
        <Button variant="accent" type="submit" disabled={isUpdating || isMissingParcelPoint}>
          {isUpdating ? "Chwileczkę…" : "Zamawiam i płacę"}
        </Button>
      </aside>
    </form>
  );
}

function BuyerSection({ onAddressChange }: { onAddressChange: (address: string) => void }) {
  function rememberAddress(event: FormEvent<HTMLFieldSetElement>) {
    const form = event.currentTarget.form;
    if (form === null) {
      return;
    }
    const fields = new FormData(form);
    onAddressChange(`${fields.get("street")}, ${fields.get("postcode")} ${fields.get("city")}`);
  }

  return (
    <section aria-labelledby="dane" className="grid gap-2">
      <h2 id="dane" className="font-semibold">
        Dane do zamówienia i&nbsp;faktury
      </h2>
      <fieldset onChange={rememberAddress} className="grid gap-2 sm:grid-cols-2">
        <Field label="Imię">
          <input name="first_name" autoComplete="given-name" required className={inputClassName} />
        </Field>
        <Field label="Nazwisko">
          <input name="last_name" autoComplete="family-name" required className={inputClassName} />
        </Field>
        <Field label="E-mail">
          <input name="email" type="email" autoComplete="email" required className={inputClassName} />
        </Field>
        <Field label="Telefon">
          <input name="phone" type="tel" autoComplete="tel" required className={inputClassName} />
        </Field>
        <Field label="Firma (opcjonalnie)">
          <input name="company" autoComplete="organization" className={inputClassName} />
        </Field>
        <Field label="NIP (opcjonalnie)">
          <input name="tax_id" inputMode="numeric" className={inputClassName} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Ulica i numer">
            <input name="street" autoComplete="street-address" required className={inputClassName} />
          </Field>
        </div>
        <Field label="Kod pocztowy">
          <input
            name="postcode"
            autoComplete="postal-code"
            required
            pattern={POSTCODE_PATTERN}
            placeholder="00-000"
            className={inputClassName}
          />
        </Field>
        <Field label="Miejscowość">
          <input name="city" autoComplete="address-level2" required className={inputClassName} />
        </Field>
      </fieldset>
    </section>
  );
}

function ShippingOptions({ packageId, rates }: { packageId: number; rates: ShippingRate[] }) {
  const { isUpdating, chooseShippingRate } = useCart();

  return (
    <ul className="grid gap-1">
      {rates.map((rate) => (
        <li key={rate.rate_id}>
          <label className="flex items-baseline gap-1">
            <input
              type="radio"
              name="shipping_rate"
              value={rate.rate_id}
              checked={rate.selected}
              disabled={isUpdating}
              onChange={() => chooseShippingRate(packageId, rate.rate_id)}
              className="size-2 shrink-0 translate-y-0.5 accent-ink"
            />
            <span className="flex-1">{rate.name}</span>
            <span className="tabular-nums">{formatGrosze(Number(rate.price))}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function OrderSummary({ cart }: { cart: Cart }) {
  const { totals } = cart;
  const itemsGrosze = Number(totals.total_items) + Number(totals.total_items_tax);
  const shippingGrosze = Number(totals.total_shipping) + Number(totals.total_shipping_tax);
  const discountGrosze = Number(totals.total_discount) + Number(totals.total_discount_tax);

  return (
    <dl className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-0.5 tabular-nums">
      <dt>Produkty ({cart.items_count} szt.)</dt>
      <dd className="text-right">{formatGrosze(itemsGrosze)}</dd>
      <dt>Dostawa</dt>
      <dd className="text-right">{formatGrosze(shippingGrosze)}</dd>
      {discountGrosze > 0 && (
        <>
          <dt>Rabat</dt>
          <dd className="text-right">−{formatGrosze(discountGrosze)}</dd>
        </>
      )}
      <dt className="mt-1 font-semibold">Do zapłaty brutto</dt>
      <dd className="mt-1 text-right text-title">{formatGrosze(Number(totals.total_price))}</dd>
    </dl>
  );
}

function CouponForm({ appliedCodes }: { appliedCodes: string[] }) {
  const { isUpdating, addCoupon, dropCoupon } = useCart();
  const [code, setCode] = useState("");

  function applyOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      apply();
    }
  }

  async function apply() {
    const trimmedCode = code.trim();
    if (trimmedCode === "") {
      return;
    }
    await addCoupon(trimmedCode);
    setCode("");
  }

  return (
    <div className="grid gap-1">
      <div className="flex items-end gap-1">
        <div className="flex-1">
          <Field label="Kod rabatowy">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={applyOnEnter}
              className={inputOnSurfaceClassName}
            />
          </Field>
        </div>
        <Button variant="secondary" type="button" onClick={apply} disabled={isUpdating}>
          Użyj
        </Button>
      </div>
      {appliedCodes.map((appliedCode) => (
        <p key={appliedCode} className="flex justify-between text-small">
          <span className="font-semibold uppercase">{appliedCode}</span>
          <button type="button" onClick={() => dropCoupon(appliedCode)} disabled={isUpdating} className="link-line">
            Usuń
          </button>
        </p>
      ))}
    </div>
  );
}

function orderFromForm(form: FormData, paymentMethod: string, parcelPoint: ParcelPoint | null): OrderRequest {
  const text = (name: string) => String(form.get(name)).trim();
  return {
    email: text("email"),
    phone: text("phone"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    company: text("company"),
    taxId: text("tax_id"),
    street: text("street"),
    postcode: text("postcode"),
    city: text("city"),
    customerNote: text("customer_note"),
    paymentMethod,
    parcelPoint,
  };
}
