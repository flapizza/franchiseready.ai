export interface Candidate {
  id: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  city: string;

  state: string;

  currentOccupation: string;

  employer?: string;

  netWorth: number;

  liquidCapital: number;

  creditScore?: number;

  ownershipGoal: string;

  preferredLocation: string;

  createdAt: string;

  updatedAt: string;
}