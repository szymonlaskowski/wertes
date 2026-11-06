"use client";

import Image from "next/image";
import { type PointerEvent, type UIEvent, useEffect, useRef, useState, ViewTransition } from "react";
import { productImageTransitionName } from "@/components/product-image-transition";
import { useGalleryFocus } from "./gallery-focus";

type GalleryImage = { src: string; alt: string };

export function ProductGallery({ productId, images }: { productId: number; images: GalleryImage[] }) {
  const slidesRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { focusedImageSrc } = useGalleryFocus();
  const hasThumbnails = images.length > 1;

  useEffect(() => {
    const focusedIndex = images.findIndex((image) => image.src === focusedImageSrc);
    const galleryHasFocusedImage = focusedIndex !== -1;
    const slides = slidesRef.current;
    if (galleryHasFocusedImage && slides !== null) {
      slides.scrollTo({ left: focusedIndex * slides.clientWidth, behavior: "instant" });
    }
  }, [images, focusedImageSrc]);

  function trackActiveSlide(event: UIEvent<HTMLUListElement>) {
    const slides = event.currentTarget;
    setActiveIndex(Math.round(slides.scrollLeft / slides.clientWidth));
  }

  function showSlide(index: number) {
    const slides = slidesRef.current;
    if (slides === null) {
      return;
    }
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    slides.scrollTo({
      left: index * slides.clientWidth,
      behavior: prefersReducedMotion ? "instant" : "smooth",
    });
  }

  function followPointerWithZoom(event: PointerEvent<HTMLLIElement>) {
    const slide = event.currentTarget;
    const bounds = slide.getBoundingClientRect();
    const percentFromLeft = ((event.clientX - bounds.left) / bounds.width) * 100;
    const percentFromTop = ((event.clientY - bounds.top) / bounds.height) * 100;
    slide.style.setProperty("--zoom-origin", `${percentFromLeft}% ${percentFromTop}%`);
  }

  return (
    <div className="md:sticky md:top-3">
      <ViewTransition name={productImageTransitionName(productId)} share="product-image" default="none">
        <ul
          ref={slidesRef}
          onScroll={trackActiveSlide}
          aria-label="Zdjęcia produktu"
          className="flex aspect-square snap-x snap-mandatory overflow-x-auto rounded-box bg-surface [scrollbar-width:none]"
        >
          {images.map((image, index) => (
            <li
              key={image.src}
              onPointerMove={followPointerWithZoom}
              className="group/slide relative w-full shrink-0 snap-start overflow-hidden mouse:cursor-zoom-in"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                preload={index === 0}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="origin-(--zoom-origin) object-contain p-4 mix-blend-multiply transition-[scale] duration-(--duration-panel) ease-(--ease-out) mouse:group-hover/slide:scale-200 motion-reduce:transition-none"
              />
            </li>
          ))}
        </ul>
      </ViewTransition>
      {hasThumbnails && (
        <ul className="mt-2 flex flex-wrap gap-1">
          {images.map((image, index) => (
            <li key={image.src}>
              <Thumbnail
                image={image}
                label={`Zdjęcie ${index + 1} z ${images.length}`}
                isActive={index === activeIndex}
                onSelect={() => showSlide(index)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Thumbnail({
  image,
  label,
  isActive,
  onSelect,
}: {
  image: GalleryImage;
  label: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  const outlineClassName = isActive ? "outline-ink" : "outline-transparent mouse:hover:outline-ink";

  return (
    <button
      type="button"
      aria-label={label}
      aria-current={isActive}
      onClick={onSelect}
      className={`relative block size-8 rounded-box bg-surface outline-2 outline-offset-0 focus-visible:outline-ink ${outlineClassName}`}
    >
      <Image src={image.src} alt="" fill sizes="64px" className="object-contain p-0.5 mix-blend-multiply" />
    </button>
  );
}
