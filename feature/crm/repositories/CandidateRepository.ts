import type { CandidateRecord } from "../models/CandidateRecord";

export interface CandidateRepository {
  getAll(): Promise<CandidateRecord[]>;

  getById(
    id: string,
  ): Promise<CandidateRecord | null>;

  save(
    candidate: CandidateRecord,
  ): Promise<void>;
}