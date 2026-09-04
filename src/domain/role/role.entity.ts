export interface Role {
  id: string;
  companyId: string;
  name: string;
  isDeleted: boolean;
  createdAt: string;
}

export type CreateRoleData = Pick<Role, 'name'>;
export type UpdateRoleData = Pick<Role, 'name'>;
