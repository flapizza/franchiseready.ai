import type { CandidateIntelligence } from "../models/CandidateIntelligence";
import type { DiscoveryGuide } from "../models/DiscoveryGuide";
import type { HealthScore } from "../models/HealthScore";
import type { ConsultantBrief } from "../models/ConsultantBrief";
import type { NextBestAction } from "../models/NextBestAction";

import { CandidateHealthEngine } from "../engines/CandidateHealthEngine";
import { ConsultantBriefService } from "./ConsultantBriefService";
import { DiscoveryGuideService } from "./DiscoveryGuideService";
import { NextBestActionService } from "./NextBestActionService";

export interface CandidateWorkspaceData {
  intelligence: CandidateIntelligence;
  health: HealthScore;
  discoveryGuide: DiscoveryGuide;
  consultantBrief: ConsultantBrief;
  nextBestAction: NextBestAction;
}

export class CandidateWorkspaceService {
  private readonly healthEngine =
    new CandidateHealthEngine();

  private readonly discoveryGuideService =
    new DiscoveryGuideService();

  private readonly consultantBriefService =
    new ConsultantBriefService();

  private readonly nextBestActionService =
    new NextBestActionService();

  public build(
    candidateName: string,
    intelligence: CandidateIntelligence,
  ): CandidateWorkspaceData {

    const discoveryGuide =
      this.discoveryGuideService.build(
        intelligence,
      );

    return {
      intelligence,

      health:
        this.healthEngine.evaluate(
          intelligence,
        ),

      discoveryGuide,

      consultantBrief:
        this.consultantBriefService.build(
          candidateName,
          intelligence,
          discoveryGuide,
        ),

      nextBestAction:
        this.nextBestActionService.determine(
          intelligence,
        ),
    };
  }
}