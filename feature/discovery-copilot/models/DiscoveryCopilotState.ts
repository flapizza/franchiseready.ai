import type { BuyingSignal } from "./BuyingSignal";
import type { ConversationInsight } from "./ConversationInsight";
import type { MeetingRisk } from "./MeetingRisk";
import type { SuggestedQuestion } from "./SuggestedQuestion";

export interface DiscoveryCopilotState {
  confidence: number;

  conversationMomentum: number;

  buyingSignals: BuyingSignal[];

  risks: MeetingRisk[];

  insights: ConversationInsight[];

  suggestedQuestion: SuggestedQuestion;

  recommendedTopic: string;
}