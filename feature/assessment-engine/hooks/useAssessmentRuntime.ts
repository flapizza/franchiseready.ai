"use client";

import { useEffect, useState } from "react";

import { AssessmentRuntime } from "../runtime/AssessmentRuntime";
import { AssessmentRepository } from "../repositories/AssessmentRepository";

export function useAssessmentRuntime(
  repository: AssessmentRepository,
  assessmentId: string
) {
  const [runtime, setRuntime] = useState<AssessmentRuntime | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      const assessment = await repository.getAssessmentById(assessmentId);

      if (!assessment) {
        setLoading(false);
        return;
      }

const player = new AssessmentRuntime(
  assessment,
  {
    id: crypto.randomUUID(),
    assessmentVersionId: assessment.id,
    participantId: "anonymous",
    status: "not-started",
    responses: [],
  },
  {},
);

      player.initialize();

      setRuntime(player);

      setLoading(false);
    }

    initialize();
  }, [assessmentId, repository]);

  return {
    runtime,
    loading,
  };
}