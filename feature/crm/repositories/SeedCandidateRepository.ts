import type { CandidateRecord } from "../models/CandidateRecord";
import type { CandidateRepository } from "./CandidateRepository";

import { demoProfile } from "@/feature/intelligence/data/demoProfile";

export class SeedCandidateRepository
  implements CandidateRepository
{
  private readonly candidates: CandidateRecord[] = [
    {
      id: "candidate-demo",

      firstName: "John",
      lastName: "Smith",

      email: "john@example.com",
      phone: "(555) 555-1234",

      city: "Greensboro",
      state: "NC",
      country: "USA",

      consultantId: "consultant-demo",

      status: "active",

      pipelineStage: "discovery",

      healthScore: 92,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),

      intelligence: demoProfile,
    },
  ];

  async getAll(): Promise<CandidateRecord[]> {
    return this.candidates;
  }

  async getById(
    id: string,
  ): Promise<CandidateRecord | null> {
    return (
      this.candidates.find(
        (candidate) => candidate.id === id,
      ) ?? null
    );
  }

  async save(
    candidate: CandidateRecord,
  ): Promise<void> {
    const index = this.candidates.findIndex(
      (c) => c.id === candidate.id,
    );

    if (index >= 0) {
      this.candidates[index] = candidate;
      return;
    }

    this.candidates.push(candidate);
  }
}