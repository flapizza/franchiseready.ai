import type { CandidateRecord } from "../models/CandidateRecord";

export interface CandidateRepository {
  getAll(): Promise<CandidateRecord[]>;

  getById(
    id: string,
  ): Promise<CandidateRecord | null>;

  findByNormalizedEmail(
    consultantId: string,
    normalizedEmail: string,
  ): Promise<CandidateRecord[]>;

  findByNormalizedPhone(
    consultantId: string,
    normalizedPhone: string,
  ): Promise<CandidateRecord[]>;

  save(
    candidate: CandidateRecord,
  ): Promise<CandidateRecord>;
}
