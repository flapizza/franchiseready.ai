export type BuyingSignalStrength =
  | "low"
  | "medium"
  | "high";

export interface BuyingSignal {
  id: string;

  title: string;

  explanation: string;

  strength: BuyingSignalStrength;

  confidence: number;
}