"use client";

import { startTransition, useActionState, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitBooking } from "@/lib/booking/actions";
import { MAX_DAYS_AHEAD, REASON_MAX, addDays, bookingSchema, todayIST, type BookingField, type BookingInput } from "@/lib/booking/schema";
import { clinic, telHref, waHref } from "@/lib/site";
import styles from "./BookingForm.module.css";

const noopSubscribe = () => () => {};
const GENDERS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other" },
] as const;

type Props = {
  /** Short version for the homepage: name, email, phone, date, time slot and consent. */
  compact?: boolean;
  /** Time slot id to preselect. When omitted, ?slot=morning|afternoon in the URL is used. */
  defaultSlot?: string;
};

export function BookingForm({ compact = false, defaultSlot = "" }: Props) {
  const [state, formAction, pending] = useActionState(submitBooking, null);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  // The clinic's "today" is only known in the browser; the server checks the same rule again.
  const today = useSyncExternalStore(noopSubscribe, todayIST, () => "");

  // ?slot=morning|afternoon (from the homepage links). Read in the browser so the page itself stays static.
  const urlSlot = useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get("slot") ?? "",
    () => "",
  );

  const kept = state && !state.ok ? state.values : undefined;
  const slotDefault = kept?.slot ?? (clinic.timeSlots.some((t) => t.id === defaultSlot) ? defaultSlot : "");
  const defaults: BookingInput = {
    firstName: kept?.firstName ?? "",
    lastName: kept?.lastName ?? "",
    email: kept?.email ?? "",
    dob: kept?.dob ?? "",
    gender: (kept?.gender as BookingInput["gender"]) ?? "",
    place: kept?.place ?? "",
    doctor: (kept?.doctor as BookingInput["doctor"]) ?? clinic.doctors[0].id,
    slot: slotDefault as BookingInput["slot"],
    phone: kept?.phone ?? "",
    date: kept?.date ?? "",
    reason: kept?.reason ?? "",
    consent: false,
    website: "",
  };

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<BookingInput>({ resolver: zodResolver(bookingSchema), mode: "onTouched", defaultValues: defaults });

  const alertRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  // Server verdicts land on the same fields as client errors.
  useEffect(() => {
    if (!state || state.ok) return;
    if (state.fieldErrors) {
      (Object.entries(state.fieldErrors) as [BookingField, string][]).forEach(([name, message], i) =>
        setError(name, { type: "server", message }, { shouldFocus: i === 0 }),
      );
    } else {
      alertRef.current?.focus();
    }
  }, [state, setError]);

  useEffect(() => {
    if (!defaultSlot && clinic.timeSlots.some((t) => t.id === urlSlot) && !getValues("slot")) {
      setValue("slot", urlSlot as BookingInput["slot"]);
    }
  }, [urlSlot, defaultSlot, getValues, setValue]);

  useEffect(() => {
    if (state?.ok) successRef.current?.focus();
  }, [state]);

  const reasonLength = (useWatch({ control, name: "reason" }) ?? "").length;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    void handleSubmit(() => {
      const data = new FormData(form);
      startTransition(() => formAction(data));
    })(e);
  };

  if (state?.ok) {
    return (
      <section className={styles.success} aria-labelledby="booking-done">
        <h2 id="booking-done" ref={successRef} tabIndex={-1} className={styles.successTitle}>
          Request received
        </h2>
        <p className={styles.ref}>
          <span className="label">Your reference</span>
          <strong className={styles.refValue}>{state.ref}</strong>
        </p>
        <dl className={styles.summary}>
          <div>
            <dt>Preferred date</dt>
            <dd>{state.summary.dateLabel}</dd>
          </div>
          <div>
            <dt>Time slot</dt>
            <dd className="num">{state.summary.slotLabel}</dd>
          </div>
        </dl>
        <h3 className={styles.nextTitle}>What happens next</h3>
        <ol className={styles.next}>
          <li>The clinic will call you on the number you gave to confirm the date and time.</li>
          {state.emailed ? <li>A copy of this request is on its way to your email address.</li> : null}
          <li>
            To change or cancel, call{" "}
            {clinic.phones.map((p, i) => (
              <span key={p}>
                {i > 0 ? " or " : null}
                <a className="link num" href={telHref(p)}>
                  {p}
                </a>
              </span>
            ))}{" "}
            and quote {state.ref}.
          </li>
        </ol>
      </section>
    );
  }

  // Before hydration (no JavaScript) the server's field errors are shown straight from the action state.
  const serverErrors = !hydrated && state && !state.ok ? state.fieldErrors : undefined;
  const errorOf = (name: BookingField) => errors[name]?.message ?? serverErrors?.[name];

  const field = (name: BookingField) => {
    const err = errorOf(name);
    return {
      id: `bk-${name}`,
      "aria-invalid": err ? (true as const) : undefined,
      "aria-describedby": `bk-${name}-msg`,
    };
  };

  const msg = (name: BookingField, hint?: ReactNode) => (
    <p id={`bk-${name}-msg`} className={styles.msg} data-error={errorOf(name) ? "true" : undefined}>
      {errorOf(name) ?? hint ?? null}
    </p>
  );

  const slotRadios = (
    <fieldset className={styles.group} aria-describedby="bk-slot-msg">
      <legend className={styles.label}>Time slot</legend>
      <div className={styles.segments}>
        {clinic.timeSlots.map((t) => (
          <label key={t.id} className={styles.segment}>
            <input type="radio" value={t.id} defaultChecked={defaults.slot === t.id} {...register("slot")} />
            <span className="num">{t.label}</span>
          </label>
        ))}
      </div>
      {msg("slot")}
    </fieldset>
  );

  return (
    <form
      className={styles.form}
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      aria-label="Consultation request"
      data-compact={compact || undefined}
    >
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="bk-firstName" className={styles.label}>First name</label>
          <input type="text" className={styles.control} autoComplete="given-name" maxLength={60} defaultValue={defaults.firstName} {...field("firstName")} {...register("firstName")} />
          {msg("firstName")}
        </div>
        <div className={styles.field}>
          <label htmlFor="bk-lastName" className={styles.label}>Last name</label>
          <input type="text" className={styles.control} autoComplete="family-name" maxLength={60} defaultValue={defaults.lastName} {...field("lastName")} {...register("lastName")} />
          {msg("lastName")}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="bk-email" className={styles.label}>Email</label>
          <input type="email" inputMode="email" className={styles.control} autoComplete="email" defaultValue={defaults.email} {...field("email")} {...register("email")} />
          {msg("email")}
        </div>
        <div className={styles.field}>
          <label htmlFor="bk-phone" className={styles.label}>Phone number</label>
          <input type="tel" inputMode="tel" className={styles.control} autoComplete="tel" defaultValue={defaults.phone} {...field("phone")} {...register("phone")} />
          {msg("phone", "A 10-digit mobile number. +91 and spaces are fine.")}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="bk-date" className={styles.label}>Preferred date</label>
          <input
            type="date"
            className={styles.control}
            min={today || undefined}
            max={today ? addDays(today, MAX_DAYS_AHEAD) : undefined}
            defaultValue={defaults.date}
            {...field("date")}
            {...register("date")}
          />
          {msg("date", `Within the next ${MAX_DAYS_AHEAD} days.`)}
        </div>
        {compact ? null : (
          <div className={styles.field}>
            <label htmlFor="bk-doctor" className={styles.label}>Doctor</label>
            <select className={styles.control} defaultValue={defaults.doctor} {...field("doctor")} {...register("doctor")}>
              {clinic.doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {msg("doctor")}
          </div>
        )}
      </div>

      {compact ? <input type="hidden" defaultValue={defaults.doctor} {...register("doctor")} /> : null}
      {slotRadios}

      {compact ? null : (
        <>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="bk-dob" className={styles.label}>Date of birth <span className={styles.opt}>(optional)</span></label>
              <input type="date" className={styles.control} max={today || undefined} min="1900-01-01" autoComplete="bday" defaultValue={defaults.dob} {...field("dob")} {...register("dob")} />
              {msg("dob")}
            </div>
            <div className={styles.field}>
              <label htmlFor="bk-place" className={styles.label}>Place <span className={styles.opt}>(optional)</span></label>
              <input type="text" className={styles.control} autoComplete="address-level2" maxLength={80} defaultValue={defaults.place} {...field("place")} {...register("place")} />
              {msg("place")}
            </div>
          </div>

          <fieldset className={styles.group} aria-describedby="bk-gender-msg">
            <legend className={styles.label}>Gender <span className={styles.opt}>(optional)</span></legend>
            <div className={styles.segments}>
              {GENDERS.map((g) => (
                <label key={g.id} className={styles.segment}>
                  <input type="radio" value={g.id} defaultChecked={defaults.gender === g.id} {...register("gender")} />
                  <span>{g.label}</span>
                </label>
              ))}
            </div>
            {msg("gender")}
          </fieldset>

          <div className={styles.field}>
            <label htmlFor="bk-reason" className={styles.label}>Reason for visit <span className={styles.opt}>(optional)</span></label>
            <textarea className={`${styles.control} ${styles.area}`} rows={4} maxLength={REASON_MAX} defaultValue={defaults.reason} {...field("reason")} {...register("reason")} />
            {msg("reason", <span className="num">{reasonLength} of {REASON_MAX} characters</span>)}
          </div>
        </>
      )}

      {/* Honeypot: people never see or reach it. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="bk-website">Website</label>
        <input id="bk-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className={styles.consent}>
        <label className={styles.check}>
          <input
            type="checkbox"
            id="bk-consent"
            aria-invalid={errorOf("consent") ? true : undefined}
            aria-describedby="bk-consent-msg"
            {...register("consent")}
          />
          <span>I agree that AVVVS may contact me about this appointment</span>
        </label>
        {msg("consent")}
      </div>

      {state && !state.ok ? (
        <div ref={alertRef} tabIndex={-1} role="alert" className={styles.alert}>
          <p>{state.formError}</p>
          {state.contact ? (
            <ul className={styles.contactList}>
              {clinic.phones.map((p) => (
                <li key={p}>
                  <a className="btn" href={telHref(p)}>Call <span className="num">{p}</span></a>
                </li>
              ))}
              <li>
                <a className="btn" href={waHref(clinic.phones[0])} rel="noopener">WhatsApp <span className="num">{clinic.phones[0]}</span></a>
              </li>
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className={styles.actions}>
        <button type="submit" className="btn btn--primary" disabled={pending} aria-busy={pending}>
          {pending ? "Sending…" : "Send request"}
        </button>
        <p className={styles.note}>The clinic will call to confirm your appointment.</p>
      </div>
    </form>
  );
}
