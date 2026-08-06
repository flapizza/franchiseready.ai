import { TwoColumn } from "@/feature/ui";

import { DiscoveryCopilot } from "@/feature/crm/components/DiscoveryCopilot";
import { ExecutiveBrief } from "@/feature/crm/components/ExecutiveBrief";
import { AIDiscoveryTimeline } from "@/feature/crm/components/AIDiscoveryTimeline";
import { MeetingActionsBar } from "@/feature/crm/components/MeetingActionsBar";
import { CandidateIntelligencePanel } from "@/feature/crm/components/CandidateIntelligencePanel";

import type { DiscoveryWorkspaceState } from "@/feature/discovery/models/DiscoveryWorkspaceState";
import type { ExecutiveRecommendation } from "@/feature/intelligence/models/ExecutiveRecommendation";

type Props = {
  workspace: DiscoveryWorkspaceState;

  recommendation: ExecutiveRecommendation;
};

export function ConsultantCommandCenter({
  workspace,
  recommendation,
}: Props) {
  return (
    <div className="space-y-8">

      <TwoColumn
        left={
          <DiscoveryCopilot
            copilot={workspace.copilot}
          />
        }
        right={
          <CandidateIntelligencePanel
            intelligence={workspace.intelligence}
          />
        }
      />

      <ExecutiveBrief
        recommendation={recommendation}
      />

      <AIDiscoveryTimeline
        events={[
          {
            id: "1",
            time: "11:02",
            title: "Discovery Started",
            description:
              "AI initialized Discovery Session.",
            type: "info",
          },
        ]}
      />

      <MeetingActionsBar />

    </div>
  );
}