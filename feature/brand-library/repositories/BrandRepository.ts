import type { BrandProfile } from "../models/BrandProfile";

export interface BrandRepository {
  getAll(): Promise<BrandProfile[]>;

  getById(
    id: string,
  ): Promise<BrandProfile | null>;
}