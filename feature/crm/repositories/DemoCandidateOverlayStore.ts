import "server-only";

import type { Activity } from "../models/Activity";
import type { AssessmentInvitation } from "../models/AssessmentInvitation";
import type { CandidateRecord } from "../models/CandidateRecord";
import type { CandidateBrandReferral } from "@/feature/referral-package/models/CandidateBrandReferral";

/**
 * One deliberately isolated, process-local overlay for the conference demo.
 * It never mutates seed fixtures. Restarting the process or calling reset()
 * returns the app to the canonical baseline. Replace this store with durable
 * repository adapters when Supabase persistence is introduced.
 */
class DemoCandidateOverlayStore {
  private readonly candidates = new Map<string, CandidateRecord>();
  private readonly invitations = new Map<string, AssessmentInvitation>();
  private readonly activities = new Map<string, Activity[]>();
  private readonly referrals = new Map<string, CandidateBrandReferral>();

  getCandidates(): CandidateRecord[] { return structuredClone([...this.candidates.values()]); }
  getCandidate(id: string): CandidateRecord | null { const value = this.candidates.get(id); return value ? structuredClone(value) : null; }
  saveCandidate(candidate: CandidateRecord): void { this.candidates.set(candidate.id, structuredClone(candidate)); }

  getInvitation(id: string): AssessmentInvitation | null { const value = this.invitations.get(id); return value ? structuredClone(value) : null; }
  getInvitationByToken(token: string): AssessmentInvitation | null { const value = [...this.invitations.values()].find((item) => item.token === token); return value ? structuredClone(value) : null; }
  getInvitationForCandidate(candidateId: string): AssessmentInvitation | null { const value = [...this.invitations.values()].filter((item) => item.candidateId === candidateId).at(-1); return value ? structuredClone(value) : null; }
  saveInvitation(invitation: AssessmentInvitation): void { this.invitations.set(invitation.id, structuredClone(invitation)); }

  getActivities(candidateId: string): Activity[] { return structuredClone(this.activities.get(candidateId) ?? []); }
  addActivity(activity: Activity): void { this.activities.set(activity.candidateId, [...(this.activities.get(activity.candidateId) ?? []), structuredClone(activity)]); }

  getCandidateReferrals(candidateId: string): CandidateBrandReferral[] { return structuredClone([...this.referrals.values()].filter((item) => item.candidateId === candidateId)); }
  getCandidateReferral(referralId: string): CandidateBrandReferral | null { const value = this.referrals.get(referralId); return value ? structuredClone(value) : null; }
  saveCandidateReferral(referral: CandidateBrandReferral): void { this.referrals.set(referral.referralId, structuredClone(referral)); }

  reset(): void { this.candidates.clear(); this.invitations.clear(); this.activities.clear(); this.referrals.clear(); }
}

const demoGlobal = globalThis as typeof globalThis & {
  __frangrooveDemoCandidateOverlay?: DemoCandidateOverlayStore;
};

/** Next.js may evaluate Server Action and Route Handler bundles separately in
 * development. Anchoring the one overlay on globalThis keeps those bundles on
 * the same deterministic process-local state boundary. */
export const demoCandidateOverlayStore =
  demoGlobal.__frangrooveDemoCandidateOverlay &&
  typeof demoGlobal.__frangrooveDemoCandidateOverlay.getCandidateReferrals === "function"
    ? demoGlobal.__frangrooveDemoCandidateOverlay
    : new DemoCandidateOverlayStore();

demoGlobal.__frangrooveDemoCandidateOverlay = demoCandidateOverlayStore;
