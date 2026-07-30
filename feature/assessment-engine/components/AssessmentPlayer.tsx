"use client";

import { useMemo } from "react";

import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";

import { SeedAssessmentRepository } from "../repositories/AssessmentRepository";
import { useAssessmentRuntime } from "../hooks/useAssessmentRuntime";

type Props = {
  assessmentId: string;
};

export function AssessmentPlayer({
  assessmentId,
}: Props) {
  const repository = useMemo(
    () => new SeedAssessmentRepository(),
    [],
  );

  const { runtime, loading } = useAssessmentRuntime(
    repository,
    assessmentId,
  );

  if (loading) {
    return (
      <div className="rounded-lg border p-8">
        Loading assessment...
      </div>
    );
  }

  if (!runtime) {
    return (
      <div className="rounded-lg border p-8">
        Assessment not found.
      </div>
    );
  }

  const snapshot = runtime.snapshot();
  const question = runtime.currentQuestion();

  if (!question) {
    return (
      <div className="rounded-lg border p-8">
        No questions available.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">
          {snapshot.assessment.name}
        </h1>

        {snapshot.assessment.description && (
          <p className="mt-2 text-gray-600">
            {snapshot.assessment.description}
          </p>
        )}
      </header>

      <ProgressBar
        current={snapshot.progress.answeredQuestions}
        total={snapshot.progress.totalQuestions}
      />

      <QuestionCard question={question} />

      <div className="flex justify-end">
        <button
          disabled
          className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}