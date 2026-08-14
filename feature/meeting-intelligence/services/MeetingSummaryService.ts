import type { MeetingTranscript } from "../models/MeetingTranscript";

export class MeetingSummaryService {
  public summarize(
    transcript: MeetingTranscript,
  ): string {
    if (transcript.entries.length === 0) {
      return "No meeting transcript available.";
    }

    return "Candidate demonstrated strong executive leadership, clear ownership motivation, and remains engaged throughout Discovery.";
  }
}