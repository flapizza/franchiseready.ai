import { z } from "zod";
export function studioErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) return "Review the campaign fields and selected block. Use the supported formats and a valid HTTPS destination.";
  if (error instanceof Error && /^(This campaign changed|Sent and sending campaign|Campaign not found|An active workspace|Email document exceeds|Rendered email exceeds|Visual campaigns are draft)/.test(error.message)) return error.message;
  return "The campaign could not be updated. Your unsaved content is still here. Please try again.";
}
