"use client";

import type { CandidateIntelligence } from "../models/CandidateIntelligence";
import type { DiscoveryGuide } from "../models/DiscoveryGuide";
import type { HealthScore } from "../models/HealthScore";

type Props = {
  candidateName: string;
  intelligence: CandidateIntelligence;
  health: HealthScore;
  discoveryGuide: DiscoveryGuide;
};

export function CandidateIntelligenceDashboard({
  candidateName,
  intelligence,
  health,
  discoveryGuide,
}: Props) {
  return (
    <div className="space-y-8">

      <header className="rounded-xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Candidate Intelligence Profile
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          {candidateName}
        </h1>

        <p className="mt-2 text-gray-600">
          FranchiseReady Intelligence Engine
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">

        <MetricCard
          title="Overall Readiness"
          value={intelligence.overallReadiness}
        />

        <MetricCard
          title="Health Score"
          value={health.score}
        />

        <MetricCard
          title="Confidence"
          value={health.confidence}
        />

      </div>

      <section>

        <h2 className="mb-4 text-xl font-semibold">
          Intelligence Dimensions
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

          <MetricCard
            title="Leadership"
            value={intelligence.leadership.accountability}
          />

          <MetricCard
            title="Sales"
            value={intelligence.sales.relationshipBuilding}
          />

          <MetricCard
            title="Operations"
            value={intelligence.operations.execution}
          />

          <MetricCard
            title="Coachability"
            value={intelligence.behavioral.coachability}
          />

          <MetricCard
            title="Financial"
            value={intelligence.financial.financingLikelihood}
          />

          <MetricCard
            title="Decision Readiness"
            value={intelligence.timing.buyingConfidence}
          />

        </div>

      </section>

      <div className="grid gap-6 lg:grid-cols-2">

        <ListCard
          title="Top Strengths"
          items={discoveryGuide.strengths}
        />

        <ListCard
          title="Areas to Explore"
          items={discoveryGuide.concerns}
        />

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <ListCard
          title="Recommended Discovery Questions"
          items={discoveryGuide.recommendedQuestions}
        />

        <ListCard
          title="Recommended Discussion Topics"
          items={discoveryGuide.discussionTopics}
        />

      </div>

      <ListCard
        title="Next Best Actions"
        items={discoveryGuide.followUpRecommendations}
      />

    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: number;
};

function MetricCard({
  title,
  value,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-4xl font-bold">
        {value}
      </p>

    </div>
  );
}

type ListCardProps = {
  title: string;
  items: string[];
};

function ListCard({
  title,
  items,
}: ListCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <ul className="mt-4 space-y-3">

        {items.length === 0 ? (
          <li className="text-gray-500">
            No items available.
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2"
            >
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />

              <span>{item}</span>

            </li>
          ))
        )}

      </ul>

    </div>
  );
}