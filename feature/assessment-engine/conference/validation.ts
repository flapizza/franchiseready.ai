import { concernExclusive, concernOptions, conferenceQuestions, geographyOptions, ownershipStageOptions, stakeholderOptions } from "./questions.ts";
import type { ConferenceAnswers, ConferenceIntake } from "./types";

export function applyExclusiveSelection(current: string[], value: string, exclusive: string[] = []) {
  if (exclusive.includes(value)) return [value];
  return current.filter((item) => !exclusive.includes(item)).includes(value) ? current.filter((item) => item !== value) : [...current.filter((item) => !exclusive.includes(item)), value];
}

export function validateConferenceSubmission(intake: ConferenceIntake, answers: ConferenceAnswers, consent: boolean) {
  const requiredIntake: (keyof ConferenceIntake)[] = ["firstName", "lastName", "email", "mobilePhone", "streetAddress", "city", "stateProvince", "postalCode", "country", "occupationTitle", "ownedBusinessBefore", "exploredFranchiseBefore", "preferredContactMethod", "bestContactTime"];
  const errors: string[] = [];
  for (const field of requiredIntake) if (!String(intake[field] ?? "").trim()) errors.push(`Missing ${field}`);
  if (!/^\S+@\S+\.\S+$/.test(intake.email)) errors.push("Enter a valid email address");
  if (Object.values(intake).some((value) => String(value ?? "").length > 500)) errors.push("An intake value is too long");
  if (!consent) errors.push("Consent is required");
  for (const question of conferenceQuestions) {
    if (question.kind === "context") continue;
    const parentId = question.primaryOf;
    if (parentId && answers[parentId]?.length === 1 && answers[parentId][0] === "I'm still figuring that out") continue;
    if (!answers[question.id]?.length) errors.push(`Missing ${question.id}`);
    if (parentId && answers[question.id]?.some((item) => !answers[parentId]?.includes(item))) errors.push(`${question.id} must use a prior selection`);
    if (!parentId && question.options && answers[question.id]?.some((item) => !question.options?.includes(item))) errors.push(`Invalid ${question.id}`);
  }
  for (const id of ["q36-geography", "q36-stakeholders", "q36-stage", "concerns"]) if (!answers[id]?.length) errors.push(`Missing ${id}`);
  if (!(answers.concerns?.length === 1 && answers.concerns[0] === concernExclusive) && !answers["primary-concern"]?.length) errors.push("Missing primary concern");
  const allowedSpecial: Record<string, string[]> = { "q36-geography": geographyOptions, "q36-stakeholders": stakeholderOptions, "q36-stage": ownershipStageOptions, concerns: concernOptions, "primary-concern": answers.concerns ?? [] };
  for (const [id, options] of Object.entries(allowedSpecial)) if (answers[id]?.some((item) => !options.includes(item))) errors.push(`Invalid ${id}`);
  return errors;
}
