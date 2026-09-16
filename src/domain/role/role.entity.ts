export interface Role {
  id: string;
  companyId: string;
  name: string;
  createdAt: string;
}

export type CreateRoleData = Pick<Role, 'name'>;
export type UpdateRoleData = Pick<Role, 'name'>;
