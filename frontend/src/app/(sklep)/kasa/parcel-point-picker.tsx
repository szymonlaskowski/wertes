"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import { Button } from "@/components/button";
import type { ParcelPoint } from "@/lib/checkout";

declare global {
  interface Window {
    BPWidget?: {
      init(container: HTMLElement, options: BPWidgetOptions): void;
    };
  }
}

type MapPoint = {
  code: string;
  operator: string;
  description?: string;
  street?: string;
  city?: string;
  postalCode?: string;
};

type BPWidgetOptions = {
  callback: (point: MapPoint) => void;
  posType: "DELIVERY";
  mapOptions: { zoom: number };
  codOnly: boolean;
  operatorMarkers: boolean;
  countryCodes: string;
  initialAddress: string;
  operators: { operator: string; price: null }[];
  codeSearch: boolean;
};

const MAP_SCRIPT_URL = "https://map.alsendo.com/v8.7/main.js";
const MAP_STYLESHEET_URL = "https://map.alsendo.com/v8.7/main.css";
const MAP_ZOOM = 12;
const POLAND = "PL";

type ParcelPointPickerProps = {
  operator: string;
  searchNear: string;
  point: ParcelPoint | null;
  onPick: (point: ParcelPoint) => void;
};

export function ParcelPointPicker({ operator, searchNear, point, onPick }: ParcelPointPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapWidget, setMapWidget] = useState<Window["BPWidget"]>(undefined);

  function openMap() {
    const dialog = dialogRef.current;
    const mapContainer = mapRef.current;
    if (dialog === null || mapContainer === null || mapWidget === undefined) {
      return;
    }
    dialog.showModal();
    mapContainer.replaceChildren();
    mapWidget.init(mapContainer, {
      callback: (mapPoint) => {
        onPick(parcelPointFrom(mapPoint));
        dialog.close();
      },
      posType: "DELIVERY",
      mapOptions: { zoom: MAP_ZOOM },
      codOnly: false,
      operatorMarkers: true,
      countryCodes: POLAND,
      initialAddress: searchNear,
      operators: [{ operator, price: null }],
      codeSearch: true,
    });
  }

  return (
    <div className="grid gap-1">
      <link rel="stylesheet" href={MAP_STYLESHEET_URL} precedence="default" />
      <Script src={MAP_SCRIPT_URL} onReady={() => setMapWidget(window.BPWidget)} />
      {point === null ? (
        <p className="text-small font-semibold">Wybierz punkt odbioru, żeby złożyć zamówienie.</p>
      ) : (
        <p className="text-small">
          <span className="font-semibold">{point.apm_name}</span>
          <br />
          {point.apm_street}, {point.apm_postal_code} {point.apm_city}
        </p>
      )}
      <p>
        <Button variant="secondary" type="button" onClick={openMap} disabled={mapWidget === undefined}>
          {point === null ? "Wybierz punkt na mapie" : "Zmień punkt"}
        </Button>
      </p>
      <dialog
        ref={dialogRef}
        aria-label="Mapa punktów odbioru"
        className="m-auto h-[min(720px,calc(100dvh-32px))] w-[min(1100px,calc(100vw-32px))] max-w-none bg-paper p-0 backdrop:bg-ink/60"
      >
        <p className="flex justify-end">
          <button type="button" onClick={() => dialogRef.current?.close()} className="px-2 py-1 font-semibold link-line">
            Zamknij
          </button>
        </p>
        <div ref={mapRef} className="h-[calc(100%-48px)]" />
      </dialog>
    </div>
  );
}

function parcelPointFrom(mapPoint: MapPoint): ParcelPoint {
  return {
    apm_access_point_id: mapPoint.code,
    apm_supplier: mapPoint.operator,
    apm_name: mapPoint.description ?? mapPoint.code,
    apm_foreign_access_point_id: mapPoint.code,
    apm_street: mapPoint.street ?? "",
    apm_city: mapPoint.city ?? "",
    apm_postal_code: mapPoint.postalCode ?? "",
    apm_country_code: POLAND,
  };
}
