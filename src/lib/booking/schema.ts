// One zod schema for the booking form, used by the browser (react-hook-form) and by the server action.
// Dates are plain "YYYY-MM-DD" strings. "Today" is always the clinic's day (Asia/Kolkata).
import { z } from "zod";
import { clinic } from "@/lib/site";

type SlotId = (typeof clinic.timeSlots)[number]["id"];
type DoctorId = (typeof clinic.doctors)[number]["id"];
export const slotIds = clinic.timeSlots.map((s) => s.id) as [SlotId, ...SlotId[]];
export const doctorIds = clinic.doctors.map((d) => d.id) as [DoctorId, ...DoctorId[]];

export const MAX_DAYS_AHEAD = 90;
export const REASON_MAX = 500;

const istDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today's date at the clinic, "YYYY-MM-DD". Call at runtime only (never while prerendering). */
export const todayIST = () => istDay.format(new Date());

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function isRealDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/**
 * Returns "+91XXXXXXXXXX" for Indian numbers (accepts +91, 91, 0 prefixes, spaces, dashes, brackets),
 * "+<digits>" for international numbers that start with +, or null when it is not a usable number.
 */
export function normalisePhone(raw: string): string | null {
  const cleaned = raw.trim().replace(/[\s\-().]/g, "");
  if (!/^\+?\d+$/.test(cleaned)) return null;
  const indian = (n: string) => (/^[1-9]\d{9}$/.test(n) ? `+91${n}` : null);
  if (cleaned.startsWith("+")) {
    const digits = cleaned.slice(1);
    if (digits.startsWith("91")) return indian(digits.slice(2));
    return /^[1-9]\d{6,14}$/.test(digits) ? `+${digits}` : null;
  }
  if (cleaned.length === 10) return indian(cleaned);
  if (cleaned.length === 11 && cleaned.startsWith("0")) return indian(cleaned.slice(1));
  if (cleaned.length === 12 && cleaned.startsWith("91")) return indian(cleaned.slice(2));
  return null;
}

const name = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter your ${label}`)
    .max(60, "Use 60 characters or fewer");

export const bookingSchema = z.object({
  firstName: name("first name"),
  lastName: name("last name"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address")
    .max(254, "Use 254 characters or fewer")
    .pipe(z.email("Enter a valid email address, like name@example.com")),
  dob: z
    .string()
    .trim()
    .superRefine((v, ctx) => {
      if (v === "") return;
      if (!isRealDate(v)) return ctx.addIssue({ code: "custom", message: "Enter a valid date" });
      if (v >= todayIST() || v < "1900-01-01") ctx.addIssue({ code: "custom", message: "Enter a date of birth in the past" });
    }),
  gender: z.enum(["", "male", "female", "other"], { error: "Choose one of the options" }),
  place: z.string().trim().max(80, "Use 80 characters or fewer"),
  doctor: z.enum(doctorIds, { error: "Choose a doctor" }),
  slot: z.enum(slotIds, { error: "Choose a time slot" }),
  phone: z
    .string()
    .trim()
    .min(1, "Enter your phone number")
    .refine((v) => normalisePhone(v) !== null, "Enter a 10-digit mobile number, or an international number starting with +"),
  date: z
    .string()
    .trim()
    .superRefine((v, ctx) => {
      if (v === "") return ctx.addIssue({ code: "custom", message: "Choose a preferred date" });
      if (!isRealDate(v)) return ctx.addIssue({ code: "custom", message: "Enter a valid date" });
      const today = todayIST();
      if (v < today) return ctx.addIssue({ code: "custom", message: "Choose today or a later date" });
      if (v > addDays(today, MAX_DAYS_AHEAD))
        ctx.addIssue({ code: "custom", message: `Choose a date within the next ${MAX_DAYS_AHEAD} days` });
    }),
  reason: z.string().trim().max(REASON_MAX, `Use ${REASON_MAX} characters or fewer`),
  consent: z.boolean().refine((v) => v === true, "Please agree so the clinic can contact you"),
  /** Honeypot. Hidden from people; bots fill it. The server answers a filled one with a fake success. */
  website: z.string(),
});

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingData = z.output<typeof bookingSchema>;
export type BookingField = keyof BookingInput;
