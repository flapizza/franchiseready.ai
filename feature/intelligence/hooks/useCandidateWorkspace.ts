"use client";

import { useMemo } from "react";

import type { Response } from "@/feature/assessment-engine/types/domain";

import type { FinancialProfile } from "../services/FinancialAnalysisService";
import type { CandidateWorkspaceData } from "../services/CandidateWorkspaceService";

import { IntelligenceEngine } from "../engines/IntelligenceEngine";
import { CandidateWorkspaceService } from "../services/CandidateWorkspaceService";

export interface UseCandidateWorkspaceInput {
  candidateName: string;

  responses: Response[];

  financialProfile: FinancialProfile;
}

export function useCandidateWorkspace(
  input: UseCandidateWorkspaceInput,
): CandidateWorkspaceData {

  return useMemo(() => {

    const intelligenceEngine =
      new IntelligenceEngine();

    const workspaceService =
      new CandidateWorkspaceService();

    const intelligence =
      intelligenceEngine.build({
        responses: input.responses,
        financialProfile: input.financialProfile,
      });

    return workspaceService.build(
      input.candidateName,
      intelligence,
    );

  }, [input]);
}