import { CandidateDecisionEngine } from "@/feature/decision-engine/runtime/CandidateDecisionEngine";
import { DiscoveryCopilotRuntime } from "@/feature/discovery-copilot/runtime/DiscoveryCopilotRuntime";
import { MeetingIntelligenceRuntime } from "@/feature/meeting-intelligence/runtime/MeetingIntelligenceRuntime";

export class ServiceContainer {
  private readonly meetingIntelligence =
    new MeetingIntelligenceRuntime();

  private readonly decision =
    new CandidateDecisionEngine();

  private readonly discoveryCopilot =
    new DiscoveryCopilotRuntime();

  public meetingIntelligenceRuntime() {
    return this.meetingIntelligence;
  }

  public decisionRuntime() {
    return this.decision;
  }

  public discoveryCopilotRuntime() {
    return this.discoveryCopilot;
  }
}