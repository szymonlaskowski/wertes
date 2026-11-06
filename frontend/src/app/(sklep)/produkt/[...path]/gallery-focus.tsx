"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

type GalleryFocus = { focusedImageSrc: string | undefined; focusImage: (src: string) => void };

const GalleryFocusContext = createContext<GalleryFocus | null>(null);

export function GalleryFocusProvider({ children }: { children: ReactNode }) {
  const [focusedImageSrc, setFocusedImageSrc] = useState<string>();
  return (
    <GalleryFocusContext value={{ focusedImageSrc, focusImage: setFocusedImageSrc }}>{children}</GalleryFocusContext>
  );
}

export function useGalleryFocus() {
  const galleryFocus = useContext(GalleryFocusContext);
  if (!galleryFocus) {
    throw new Error("useGalleryFocus needs a GalleryFocusProvider around the product card");
  }
  return galleryFocus;
}
