"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState, ViewTransition } from "react";
import type { ProductImage } from "@/lib/shopify/types";
import styles from "./ProductGallery.module.css";

// 3D viewer only for products with no photograph: the real photograph always wins over a modelled bottle.
// Client-only, mounted when idle, never under reduced motion.
const ProductViewer = dynamic(() => import("@/components/three/ProductViewer"), { ssr: false });

type Props = { handle: string; title: string; productType: string; images: ProductImage[] };

export function ProductGallery({ handle, title, productType, images }: Props) {
  const [index, setIndex] = useState(0);
  const [showViewer, setShowViewer] = useState(false);
  const current = images[index] ?? null;

  // Mount the 3D viewer only when the browser is idle, so it never competes with the photograph for the first paint.
  useEffect(() => {
    if (images.length > 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 600));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setShowViewer(true));
    return () => cancel(id);
  }, [images.length]);

  return (
    <div className={styles.gallery}>
      <ViewTransition name={`product-${handle}`} share="morph" default="none">
        <div className={styles.stage}>
          {current ? (
            <Image
              src={current.url}
              alt={current.altText || title}
              fill
              sizes="(min-width: 60rem) 45vw, 100vw"
              className={styles.img}
              preload={index === 0}
              fetchPriority="high"
            />
          ) : (
            <span className={styles.none}>No photograph yet</span>
          )}
          {showViewer && !current ? (
            <div className={styles.viewer}>
              <ProductViewer imageUrl={null} productType={productType} title={title} />
            </div>
          ) : null}
        </div>
      </ViewTransition>

      {images.length > 1 ? (
        <ul className={styles.thumbs} aria-label="Photographs">
          {images.map((img, i) => (
            <li key={img.url}>
              <button type="button" className={styles.thumb} onClick={() => setIndex(i)} aria-label={`Photograph ${i + 1} of ${images.length}`} aria-current={i === index ? "true" : undefined}>
                <Image src={img.url} alt="" fill sizes="80px" className={styles.thumbImg} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
