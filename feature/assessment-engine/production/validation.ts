import { concernExclusive, concernOptions, conferenceQuestions, geographyOptions, ownershipStageOptions, stakeholderOptions } from "../conference/questions";
import { validateConferenceSubmission } from "../conference/validation";
import type { AssessmentProgress } from "./types";

export const intakeFields = ["firstName", "preferredName", "lastName", "email", "mobilePhone", "streetAddress", "addressLine2", "city", "stateProvince", "postalCode", "country", "occupationTitle", "currentEmployer", "linkedInProfile", "ownedBusinessBefore", "ownershipExperience", "exploredFranchiseBefore", "preferredContactMethod", "bestContactTime"];
export const intakeEnums: Record<string, string[]> = { ownedBusinessBefore: ["yes", "no"], exploredFranchiseBefore: ["yes", "no"], preferredContactMethod: ["phone", "text", "email"], bestContactTime: ["morning", "afternoon", "evening"] };
export const responseContract = Object.fromEntries([
 ...conferenceQuestions.filter(q => q.kind !== "context").map(q => [q.id, { kind: q.kind, options: q.options, primaryOf: q.primaryOf, exclusive: q.exclusive }] as const),
 ["q36-geography", { kind: "single", options: geographyOptions }],
 ["q36-stakeholders", { kind: "multi", options: stakeholderOptions, exclusive: ["Decision is primarily mine"] }],
 ["q36-stage", { kind: "single", options: ownershipStageOptions }],
 ["concerns", { kind: "multi", options: concernOptions, exclusive: [concernExclusive] }],
 ["primary-concern", { kind: "single", primaryOf: "concerns" }],
]) as Record<string, {kind: string; options?: string[]; primaryOf?: string; exclusive?: string[]}>;
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);

export function isAssessmentProgress(value: unknown): value is AssessmentProgress {
 if (!object(value) || JSON.stringify(value).length > 32000 || Object.keys(value).sort().join() !== "answers,consent,intake,section,stage,startedAt") return false;
 if (!["intake", "intro", "assessment", "concerns"].includes(String(value.stage)) || !Number.isInteger(value.section) || Number(value.section) < 1 || Number(value.section) > 6 || typeof value.consent !== "boolean" || typeof value.startedAt !== "string" || value.startedAt.length > 40 || !Number.isFinite(Date.parse(value.startedAt))) return false;
 if (!object(value.intake) || !object(value.answers)) return false;
 for (const [key, item] of Object.entries(value.intake)) if (!intakeFields.includes(key) || typeof item !== "string" || item.length > 500 || (intakeEnums[key] && !intakeEnums[key].includes(item))) return false;
 for (const [key, items] of Object.entries(value.answers)) {
  const rule = responseContract[key];
  if (!Object.hasOwn(responseContract, key) || !rule || !Array.isArray(items) || items.length > 20 || items.some(item => typeof item !== "string") || new Set(items).size !== items.length || (rule.kind === "single" && items.length > 1)) return false;
  const allowed = rule.primaryOf ? value.answers[rule.primaryOf] : rule.options;
  if (items.some(item => !Array.isArray(allowed) || !allowed.includes(item)) || (items.length > 1 && items.some(item => rule.exclusive?.includes(item)))) return false;
 }
 return true;
}

export function submissionErrors(value: unknown): string[] {
 if (!isAssessmentProgress(value)) return ["Invalid assessment responses. Please review your answers."];
 return validateConferenceSubmission(value.intake, value.answers, value.consent);
}
