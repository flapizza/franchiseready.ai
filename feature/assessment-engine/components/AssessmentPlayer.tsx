"use client";

import { useMemo, useState } from "react";

import type { Response } from "../types/domain";

import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";

import { SeedAssessmentRepository } from "../repositories/AssessmentRepository";
import { useAssessmentRuntime } from "../hooks/useAssessmentRuntime";

type Props = {
  assessmentId: string;
};

export function AssessmentPlayer({ assessmentId }: Props) {
  const repository = useMemo(() => new SeedAssessmentRepository(), []);

  const {
    runtime,
    loading,
    answerCurrentQuestion,
    next,
    previous,
  } = useAssessmentRuntime(repository, assessmentId);

  const [selectedValue, setSelectedValue] =
    useState<Response["value"] | null>(null);

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

      <QuestionCard
        question={question}
        selectedValue={selectedValue}
        onSelect={setSelectedValue}
      />

      <div className="flex justify-between">
        <button
          type="button"
          onClick={previous}
          disabled={!runtime.canGoPrevious()}
          className="rounded-md border px-6 py-2 disabled:opacity-50"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={selectedValue === null}
          onClick={() => {
            if (selectedValue === null) {
              return;
            }

            answerCurrentQuestion(selectedValue);

            next();

            setSelectedValue(null);
          }}
          className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}