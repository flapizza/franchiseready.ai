import type { EmailTemplate } from "../models/EmailTemplate";

export const demoEmailTemplates: EmailTemplate[] = [
  { templateId: "template-discovery-follow-up", name: "Discovery follow-up", purpose: "follow-up", subject: "Following up on our conversation", body: "Thank you for the conversation. I wanted to follow up on the next steps we discussed." },
  { templateId: "template-meeting-confirmation", name: "Meeting confirmation", purpose: "meeting", subject: "Confirming our next conversation", body: "I am looking forward to our next conversation. Please let me know if anything changes before we meet." },
];
