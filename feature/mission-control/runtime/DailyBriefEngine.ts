import type { DailyBrief } from "../models/DailyBrief";
import type { MissionControlState } from "../models/MissionControlState";

export class DailyBriefEngine {
  public generate(
    state: MissionControlState,
  ): DailyBrief {
    return {
      headline: `Good Afternoon, ${state.consultantName}.`,

      summary: state.dailyBrief.summary,

      priorities: state.dailyBrief.priorities.map(
        (priority) => priority.candidateName,
      ),

      recommendation:
        state.dailyBrief.priorities.length > 0
          ? state.dailyBrief.priorities[0].recommendedAction
          : "Your pipeline is healthy. Continue scheduled follow-ups.",
    };
  }
}
