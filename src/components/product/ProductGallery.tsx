
"use client";

import { useEffect, useState } from "react";
import ImageComponent from "@/components/layout/common/ImageComponent";
import ImageMagnify from "@/components/product/ImageMagnify";

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

const AUTO_SLIDE_INTERVAL = 3000;

export default function ProductGallery({
  images,
  alt,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const hasMany = images.length > 1;
  const current = images[active] ?? images[0];

  // Automatic slide
  useEffect(() => {
    if (!hasMany || isPaused) return;

    const interval = window.setInterval(() => {
      setActive((previous) => (previous + 1) % images.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => window.clearInterval(interval);
  }, [hasMany, images.length, isPaused]);

  // Keep active index valid when images change
  useEffect(() => {
    setActive((previous) =>
      Math.min(previous, Math.max(0, images.length - 1))
    );
  }, [images.length]);

  if (!current) return null;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node | null
          )
        ) {
          setIsPaused(false);
        }
      }}
    >
      <ImageMagnify
        images={images}
        alt={alt}
        active={active}
        onActiveChange={setActive}
      />

      {hasMany && (
        <ol className="mt-3 flex flex-wrap gap-3">
          {images.map((src, index) => {
            const selected = index === active;

            return (
              <li key={`${src}-${index}`}>
                <button
                  type="button"
                  aria-label={`${alt} ${index + 1}`}
                  aria-current={selected ? "true" : undefined}
                  onClick={() => setActive(index)}
                  className={`relative size-24 overflow-hidden bg-surface ring-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:size-28 ${
                    selected
                      ? "ring-2 ring-heading"
                      : "ring-border"
                  }`}
                >
                  <ImageComponent
                    src={src}
                    alt=""
                    width={224}
                    height={224}
                    objectFit="cover"
                    sizes="112px"
                  />
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
