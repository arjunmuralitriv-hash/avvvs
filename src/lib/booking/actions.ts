"use server";

import { randomInt } from "node:crypto";
import { headers } from "next/headers";
import { clinic } from "@/lib/site";
import { doctorName, longDate, slotLabel } from "./format";
import { sendBookingEmails } from "./mailer";
import { consume } from "./rate-limit";
import { bookingSchema, type BookingField } from "./schema";
import type { BookingResult } from "./types";

const CALL_US = `Please call ${clinic.phones.join(" or ")}, or message us on WhatsApp.`;
// No 0/O/1/I so a reference read out over the phone is not misheard.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const makeRef = () => "AV-" + Array.from({ length: 5 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

const TEXT_FIELDS = ["firstName", "lastName", "email", "dob", "gender", "place", "doctor", "slot", "phone", "date", "reason", "website"] as const;

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function submitBooking(_prev: BookingResult | null, formData: FormData): Promise<BookingResult> {
  const raw: Record<string, string> = {};
  for (const k of TEXT_FIELDS) {
    const v = formData.get(k);
    raw[k] = typeof v === "string" ? v : "";
  }

  // Honeypot: look like a success, send nothing, count nothing.
  if (raw.website.trim() !== "") {
    const ref = makeRef();
    console.warn(`[booking ${ref}] honeypot filled; dropped`);
    return { ok: true, ref, emailed: false, summary: { name: raw.firstName.slice(0, 60), dateLabel: raw.date.slice(0, 10), slotLabel: slotLabel(raw.slot) } };
  }

  const parsed = bookingSchema.safeParse({ ...raw, consent: formData.get("consent") === "on" });
  if (!parsed.success) {
    const fieldErrors: Partial<Record<BookingField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as BookingField | undefined;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, formError: "Please check the highlighted fields and send again.", fieldErrors, values: raw };
  }

  const limit = consume(await clientIp());
  if (!limit.ok) {
    const mins = Math.max(1, Math.ceil(limit.retryAfterSec / 60));
    return {
      ok: false,
      formError: `Too many requests from this connection. Please try again in ${mins} ${mins === 1 ? "minute" : "minutes"}, or call ${clinic.phones.join(" or ")}, or message us on WhatsApp.`,
      contact: true,
      values: raw,
    };
  }

  const ref = makeRef();
  const d = parsed.data;
  const sent = await sendBookingEmails(d, ref);
  if (!sent.ok) {
    return { ok: false, formError: `We could not send your request just now. ${CALL_US}`, contact: true, values: raw };
  }
  // Reference only. Never log names, phone numbers, emails or the reason for the visit.
  console.log(`[booking ${ref}] sent (${doctorName(d.doctor)}, ${d.date}, ${d.slot})`);
  return {
    ok: true,
    ref,
    emailed: sent.emailed,
    summary: { name: d.firstName, dateLabel: longDate(d.date), slotLabel: slotLabel(d.slot) },
  };
}
