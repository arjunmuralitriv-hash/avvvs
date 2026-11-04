import type { BookingField } from "./schema";

export type BookingResult =
  | {
      ok: true;
      ref: string;
      /** Whether the patient's confirmation email went out. */
      emailed: boolean;
      summary: { name: string; dateLabel: string; slotLabel: string };
    }
  | {
      ok: false;
      formError: string;
      fieldErrors?: Partial<Record<BookingField, string>>;
      /** Show the call and WhatsApp links with the error. */
      contact?: boolean;
      /** Submitted text values, so a no-JavaScript visitor does not retype everything. */
      values?: Partial<Record<BookingField, string>>;
    };
