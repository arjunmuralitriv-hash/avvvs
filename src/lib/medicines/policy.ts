import type { Gate, LabelFacts, TriState } from "./types";

export const E1_UNKNOWN_IS_GATED = false;
export const FORMS_GLOSS_APPROVED = false;
export const INDICATIONS_ENABLED = false;
export const STANDARD_CAUTION_APPROVED = false;
export const whatsappPhoneIndex = 0;

export function gateFor(m: { scheduleE1: TriState; label: LabelFacts | null }): Gate {
  if (m.scheduleE1 === "yes") return { kind: "consult", reason: "schedule-e1" };
  if (m.scheduleE1 === "unknown" && E1_UNKNOWN_IS_GATED) return { kind: "consult", reason: "schedule-e1-unknown" };
  if (m.label?.prescriptionRequired) return { kind: "consult", reason: "prescription" };
  return { kind: "none" };
}

