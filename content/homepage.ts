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
    "FranchiseReady AI helps consultants prepare for Discovery meetings, understand candidates faster, generate transparent brand recommendations, and deliver higher-quality candidates—all from one intelligent platform.",

  primaryCta: {
    label: "See the Platform",
    href: "#platform",
  },

  secondaryCta: {
    label: "Request a Demo",
    href: "#demo",
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
        "Candidates complete a consultant-branded assessment that captures financial readiness, leadership experience, business goals, and ownership motivations.",
    },

    {
      title: "Consultant Briefing",

      description:
        "Before Discovery, AI prepares the consultant with meeting objectives, buying signals, discussion priorities, and potential risks.",
    },

    {
      title: "AI Discovery Copilot",

      description:
        "During Discovery, AI analyzes the conversation in real time, surfaces opportunities, and continuously updates candidate intelligence.",
    },

    {
      title: "AI Brand Strategy",

      description:
        "Generate transparent recommendations supported by evidence and automatically produce professional referral packages for franchisors.",
    },
  ],
};

export const ctaContent = {
  title: "Ready to Transform Your Franchise Consulting Business?",
  description:
    "Schedule a personalized demonstration and see how FranchiseReady AI can transform every stage of your franchise consulting process.",
  href: "/request-demo",
  label: "Request a Demo",
};