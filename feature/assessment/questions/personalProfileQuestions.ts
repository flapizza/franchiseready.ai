import type { AssessmentQuestion } from "../models/AssessmentQuestion";

export const personalProfileQuestions: AssessmentQuestion[] = [
  {
    id: "first-name",
    domain: "personal-profile",
    type: "text",
    label: "First Name",
    required: true,
    intelligenceTags: ["identity"],
  },

  {
    id: "last-name",
    domain: "personal-profile",
    type: "text",
    label: "Last Name",
    required: true,
    intelligenceTags: ["identity"],
  },

  {
    id: "preferred-name",
    domain: "personal-profile",
    type: "text",
    label: "Preferred Name",
    required: false,
    intelligenceTags: ["identity"],
  },

  {
    id: "email",
    domain: "personal-profile",
    type: "email",
    label: "Email Address",
    required: true,
    intelligenceTags: ["communication"],
  },

  {
    id: "mobile-phone",
    domain: "personal-profile",
    type: "phone",
    label: "Mobile Phone",
    required: true,
    intelligenceTags: ["communication"],
  },

  {
    id: "city",
    domain: "personal-profile",
    type: "text",
    label: "City",
    required: true,
    intelligenceTags: ["location"],
  },

  {
    id: "state",
    domain: "personal-profile",
    type: "text",
    label: "State",
    required: true,
    intelligenceTags: ["location"],
  },

  {
    id: "occupation",
    domain: "personal-profile",
    type: "text",
    label: "Current Occupation",
    required: true,
    intelligenceTags: ["career"],
  },

  {
    id: "employer",
    domain: "personal-profile",
    type: "text",
    label: "Current Employer",
    required: false,
    intelligenceTags: ["career"],
  },
];