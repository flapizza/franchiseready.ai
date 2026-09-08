import {
  BrainCircuit,
  Briefcase,
  LayoutDashboard,
  Network,
  Presentation,
  Users,
} from "lucide-react";

export const heroContent = {
  eyebrow: "Built Exclusively for Franchise Consultants",

  title: "The AI Operating System for Franchise Consultants.",

  description:
    "Candidate CRM and Discovery workflows for franchise consultants, with a growing vision for transparent brand intelligence. Controlled rollout is underway.",

  primaryCta: {
    label: "See the Platform",
    href: "#platform",
  },

  secondaryCta: {
    label: "Explore the Workflow",
    href: "#workflow",
  },
};

export const featuresContent = {
  eyebrow: "Everything You Need. One Platform.",

  title: "Purpose-built for modern franchise consulting.",

  description:
    "Every stage of the franchise development process is connected through one intelligent platform designed specifically for professional franchise consultants.",

  items: [
    {
      title: "Mission Control",

      description:
        "Start every day knowing which candidates require your attention, where every opportunity stands, and what AI recommends next.",

      icon: LayoutDashboard,
    },

    {
      title: "Discovery Copilot",

      description:
        "Receive real-time guidance during Discovery meetings including buying signals, suggested questions, risks, and AI insights.",

      icon: Presentation,
    },

    {
      title: "Candidate 360",

      description:
        "Review every candidate through a single executive-level intelligence dashboard built from assessments and Discovery conversations.",

      icon: Users,
    },

    {
      title: "AI Brand Strategy",

      description:
        "Generate transparent, evidence-backed franchise recommendations that explain exactly why each brand fits the candidate.",

      icon: BrainCircuit,
    },

    {
      title: "Candidate Intelligence Graph",

      description:
        "Every assessment, meeting, and recommendation contributes to a living intelligence model that grows throughout the candidate journey.",

      icon: Network,
    },

    {
      title: "Referral Packages",

      description:
        "Automatically create professional candidate summaries for franchisors with supporting evidence and executive insights.",

      icon: Briefcase,
    },
  ],
};

export const howItWorksContent = {
  eyebrow: "One Platform. Every Stage.",

  title: "The complete franchise consulting workflow.",

  steps: [
    {
      title: "Candidate Intelligence Assessment",

      description:
        "Organize candidate goals, financial readiness, and ownership motivations. External assessment invitations are not yet available for Production use.",
    },

    {
      title: "Consultant Briefing",

      description:
        "Use assessment findings and recorded observations to prepare discussion priorities. Automated AI briefings are part of the product vision.",
    },

    {
      title: "AI Discovery Copilot",

      description:
        "Capture observations and next steps during Discovery. Live AI conversation analysis is a planned capability, not a currently available service.",
    },

    {
      title: "AI Brand Strategy",

      description:
        "Explore the planned evidence-led brand strategy and referral workflow. Production matching and automated referral delivery are not yet available.",
    },
  ],
};

export const ctaContent = {
 title: "A more connected consulting practice starts here.",
 description: "FranGroove is in controlled rollout. Public demo scheduling and sales contact are not open yet. Explore the product vision above; existing invited users can access their workspace.",
 href: "https://app.frangroove.com/login",
 label: "Existing user? Log in",
};
