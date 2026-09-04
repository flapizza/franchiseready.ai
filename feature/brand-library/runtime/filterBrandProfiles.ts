import type { BrandIntelligenceProfile } from "../models/BrandIntelligenceProfile.ts";

export interface BrandLibraryFilters {
  query?: string;
  category?: string;
  ownership?: "owner-operator" | "executive";
  completeness?: BrandIntelligenceProfile["completeness"]["status"];
}

export function filterBrandProfiles(profiles: readonly BrandIntelligenceProfile[], filters: BrandLibraryFilters): BrandIntelligenceProfile[] {
  const query = filters.query?.trim().toLowerCase();
  return profiles.filter((profile) => {
    const matchesQuery = !query || [profile.name, profile.category.value, profile.description.value].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
    const matchesCategory = !filters.category || profile.category.value === filters.category;
    const matchesOwnership = !filters.ownership || (filters.ownership === "owner-operator"
      ? profile.characteristics.ownerOperatorSuitability.value === "well-suited"
      : profile.characteristics.executiveSuitability.value === "well-suited");
    const matchesCompleteness = !filters.completeness || profile.completeness.status === filters.completeness;
    return matchesQuery && matchesCategory && matchesOwnership && matchesCompleteness;
  });
}
