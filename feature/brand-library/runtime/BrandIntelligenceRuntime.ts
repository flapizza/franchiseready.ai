import type { BrandIntelligenceProfile, GovernedBrandFact } from "../models/BrandIntelligenceProfile.ts";
import type { BrandRepository } from "../repositories/BrandRepository.ts";
import { SeedBrandRepository } from "../repositories/SeedBrandRepository.ts";
import { LegacyBrandProfileAdapter } from "./LegacyBrandProfileAdapter.ts";
import { filterBrandProfiles, type BrandLibraryFilters } from "./filterBrandProfiles.ts";

export const presentationValue = <T>(fact: GovernedBrandFact<T>): T | null => fact.approval === "approved-for-presentation" ? fact.value : null;
export class BrandIntelligenceRuntime {
  private readonly brands: BrandRepository;
  private readonly adapter: LegacyBrandProfileAdapter;
  constructor(brands: BrandRepository = new SeedBrandRepository(), adapter = new LegacyBrandProfileAdapter()) { this.brands = brands; this.adapter = adapter; }
  async getAll(): Promise<BrandIntelligenceProfile[]> { return (await this.brands.getAll()).map((brand) => this.adapter.toIntelligenceProfile(brand)); }
  async getById(brandId: string): Promise<BrandIntelligenceProfile | null> { const brand = await this.brands.getById(brandId); return brand ? this.adapter.toIntelligenceProfile(brand) : null; }
  filter(profiles: readonly BrandIntelligenceProfile[], filters: BrandLibraryFilters): BrandIntelligenceProfile[] { return filterBrandProfiles(profiles, filters); }
}
