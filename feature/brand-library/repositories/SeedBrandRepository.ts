import type { BrandRepository } from "./BrandRepository";

import type { BrandProfile } from "../models/BrandProfile";

import { demoBrands } from "../data/demoBrands";

export class SeedBrandRepository
  implements BrandRepository
{
  async getAll(): Promise<BrandProfile[]> {
    return demoBrands;
  }

  async getById(
    id: string,
  ): Promise<BrandProfile | null> {
    return (
      demoBrands.find(
        (brand) => brand.id === id,
      ) ?? null
    );
  }
}