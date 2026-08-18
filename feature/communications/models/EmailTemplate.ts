export interface EmailTemplate {
  templateId: string;
  name: string;
  purpose: "initial-contact" | "follow-up" | "meeting" | "assessment" | "brand-presentation" | "referral" | "nurture";
  subject: string;
  body: string;
}

export interface EmailDraftingContext {
  candidateId: string;
  lifecycleStage: string;
  communicationGoal: string;
  recentEvidence: Array<{ source: string; summary: string }>;
}

/** Replaceable future boundary. Implementations must identify AI-produced text as a suggestion. */
export interface EmailDraftingService { suggest(context: EmailDraftingContext): Promise<{ subject: string; body: string }> }
