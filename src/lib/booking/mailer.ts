import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { clinic } from "@/lib/site";
import { doctorName, longDate, slotLabel } from "./format";
import { normalisePhone, type BookingData } from "./schema";

type Transport = { transporter: Transporter; from: string; dev: boolean };
export type MailResult = { ok: true; emailed: boolean; previews: string[] } | { ok: false; reason: "not-configured" | "send-failed" };

const g = globalThis as unknown as { __avvvsDevMail?: Promise<Transport> };

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
/** Header-safe single line. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

async function getTransport(): Promise<Transport | null> {
  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.SMTP_FROM?.trim() || `AVVVS Clinic <${clinic.email}>`;
  if (host) {
    const port = Number(process.env.SMTP_PORT) || 465;
    const user = process.env.SMTP_USER?.trim();
    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user ? { user, pass: process.env.SMTP_PASS ?? "" } : undefined,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      }),
      from,
      dev: false,
    };
  }
  if (process.env.NODE_ENV === "production") return null;
  // Development without SMTP: Ethereal catches every message, so the clinic is never emailed from dev.
  g.__avvvsDevMail ??= nodemailer.createTestAccount().then((acct) => ({
    transporter: nodemailer.createTransport({
      host: acct.smtp.host,
      port: acct.smtp.port,
      secure: acct.smtp.secure,
      auth: { user: acct.user, pass: acct.pass },
    }),
    from,
    dev: true,
  }));
  try {
    return await g.__avvvsDevMail;
  } catch {
    g.__avvvsDevMail = undefined;
    throw new Error("ethereal-unavailable");
  }
}

function rows(d: BookingData, ref: string, phone: string): [string, string][] {
  const out: [string, string][] = [
    ["Reference", ref],
    ["Name", `${d.firstName} ${d.lastName}`],
    ["Email", d.email],
    ["Phone", phone],
    ["Preferred date", longDate(d.date)],
    ["Time slot", slotLabel(d.slot)],
    ["Doctor", doctorName(d.doctor)],
  ];
  if (d.dob) out.push(["Date of birth", longDate(d.dob)]);
  if (d.gender) out.push(["Gender", d.gender[0].toUpperCase() + d.gender.slice(1)]);
  if (d.place) out.push(["Place", d.place]);
  if (d.reason) out.push(["Reason for visit", d.reason]);
  out.push(["Consent", "Agreed that AVVVS may contact them about this appointment"]);
  return out;
}

const table = (r: [string, string][]) =>
  `<table cellpadding="6" cellspacing="0" style="border-collapse:collapse">${r
    .map(
      ([k, v]) =>
        `<tr><th align="left" valign="top" style="border-bottom:1px solid silver;white-space:nowrap">${esc(k)}</th><td style="border-bottom:1px solid silver;white-space:pre-wrap">${esc(v)}</td></tr>`,
    )
    .join("")}</table>`;

const addressLines = [clinic.name, clinic.street, `${clinic.locality}, ${clinic.city}, ${clinic.region} ${clinic.postalCode}`, clinic.landmark];

export async function sendBookingEmails(d: BookingData, ref: string): Promise<MailResult> {
  let t: Transport | null;
  try {
    t = await getTransport();
  } catch {
    return { ok: false, reason: "send-failed" };
  }
  if (!t) {
    console.error(`[booking ${ref}] SMTP_HOST is not set in production; request not sent`);
    return { ok: false, reason: "not-configured" };
  }
  const transport = t;

  const phone = normalisePhone(d.phone) ?? d.phone;
  const fullName = oneLine(`${d.firstName} ${d.lastName}`);
  const to = process.env.BOOKING_TO?.trim() || clinic.email;
  const r = rows(d, ref, phone);
  const previews: string[] = [];
  const preview = (info: unknown) => {
    const url = transport.dev ? nodemailer.getTestMessageUrl(info as never) : false;
    if (url) previews.push(url);
  };

  // (a) the request, to the clinic
  try {
    const info = await transport.transporter.sendMail({
      from: transport.from,
      to,
      replyTo: { name: fullName, address: d.email },
      subject: `Consultation request: ${fullName}, ${d.date}, ${slotLabel(d.slot)}`,
      text: `New consultation request\n\n${r.map(([k, v]) => `${k}: ${v}`).join("\n")}\n`,
      html: `<p>New consultation request</p>${table(r)}`,
    });
    preview(info);
  } catch (e) {
    console.error(`[booking ${ref}] clinic email failed: ${(e as { code?: string }).code ?? "error"}`);
    return { ok: false, reason: "send-failed" };
  }

  // (b) the confirmation, to the patient. The clinic already has the request, so a failure here is not fatal.
  let emailed = true;
  try {
    const mine = r.filter(([k]) => ["Reference", "Preferred date", "Time slot", "Doctor", "Phone"].includes(k));
    const phonesText = clinic.phones.join(" or ");
    const info = await transport.transporter.sendMail({
      from: transport.from,
      to: { name: fullName, address: d.email },
      replyTo: to,
      subject: `Your consultation request, ${ref}`,
      text: [
        `Dear ${d.firstName},`,
        "",
        "We have received your consultation request.",
        "",
        ...mine.map(([k, v]) => `${k}: ${v}`),
        "",
        "The clinic will call to confirm your appointment.",
        `To change or cancel it, call ${phonesText} and quote ${ref}.`,
        "",
        ...addressLines,
      ].join("\n"),
      html: `<p>Dear ${esc(d.firstName)},</p><p>We have received your consultation request.</p>${table(mine)}<p>The clinic will call to confirm your appointment.</p><p>To change or cancel it, call ${esc(phonesText)} and quote ${esc(ref)}.</p><p>${addressLines.map(esc).join("<br>")}</p>`,
    });
    preview(info);
  } catch (e) {
    emailed = false;
    console.error(`[booking ${ref}] confirmation email failed: ${(e as { code?: string }).code ?? "error"}`);
  }

  for (const url of previews) console.log(`[booking ${ref}] Ethereal preview: ${url}`);
  return { ok: true, emailed, previews };
}
