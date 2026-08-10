export interface TranscriptEntry {
  id: string;

  speaker: "consultant" | "candidate" | "ai";

  timestamp: string;

  text: string;
}