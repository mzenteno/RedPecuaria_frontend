export interface Investment {
  id: string;
  propertyId: string;
  gestion: number;
  description: string;
  isDeleted: boolean;
  createdAt: string;
  investorIds: string[];
}

export interface CreateInvestmentData {
  propertyId: string;
  gestion: number;
  description: string;
  investorUserIds: string[];
}

export interface UpdateInvestmentData {
  gestion: number;
  description: string;
  investorUserIds: string[];
}
