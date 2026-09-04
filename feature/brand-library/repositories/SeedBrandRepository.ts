import type { BrandRepository } from "./BrandRepository.ts";

import type { BrandProfile } from "../models/BrandProfile.ts";

import { demoBrands } from "../data/demoBrands.ts";

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
