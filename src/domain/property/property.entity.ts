export interface Property {
  id: string;
  companyId: string;
  name: string;
  latitude: number;
  longitude: number;
  isDeleted: boolean;
  createdAt: string;
}

export type CreatePropertyData = Pick<Property, 'name' | 'latitude' | 'longitude'>;
export type UpdatePropertyData = Pick<Property, 'name' | 'latitude' | 'longitude'>;
