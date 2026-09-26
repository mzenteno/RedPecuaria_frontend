export interface Company {
  id: string;
  name: string;
  logoUrl: string | null;
  createdAt: string;
}

export type CreateCompanyData = Pick<Company, 'name'>;
export type UpdateCompanyData = Pick<Company, 'name'>;
