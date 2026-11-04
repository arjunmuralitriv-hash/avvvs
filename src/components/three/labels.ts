// Label textures: plain brand-colour labels, and the real Shopify product photographs when they can be fetched.
import * as THREE from "three";
import { palette } from "./palette";

const css = (c: THREE.Color) => c.getStyle();

export function plainLabel(text: string, band: THREE.Color = palette().accent, aspect = 2): THREE.CanvasTexture {
  const P = palette();
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = Math.round(256 / aspect);
  const c = cv.getContext("2d") as CanvasRenderingContext2D;
  c.fillStyle = css(P.paper);
  c.fillRect(0, 0, 256, cv.height);
  c.fillStyle = css(band);
  const H = cv.height;
  c.fillRect(0, H * 0.27, 256, H * 0.47);
  c.fillStyle = css(P.brass);
  c.fillRect(0, H * 0.2, 256, 3);
  c.fillRect(0, H * 0.77, 256, 3);
  c.fillStyle = css(P.paper);
  c.font = "600 30px Georgia, 'Times New Roman', serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(text.toUpperCase(), 128, H * 0.5);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export type ShopImages = Record<string, string[]>;
let shopPromise: Promise<ShopImages> | null = null;

/** product_type -> image URLs, from the public Shopify catalogue. Resolves to {} if the request is blocked. */
export function fetchShopImages(): Promise<ShopImages> {
  shopPromise ??= fetch("https://avvvsglobal.com/products.json?limit=60")
    .then((r) => (r.ok ? r.json() : { products: [] }))
    .then((j: { products?: { product_type?: string; images?: { src?: string }[] }[] }) => {
      const out: ShopImages = {};
      for (const p of j.products ?? []) {
        const src = p.images?.[0]?.src;
        if (src && p.product_type) (out[p.product_type.toUpperCase()] ??= []).push(src);
      }
      return out;
    })
    .catch(() => ({}) as ShopImages);
  return shopPromise;
}

/** Load an image as a label texture, cropped to cover the given label aspect (width / height). */
export function loadLabelTexture(url: string, aspect: number, width = 320): Promise<THREE.Texture | null> {
  const src = url + (url.includes("?") ? "&" : "?") + "width=" + width;
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      src,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        const img = t.image as { width: number; height: number };
        const a = img.width / img.height;
        if (a > aspect) {
          t.repeat.set(aspect / a, 1);
          t.offset.set((1 - aspect / a) / 2, 0);
        } else {
          t.repeat.set(1, a / aspect);
          t.offset.set(0, (1 - a / aspect) / 2);
        }
        resolve(t);
      },
      undefined,
      () => resolve(null),
    );
  });
}

/** Ledger-style plain label: AVVVS across the top, a brass rule, then the product title, wrapped over up to three lines. */
export function ledgerLabel(title: string, aspect = 2): THREE.CanvasTexture {
  const P = palette();
  const W = 512;
  const H = Math.round(W / aspect);
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const c = cv.getContext("2d") as CanvasRenderingContext2D;
  c.fillStyle = css(P.paper);
  c.fillRect(0, 0, W, H);
  c.fillStyle = css(P.accent);
  c.fillRect(0, 0, W, H * 0.2);
  c.fillStyle = css(P.paper);
  c.font = `600 ${Math.round(H * 0.12)}px Georgia, 'Times New Roman', serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText("AVVVS", W / 2, H * 0.105);
  c.fillStyle = css(P.brass);
  c.fillRect(W * 0.08, H * 0.25, W * 0.84, 3);
  c.fillRect(W * 0.08, H * 0.93, W * 0.84, 3);
  // wrap the title
  const size = Math.round(H * 0.15);
  c.font = `600 ${size}px Georgia, 'Times New Roman', serif`;
  c.fillStyle = css(P.ink);
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (c.measureText(t).width > W * 0.84 && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  const shown = lines.slice(0, 3);
  const top = H * 0.3;
  const step = (H * 0.6) / Math.max(shown.length, 2.2);
  shown.forEach((l, i) => c.fillText(l, W / 2, top + step * (i + 0.5)));
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
