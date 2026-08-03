import type { PipelineStage } from "../models/CandidateRecord";

import type { WorkflowAction } from "./WorkflowAction";
import type { WorkflowRule } from "./WorkflowRule";

export class WorkflowEngine {
  private readonly rules: WorkflowRule[] = [
    {
      stage: "assessment-completed",

      actions: [
        {
          type: "create-task",

          title: "Schedule Discovery Call",

          description:
            "Contact the candidate and schedule the initial discovery meeting.",
        },

        {
          type: "recommend-next-action",

          title: "Review Intelligence Profile",

          description:
            "Review the candidate's intelligence profile before the discovery call.",
        },
      ],
    },

    {
      stage: "discovery",

      actions: [
        {
          type: "create-task",

          title: "Present Recommended Brands",

          description:
            "Review the top franchise matches with the candidate.",
        },

        {
          type: "create-task",

          title: "Schedule Validation",

          description:
            "Coordinate validation conversations with franchise representatives.",
        },
      ],
    },

    {
      stage: "validation",

      actions: [
        {
          type: "create-task",

          title: "Deliver FDD",

          description:
            "Provide the Franchise Disclosure Document.",
        },

        {
          type: "recommend-next-action",

          title: "Discuss Funding",

          description:
            "Review financing options and funding timeline.",
        },
      ],
    },
  ];

  public getNextActions(
    stage: PipelineStage,
  ): WorkflowAction[] {
    return (
      this.rules.find(
        (rule) => rule.stage === stage,
      )?.actions ?? []
    );
  }
}