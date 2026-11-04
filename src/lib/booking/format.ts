import { clinic } from "@/lib/site";

export const slotLabel = (id: string) => clinic.timeSlots.find((s) => s.id === id)?.label ?? id;
export const doctorName = (id: string) => clinic.doctors.find((d) => d.id === id)?.name ?? id;

/** "Tuesday, 10 November 2026" from "2026-11-10". */
export function longDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}
