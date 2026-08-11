import type { DailyBrief } from "../models/DailyBrief";
import type { MissionControlState } from "../models/MissionControlState";

export class DailyBriefEngine {
  public generate(
    state: MissionControlState,
  ): DailyBrief {
    const priorities = state.priorities.slice(0, 3);

    const summary = this.buildSummary(state);

    return {
      headline: `${state.greeting}, ${state.consultant}.`,

      summary,

      priorities: priorities.map((priority) => priority.title),

      recommendation:
        priorities.length > 0
          ? priorities[0].action
          : "Your pipeline is healthy. Continue scheduled follow-ups.",
    };
  }

  private buildSummary(
    state: MissionControlState,
  ): string {
    const active = state.activeCandidates;

    const meetings = state.discoveryToday.length;

    const priorityCount = state.priorities.length;

    const meetingText =
      meetings === 1
        ? "one Discovery meeting"
        : `${meetings} Discovery meetings`;

    return [
      `You currently have ${active} active candidates in your pipeline.`,
      `There ${meetings === 1 ? "is" : "are"} ${meetingText} scheduled today.`,
      `${priorityCount} candidate${priorityCount === 1 ? "" : "s"} require immediate attention.`,
      "Review your highest-priority opportunities before beginning today's meetings.",
    ].join(" ");
  }
}