import type { AssessmentVersion } from "../types/domain";

export const readinessAssessment: AssessmentVersion = {
  id: "demo",
  assessmentDefinitionId: "franchise-readiness",
  version: "v1",
  name: "Franchise Readiness Assessment",
  description:
    "Seed assessment used during development.",
  status: "published",

  sections: [
    {
      id: "section-1",
      assessmentVersionId: "demo",
      key: "mindset",
      title: "Mindset",
      order: 1,
      questionIds: ["question-1"],
    },
  ],

  questions: [
    {
      id: "question-1",
      assessmentVersionId: "demo",
      key: "sales-confidence",
      prompt:
        "How comfortable are you making high-value sales presentations?",
      required: true,
      order: 1,
      type: "single-choice",
      options: [
        {
          id: "1",
          label: "Very Uncomfortable",
          value: "1",
        },
        {
          id: "2",
          label: "Somewhat Uncomfortable",
          value: "2",
        },
        {
          id: "3",
          label: "Neutral",
          value: "3",
        },
        {
          id: "4",
          label: "Comfortable",
          value: "4",
        },
        {
          id: "5",
          label: "Very Comfortable",
          value: "5",
        },
      ],
    },
  ],

  dimensions: [
    {
      id: "confidence",
      key: "confidence",
      name: "Confidence",
    },
  ],

  scoringAlgorithm: {
  key: "default",
  version: "1.0",
  },
};