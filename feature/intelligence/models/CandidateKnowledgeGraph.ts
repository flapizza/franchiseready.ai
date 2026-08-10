export interface CandidateKnowledgeGraph {
  candidateId: string;

  generatedAt: string;

  identity: IdentityNode;

  leadership: LeadershipNode;

  financial: FinancialNode;

  buying: BuyingNode;

  lifestyle: LifestyleNode;

  family: FamilyNode;

  risks: RiskNode[];

  recommendations: RecommendationNode[];

  timeline: TimelineEvent[];
}

export interface IdentityNode {
  fullName: string;

  currentCareer: string;

  yearsLeadership: number;
}

export interface LeadershipNode {
  confidence: number;

  evidence: string[];
}

export interface FinancialNode {
  liquidCapital: number;

  investmentCapacity: number;

  confidence: number;
}

export interface BuyingNode {
  confidence: number;

  urgency: number;

  motivation: string[];
}

export interface LifestyleNode {
  preferredModels: string[];

  recurringRevenue: boolean;
}

export interface FamilyNode {
  aligned: boolean | null;

  notes: string[];
}

export interface RiskNode {
  id: string;

  title: string;

  severity: "low" | "medium" | "high";
}

export interface RecommendationNode {
  brand: string;

  confidence: number;

  reasons: string[];
}

export interface TimelineEvent {
  id: string;

  timestamp: string;

  title: string;

  description: string;
}