import "server-only";

import type { CandidateResolutionRequest, CandidateResolutionResult, CandidateResolutionService } from "./CandidateResolutionService";
import type { CandidateRepository } from "../repositories/CandidateRepository";

export class ProductionCandidateResolutionService implements CandidateResolutionService {
  constructor(private readonly candidates: CandidateRepository) {}
  async resolve(request: CandidateResolutionRequest): Promise<CandidateResolutionResult> {
    if(request.assessmentInvitationId) return {status:"not-found"};
    if(request.trustedCandidateId) {
      const candidate = await this.candidates.getById(request.trustedCandidateId);
      return candidate ? {status:"matched",candidateId:candidate.id,method:"trusted-candidate-id"} : {status:"not-found"};
    }
    for(const method of ["normalized-email","normalized-phone"] as const) {
      const value = method === "normalized-email" ? request.email?.trim().toLowerCase() : request.phone?.replace(/\D/g, "");
      if(!value) continue;
      const rows = method === "normalized-email" ? await this.candidates.findByNormalizedEmail(request.consultantId,value) : await this.candidates.findByNormalizedPhone(request.consultantId,value);
      if(rows.length === 1) return {status:"matched",candidateId:rows[0].id,method};
      if(rows.length > 1) return {status:"ambiguous",candidateIds:rows.map(row=>row.id).sort(),method};
    }
    return {status:"not-found"};
  }
}
