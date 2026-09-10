import "server-only";
import { createHash, randomBytes } from "node:crypto";

export function createAssessmentToken() { return randomBytes(32).toString("base64url"); }
export function assessmentInvitationUrl(origin: string, token: string) {
 hashAssessmentToken(token);
 return new URL(`/assessment/invitation/${token}`, origin).toString();
}
export function hashAssessmentToken(token: string) {
 if(typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw new Error("Assessment link unavailable.");
 return createHash("sha256").update(token, "utf8").digest("hex");
}
