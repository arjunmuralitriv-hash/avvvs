import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { z } from "zod";

/**
 * Shopify webhook -> on-demand revalidation of the cached catalogue.
 *
 * Setup:
 *  1. Shopify admin -> Settings -> Notifications -> Webhooks (or a custom app's webhook subscriptions).
 *  2. Create webhooks for products/create, products/update, products/delete, collections/update.
 *     Format JSON, URL https://<site>/api/shopify/revalidate, the same API version as SHOPIFY_API_VERSION.
 *  3. Copy the "signing secret" shown on that page (custom apps: the app's client secret).
 *     Put it in the environment as SHOPIFY_WEBHOOK_SECRET and redeploy.
 *  4. Send a test notification from Shopify. A 200 {revalidated: [...]} response means the HMAC verified.
 *
 * Security: the body is verified with HMAC-SHA256 (X-Shopify-Hmac-Sha256, base64) over the raw request body.
 * If SHOPIFY_WEBHOOK_SECRET is not set, every request is rejected (503); this endpoint never runs unauthenticated.
 */

const body = z.object({ handle: z.string().min(1).max(255).optional() });

function verified(raw: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const expected = createHmac("sha256", secret).update(raw, "utf8").digest();
  const given = Buffer.from(header, "base64");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Webhook is not configured." }, { status: 503 });

  const raw = await request.text();
  if (!verified(raw, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  let handle: string | undefined;
  try {
    const parsed = body.safeParse(JSON.parse(raw));
    if (parsed.success) handle = parsed.data.handle;
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const tags = ["products", ...(handle ? [`product:${handle}`] : [])];
  for (const tag of tags) revalidateTag(tag, "max");
  return Response.json({ revalidated: tags, topic: request.headers.get("x-shopify-topic") });
}

export function GET() {
  return Response.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
}
