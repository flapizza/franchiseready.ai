import type { CandidateDNA } from "../models/CandidateDNA";
import type { AssessmentResponse } from "../models/AssessmentResponse";

export class CandidateDNARuntime {
  public build(
    responses: AssessmentResponse[],
  ): CandidateDNA {
    return {
      identity: {
        confidence: 100,
        evidence: [],
      },

      motivation: {
        score: 50,
        drivers: [],
        evidence: [],
      },

      financial: {
        readiness: 50,
        investmentRange: "",
        financingLikelihood: 50,
        evidence: [],
      },

      leadership: {
        readiness: 50,
        style: "",
        evidence: [],
      },

      sales: {
        readiness: 50,
        evidence: [],
      },

      operations: {
        readiness: 50,
        evidence: [],
      },

      lifestyle: {
        preferences: [],
        evidence: [],
      },

      risk: {
        score: 0,
        concerns: [],
      },

      buying: {
        confidence: 50,
        urgency: 50,
        readiness: 50,
      },

      brand: {
        preferredModels: [],
        preferredIndustries: [],
        recurringRevenue: false,
        employeePreference: "medium",
      },
    };
  }
}