import type { BrandIntelligenceProfile } from "../models/BrandIntelligenceProfile.ts";

export interface BrandIntelligenceCatalogEntry {
  id: string;
  slug: string;
  name: string;
  lifecycle: BrandIntelligenceProfile["brandStatus"];
  profile: BrandIntelligenceProfile | null;
}
export interface BrandIntelligencePage {
  brands: BrandIntelligenceCatalogEntry[];
  nextCursor: string | null;
}
/** Read-only canonical intelligence. Deliberately not the legacy BrandRepository. */
export interface BrandIntelligenceRepository {
  list(options?: { limit?: number; afterSlug?: string; includeInactive?: boolean }): Promise<BrandIntelligencePage>;
  getById(publicId: string): Promise<BrandIntelligenceProfile | null>;
  getBySlug(slug: string): Promise<BrandIntelligenceProfile | null>;
}
