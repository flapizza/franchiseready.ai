"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { Response } from "../types/domain";

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
  const router = useRouter();

  const repository = useMemo(
    () => new SeedAssessmentRepository(),
    [],
  );

  const {
    runtime,
    loading,
    answerCurrentQuestion,
    next,
    previous,
  } = useAssessmentRuntime(
    repository,
    assessmentId,
  );

  const [selectedValue, setSelectedValue] =
    useState<Response["value"] | null>(null);

  if (loading) {
    return (
      <div className="rounded-3xl border bg-white p-10 shadow-sm">
        Loading Franchise Discovery...
      </div>
    );
  }

  if (!runtime) {
    return (
      <div className="rounded-3xl border bg-white p-10 shadow-sm">
        Assessment not found.
      </div>
    );
  }

  const snapshot = runtime.snapshot();

  const question =
    runtime.currentQuestion();

  if (!question) {
    return (
      <div className="rounded-3xl border bg-white p-10 shadow-sm">
        No questions available.
      </div>
    );
  }

  const isLastQuestion =
    snapshot.progress.answeredQuestions >=
    snapshot.progress.totalQuestions - 1;

  const handleNext = () => {
    if (selectedValue === null) {
      return;
    }

    answerCurrentQuestion(
      selectedValue,
    );

    setSelectedValue(null);

    if (isLastQuestion) {
      router.push(
        `/assessment/${assessmentId}/results`,
      );

      return;
    }

    next();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-20">

      <header className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-900 p-10 text-white shadow-2xl">

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">
              Franchise Discovery
            </p>

            <h1 className="mt-4 text-5xl font-black">
              {snapshot.assessment.name}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">
              We're going to learn about your
              professional background,
              leadership style,
              financial readiness,
              lifestyle goals,
              and the type of franchise
              opportunity that best aligns
              with your future.
            </p>

          </div>

          <div className="rounded-3xl bg-white/10 p-8 text-center backdrop-blur">

            <div className="text-5xl font-black">
              20–25
            </div>

            <div className="mt-2 text-sm uppercase tracking-[0.25em] text-blue-200">
              Minutes
            </div>

          </div>

        </div>

      </header>

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm">

        <div className="flex items-start gap-4">

          <div className="mt-2 h-3 w-3 rounded-full bg-blue-600" />

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              What happens during Franchise Discovery?
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Every answer helps FranchiseReady AI
              understand your goals,
              leadership experience,
              financial readiness,
              and ownership preferences.
              Your responses are used to build your
              Franchise DNA,
              generate personalized recommendations,
              and prepare your consultant for a more
              productive Discovery conversation.
            </p>

          </div>

        </div>

      </section>

      <section className="rounded-3xl border bg-white p-8 shadow-sm">

        <div className="mb-8">

          <ProgressBar
            current={
              snapshot.progress
                .answeredQuestions
            }
            total={
              snapshot.progress
                .totalQuestions
            }
          />

        </div>

        <QuestionCard
          question={question}
          selectedValue={selectedValue}
          onSelect={setSelectedValue}
        />

      </section>

      <div className="flex items-center justify-between">

        <button
          type="button"
          onClick={previous}
          disabled={
            !runtime.canGoPrevious()
          }
          className="rounded-xl border border-slate-300 bg-white px-8 py-3 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={
            selectedValue === null
          }
          className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLastQuestion
            ? "Complete Discovery"
            : "Continue"}
        </button>

      </div>

    </div>
  );
}