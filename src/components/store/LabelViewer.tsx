"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useZoomPan } from "@/components/ui/useZoomPan";
import styles from "./LabelViewer.module.css";

export function LabelViewer({
  labelUrl,
  medicineName,
}: {
  labelUrl: string;
  medicineName: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { ref, scale, pos, zoomIn, zoomOut, reset, handlers } = useZoomPan({
    maxScale: 3,
  });

  const openModal = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const closeModal = useCallback(() => {
    dialogRef.current?.close();
    reset();
  }, [reset]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [closeModal]);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="btn"
        aria-haspopup="dialog"
      >
        Read the physical label
      </button>

      <dialog ref={dialogRef} className={styles.dialog} onClick={(e) => {
        if (e.target === dialogRef.current) closeModal();
      }}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.titleWrap}>
              <h2 className={styles.title}>Physical label &mdash; {medicineName}</h2>
              <p className={styles.subtitle}>
                Official printed label. Use mouse wheel, buttons or pinch to zoom.
              </p>
            </div>
            <div className={styles.controls}>
              <button
                type="button"
                onClick={zoomIn}
                className="btn"
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                onClick={zoomOut}
                className="btn"
                aria-label="Zoom out"
              >
                &minus;
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="btn btn--primary"
              >
                Close
              </button>
            </div>
          </div>

          <div
            ref={ref}
            className={styles.canvas}
            {...handlers}
            style={{ cursor: scale > 1 ? "grab" : "default" }}
          >
            <div
              className={styles.imageWrap}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                transformOrigin: "center center",
              }}
            >
              <Image
                src={labelUrl}
                alt={`Official label of ${medicineName}`}
                width={1200}
                height={1600}
                className={styles.image}
                priority
              />
            </div>
          </div>

          <div className={styles.footer}>
            <p className={styles.note}>
              Photograph of the official printed label. If any online transcript
              differs, the physical packaging remains authoritative.
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
