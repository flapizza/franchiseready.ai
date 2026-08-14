export interface TranscriptEntry {
  id: string;

  speaker: string;

  timestamp: string;

  text: string;
}

export interface MeetingTranscript {
  entries: TranscriptEntry[];
}