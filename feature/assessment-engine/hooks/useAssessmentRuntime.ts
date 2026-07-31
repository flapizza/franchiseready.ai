"use client";

import { useEffect, useMemo, useState } from "react";

import type { Response } from "../types/domain";

import { AssessmentRuntime } from "../runtime/AssessmentRuntime";
import { AssessmentRepository } from "../repositories/AssessmentRepository";

export function useAssessmentRuntime(
  repository: AssessmentRepository,
  assessmentId: string,
) {
  const [runtime, setRuntime] = useState<AssessmentRuntime | null>(null);
  const [loading, setLoading] = useState(true);

  // Used only to trigger React renders after runtime mutations.
  const [, setVersion] = useState(0);

  useEffect(() => {
    async function initialize() {
      setLoading(true);

      const assessment = await repository.getAssessmentById(assessmentId);

      if (!assessment) {
        setRuntime(null);
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

  const refresh = () => {
    setVersion((v) => v + 1);
  };

  const answerCurrentQuestion = (value: Response["value"]) => {
    if (!runtime) return;

    runtime.answerCurrentQuestion(value);
    refresh();
  };

  const next = () => {
    if (!runtime) return;

    runtime.next();
    refresh();
  };

  const previous = () => {
    if (!runtime) return;

    runtime.previous();
    refresh();
  };

  return useMemo(
    () => ({
      runtime,
      loading,
      answerCurrentQuestion,
      next,
      previous,
    }),
    [runtime, loading],
  );
}