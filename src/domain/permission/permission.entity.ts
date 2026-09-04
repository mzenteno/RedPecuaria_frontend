export interface RoleMenuPermission {
  id: string;
  roleId: string;
  menuId: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isDeleted: boolean;
}

export type SetPermissionData = Pick<RoleMenuPermission, 'canView' | 'canCreate' | 'canEdit' | 'canDelete'>;
