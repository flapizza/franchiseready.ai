export interface Evidence {
  id: string;

  category:
    | "leadership"
    | "financial"
    | "motivation"
    | "family"
    | "operations"
    | "culture";

  title: string;

  description: string;

  confidence: number;

  source:
    | "assessment"
    | "meeting"
    | "crm"
    | "consultant";

  timestamp: string;
}