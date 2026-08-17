"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  const answerCurrentQuestion = useCallback((value: Response["value"]) => {
    if (!runtime) return;

    runtime.answerCurrentQuestion(value);
    refresh();
  }, [refresh, runtime]);

  const next = useCallback(() => {
    if (!runtime) return;

    runtime.next();
    refresh();
  }, [refresh, runtime]);

  const previous = useCallback(() => {
    if (!runtime) return;

    runtime.previous();
    refresh();
  }, [refresh, runtime]);

  return useMemo(
    () => ({
      runtime,
      loading,
      answerCurrentQuestion,
      next,
      previous,
    }),
    [answerCurrentQuestion, loading, next, previous, runtime],
  );
}
