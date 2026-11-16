"use client";

import { type } from "arktype";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/button";

const CONSENT_STORAGE_KEY = "wertes-cookie-consent-v1";

const optionalCategories = [
  {
    name: "analytics_storage",
    title: "Analityczne",
    description: "Pozwalają nam liczyć odwiedziny i sprawdzać, jak korzystasz ze sklepu, żeby go ulepszać.",
  },
  {
    name: "ad_storage",
    title: "Reklamowe",
    description: "Pozwalają dopasować reklamy do Twoich zainteresowań i mierzyć skuteczność kampanii.",
  },
  {
    name: "ad_user_data",
    title: "Dane użytkownika związane z reklamami",
    description: "Zgoda na wysyłanie do Google danych związanych z reklamami.",
  },
  {
    name: "ad_personalization",
    title: "Reklamy spersonalizowane",
    description: "Zgoda na wyświetlanie reklam spersonalizowanych.",
  },
] as const;

const cookieConsentChoice = type({
  analytics_storage: "boolean",
  ad_storage: "boolean",
  ad_user_data: "boolean",
  ad_personalization: "boolean",
});
type CookieConsentChoice = typeof cookieConsentChoice.infer;

const UNKNOWN_DURING_SERVER_RENDER = "server";

export function CookieConsent() {
  const savedJson = useSyncExternalStore(subscribeToNothing, readSavedJson, () => UNKNOWN_DURING_SERVER_RENDER);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  function save(choice: CookieConsentChoice) {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
    setIsPreferencesOpen(false);
  }

  if (savedJson === UNKNOWN_DURING_SERVER_RENDER) {
    return null;
  }

  const savedChoice = parseChoice(savedJson);
  const hasChoice = savedChoice !== null;

  if (hasChoice && !isPreferencesOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsPreferencesOpen(true)}
        className="link-line"
      >
        Ustawienia cookies
      </button>
    );
  }

  return (
    <section
      aria-labelledby="cookie-consent-title"
      className="fixed right-12 bottom-2 left-2 z-40 grid max-h-[calc(100dvh-32px)] max-w-50 gap-2 overflow-y-auto bg-ink p-3 text-paper"
    >
      <h2 id="cookie-consent-title" className="font-semibold">
        Cenimy Twoją prywatność
      </h2>
      {isPreferencesOpen ? (
        <ConsentPreferences initialChoice={savedChoice ?? choiceForAll(false)} onSave={save} />
      ) : (
        <ConsentSummary
          onAcceptAll={() => save(choiceForAll(true))}
          onRejectAll={() => save(choiceForAll(false))}
          onCustomize={() => setIsPreferencesOpen(true)}
        />
      )}
    </section>
  );
}

type ConsentSummaryProps = { onAcceptAll: () => void; onRejectAll: () => void; onCustomize: () => void };

function ConsentSummary({ onAcceptAll, onRejectAll, onCustomize }: ConsentSummaryProps) {
  return (
    <>
      <p className="text-small">
        Używamy plików cookie do działania sklepu, analizowania ruchu i&nbsp;dopasowania reklam. Niezbędne pliki cookie
        działają zawsze, na pozostałe potrzebujemy Twojej zgody. Więcej w&nbsp;
        <Link href="/polityka-prywatnosci/" className="link-line">
          polityce prywatności
        </Link>
        .
      </p>
      <div className="flex flex-wrap gap-1">
        <Button variant="accent" onInk type="button" onClick={onAcceptAll}>
          Akceptuj wszystkie
        </Button>
        <Button variant="secondary" onInk type="button" onClick={onRejectAll}>
          Odrzuć wszystkie
        </Button>
        <Button variant="secondary" onInk type="button" onClick={onCustomize}>
          Dostosuj
        </Button>
      </div>
    </>
  );
}

type ConsentPreferencesProps = {
  initialChoice: CookieConsentChoice;
  onSave: (choice: CookieConsentChoice) => void;
};

function ConsentPreferences({ initialChoice, onSave }: ConsentPreferencesProps) {
  const [choice, setChoice] = useState(initialChoice);

  return (
    <>
      <ul className="grid gap-2">
        <li>
          <label className="flex items-start gap-1">
            <input type="checkbox" checked disabled className="mt-0.5 size-2 shrink-0 accent-accent" />
            <span>
              <span className="block font-semibold">Niezbędne</span>
              <span className="text-small">Konieczne do działania sklepu, np. koszyka. Zawsze włączone.</span>
            </span>
          </label>
        </li>
        {optionalCategories.map((category) => (
          <li key={category.name}>
            <label className="flex items-start gap-1">
              <input
                type="checkbox"
                checked={choice[category.name]}
                onChange={(event) => setChoice({ ...choice, [category.name]: event.target.checked })}
                className="mt-0.5 size-2 shrink-0 accent-accent"
              />
              <span>
                <span className="block font-semibold">{category.title}</span>
                <span className="text-small">{category.description}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-1">
        <Button variant="accent" onInk type="button" onClick={() => onSave(choice)}>
          Zapisz wybór
        </Button>
        <Button variant="secondary" onInk type="button" onClick={() => onSave(choiceForAll(true))}>
          Akceptuj wszystkie
        </Button>
      </div>
    </>
  );
}

function choiceForAll(isAccepted: boolean): CookieConsentChoice {
  return {
    analytics_storage: isAccepted,
    ad_storage: isAccepted,
    ad_user_data: isAccepted,
    ad_personalization: isAccepted,
  };
}

function subscribeToNothing() {
  return () => {};
}

function readSavedJson() {
  return localStorage.getItem(CONSENT_STORAGE_KEY);
}

function parseChoice(savedJson: string | null): CookieConsentChoice | null {
  if (savedJson === null) {
    return null;
  }
  const saved = cookieConsentChoice(JSON.parse(savedJson));
  if (saved instanceof type.errors) {
    return null;
  }
  return saved;
}
