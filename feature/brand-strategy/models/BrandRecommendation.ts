export interface BrandRecommendation {
  id: string;

  brandName: string;

  score: number;

  previousScore: number;

  movement: "up" | "down" | "same";

  explanation: string;

  strengths: string[];

  concerns: string[];
}