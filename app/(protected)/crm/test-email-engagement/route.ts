import { NextResponse } from "next/server";
import { isConferenceDemoAccessEnabled } from "@/lib/auth/demo-access";
import { getConferenceDemoUser } from "@/lib/auth/demo-session";
import { DemoEmailRepository } from "@/feature/communications/repositories/DemoEmailRepository";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import type { EmailEngagementEventType } from "@/feature/communications/models/EmailEngagementEvent";

export async function POST(request: Request) {
  if (!isConferenceDemoAccessEnabled()) return new NextResponse("Not found", { status: 404 });
  if (!(await getConferenceDemoUser())) return new NextResponse("Forbidden", { status: 403 });
  const body = await request.json() as { candidateId?: unknown; messageId?: unknown; type?: unknown; linkId?: unknown; eventId?: unknown };
  if (typeof body.candidateId !== "string") return new NextResponse("Candidate ID is required", { status: 400 });
  if (body.type === "fail-next-delivery") { demoCandidateOverlayStore.failNextCandidateEmailDelivery(body.candidateId); return NextResponse.json({ status: "configured" }); }
  if (typeof body.messageId !== "string" || !["open", "link-click", "reply"].includes(String(body.type))) return new NextResponse("Valid message and event type are required", { status: 400 });
  const repository = new DemoEmailRepository(); const message = repository.getMessage(body.candidateId, body.messageId);
  if (!message || message.candidateId !== body.candidateId) return new NextResponse("Email message not found for this candidate", { status: 404 });
  const type = body.type as EmailEngagementEventType;
  const link = type === "link-click" ? message.links.find((item) => item.linkId === body.linkId) : undefined;
  if (type === "link-click" && !link) return new NextResponse("Tracked link not found for this message", { status: 404 });
  const eventId = typeof body.eventId === "string" ? body.eventId : `demo-event-${crypto.randomUUID()}`;
  const added = repository.addEvent({ eventId, providerEventId: eventId, messageId: message.messageId, candidateId: message.candidateId, type,
    occurredAt: new Date().toISOString(), linkId: link?.linkId, url: link?.originalUrl, metadata: { source: "conference-demo" } });
  return NextResponse.json({ status: added ? "recorded" : "duplicate-ignored", eventId });
}
