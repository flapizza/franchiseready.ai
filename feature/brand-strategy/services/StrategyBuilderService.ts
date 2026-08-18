import { CandidateBrandStrategyRuntime } from "../runtime/CandidateBrandStrategyRuntime";
import type { BrandShortlistDisposition, CandidateBrandReaction, StrategyBrandDecision, StrategyBuilderRecord } from "../models/StrategyBuilderRecord";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import { DemoCandidateActivityRepository } from "@/feature/crm/repositories/DemoCandidateActivityRepository";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";

export type StrategyBuilderCommand =
  | { kind: "toggle-presentation"; brandId: string }
  | { kind: "move"; brandId: string; direction: "up" | "down" }
  | { kind: "response"; brandId: string; reaction: CandidateBrandReaction; notes: string }
  | { kind: "disposition"; brandId: string; disposition: BrandShortlistDisposition };

export type StrategyBuilderResult = { status: "success"; message: string } | { status: "not-found" | "invalid"; message: string };

export class StrategyBuilderService {
  constructor(private readonly runtime = new CandidateBrandStrategyRuntime(), private readonly activities = new DemoCandidateActivityRepository()) {}

  async execute(candidateId: string, command: StrategyBuilderCommand): Promise<StrategyBuilderResult> {
    const strategy = await this.runtime.load(candidateId);
    if (!strategy?.available) return { status: "not-found", message: "Brand Strategy is not available." };
    const recommendation = strategy.recommendations.find((item) => item.brandId === command.brandId);
    if (!recommendation) return { status: "invalid", message: "Brand is not part of the canonical recommendation set." };
    const now = new Date().toISOString();
    const current = demoCandidateOverlayStore.getStrategy(candidateId) ?? { candidateId, decisions: [], createdAt: now, updatedAt: now };
    const decisions = new Map(current.decisions.map((item) => [item.brandId, item]));
    const existing = decisions.get(command.brandId) ?? this.empty(command.brandId, now);
    let activity: { title: string; description: string } | null = null;

    if (command.kind === "toggle-presentation") {
      const selected = !existing.selectedForPresentation;
      const nextOrder = selected ? Math.max(0, ...[...decisions.values()].map((item) => item.presentationOrder ?? 0)) + 1 : null;
      decisions.set(command.brandId, { ...existing, selectedForPresentation: selected, presentationOrder: nextOrder,
        candidateReaction: selected ? existing.candidateReaction : null, consultantNotes: selected ? existing.consultantNotes : "",
        shortlistDisposition: selected ? existing.shortlistDisposition : null, updatedAt: now });
      this.compact(decisions);
      activity = { title: selected ? `Brand Added to Presentation Set — ${recommendation.brandName}` : `Brand Removed from Presentation Set — ${recommendation.brandName}`,
        description: selected ? "Consultant selected this AI recommendation for candidate discussion." : "Consultant removed this brand from the active presentation set." };
    } else if (!existing.selectedForPresentation) return { status: "invalid", message: "Add the brand to the Presentation Set first." };
    else if (command.kind === "move") {
      const ordered = [...decisions.values()].filter((item) => item.selectedForPresentation).sort((a, b) => (a.presentationOrder ?? 0) - (b.presentationOrder ?? 0));
      const index = ordered.findIndex((item) => item.brandId === command.brandId);
      const swap = command.direction === "up" ? index - 1 : index + 1;
      if (swap < 0 || swap >= ordered.length) return { status: "success", message: "Presentation order is unchanged." };
      const other = ordered[swap];
      decisions.set(existing.brandId, { ...existing, presentationOrder: other.presentationOrder, updatedAt: now });
      decisions.set(other.brandId, { ...other, presentationOrder: existing.presentationOrder, updatedAt: now });
    } else if (command.kind === "response") {
      const changed = existing.candidateReaction !== command.reaction;
      decisions.set(command.brandId, { ...existing, candidateReaction: command.reaction, consultantNotes: command.notes.trim(), updatedAt: now });
      if (changed) activity = { title: `Candidate ${this.reactionLabel(command.reaction)} — ${recommendation.brandName}`, description: command.notes.trim() || "Candidate reaction recorded after consultant presentation." };
    } else {
      const changed = existing.shortlistDisposition !== command.disposition;
      decisions.set(command.brandId, { ...existing, shortlistDisposition: command.disposition, updatedAt: now });
      if (changed) activity = { title: command.disposition === "remove" ? `Brand Removed from Consideration — ${recommendation.brandName}` : `Brand Added to Shortlist — ${recommendation.brandName}`,
        description: `Consultant disposition: ${command.disposition.replace("-", " ")}.` };
    }

    const record: StrategyBuilderRecord = { ...current, decisions: [...decisions.values()], updatedAt: now };
    demoCandidateOverlayStore.saveStrategy(record);
    if (activity) await this.activities.add({ id: `strategy:${candidateId}:${command.brandId}:${command.kind}:${now}`, candidateId, consultantId: demoConsultant.id,
      type: command.kind === "response" ? "brand-presented" : "brand-strategy-ready", title: activity.title, description: activity.description, createdAt: now });
    return { status: "success", message: "Strategy Builder updated." };
  }

  private empty(brandId: string, updatedAt: string): StrategyBrandDecision { return { brandId, selectedForPresentation: false, presentationOrder: null, candidateReaction: null, consultantNotes: "", shortlistDisposition: null, updatedAt }; }
  private compact(decisions: Map<string, StrategyBrandDecision>) { [...decisions.values()].filter((item) => item.selectedForPresentation).sort((a, b) => (a.presentationOrder ?? 0) - (b.presentationOrder ?? 0)).forEach((item, index) => decisions.set(item.brandId, { ...item, presentationOrder: index + 1 })); }
  private reactionLabel(value: CandidateBrandReaction) { return ({ "strong-interest": "Strong Interest", interested: "Interested", neutral: "Neutral", "not-interested": "Not Interested" })[value]; }
}
