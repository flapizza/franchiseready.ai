import type { BrandProfile } from "../models/BrandProfile.ts";

export interface BrandRepository {
  getAll(): Promise<BrandProfile[]>;

  getById(
    id: string,
  ): Promise<BrandProfile | null>;
}
