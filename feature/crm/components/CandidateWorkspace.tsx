"use client";

import type { CandidateIntelligence } from "@/feature/intelligence/models/CandidateIntelligence";
import type { DiscoveryGuide } from "@/feature/intelligence/models/DiscoveryGuide";
import type { HealthScore } from "@/feature/intelligence/models/HealthScore";

import { CandidateIntelligenceDashboard } from "@/feature/intelligence/components/CandidateIntelligenceDashboard";

type Props = {
  candidateName: string;
  intelligence: CandidateIntelligence;
  health: HealthScore;
  discoveryGuide: DiscoveryGuide;
};

export function CandidateWorkspace({
  candidateName,
  intelligence,
  health,
  discoveryGuide,
}: Props) {
  return (
    <div className="space-y-8">

      <CandidateIntelligenceDashboard
        candidateName={candidateName}
        intelligence={intelligence}
        health={health}
        discoveryGuide={discoveryGuide}
      />

      <div className="grid gap-6 lg:grid-cols-3">

        <section className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold">
            Activity Timeline
          </h2>

          <div className="mt-4 space-y-4">

            <TimelineItem
              title="Assessment Completed"
              subtitle="Candidate completed the FranchiseReady assessment."
            />

            <TimelineItem
              title="Discovery Scheduled"
              subtitle="Discovery meeting scheduled for next week."
            />

            <TimelineItem
              title="Funding Review"
              subtitle="Financial qualification pending."
            />

          </div>

        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold">
            Active Tasks
          </h2>

          <TaskItem task="Prepare Discovery Call" />
          <TaskItem task="Review Financial Qualification" />
          <TaskItem task="Recommend Initial Brands" />

        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold">
            Top Brand Matches
          </h2>

          <BrandMatch
            name="ERA Group"
            score={94}
          />

          <BrandMatch
            name="Brand B"
            score={91}
          />

          <BrandMatch
            name="Brand C"
            score={88}
          />

        </section>

      </div>

    </div>
  );
}

type TimelineItemProps = {
  title: string;
  subtitle: string;
};

function TimelineItem({
  title,
  subtitle,
}: TimelineItemProps) {
  return (
    <div className="border-l-2 border-blue-600 pl-4">

      <h3 className="font-medium">
        {title}
      </h3>

      <p className="text-sm text-gray-600">
        {subtitle}
      </p>

    </div>
  );
}

type TaskItemProps = {
  task: string;
};

function TaskItem({
  task,
}: TaskItemProps) {
  return (
    <div className="mt-3 rounded-lg border p-3">
      {task}
    </div>
  );
}

type BrandMatchProps = {
  name: string;
  score: number;
};

function BrandMatch({
  name,
  score,
}: BrandMatchProps) {
  return (
    <div className="mt-3 flex items-center justify-between rounded-lg border p-3">

      <span>{name}</span>

      <span className="font-bold text-green-600">
        {score}%
      </span>

    </div>
  );
}