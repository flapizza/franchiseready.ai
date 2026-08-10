export interface ConsultantBriefing {
  candidateName: string;

  aiConfidence: number;

  meetingObjective: string;

  discoveryStage: string;

  discussionTopics: string[];

  buyingSignals: string[];

  watchFor: string[];

  suggestedClosing: string;

  nextBestAction: string;
}