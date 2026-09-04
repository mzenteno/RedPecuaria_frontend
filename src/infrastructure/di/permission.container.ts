import { ListPermissionsByRoleUseCaseImpl } from '@/application/permission/list-permissions-by-role.use-case.impl';
import { SetRoleMenuPermissionUseCaseImpl } from '@/application/permission/set-role-menu-permission.use-case.impl';
import { PermissionRepositoryImpl } from '../repositories/permission/permission.repository.impl';

export const permissionRepository = new PermissionRepositoryImpl();
export const listPermissionsByRoleUseCase = new ListPermissionsByRoleUseCaseImpl(permissionRepository);
export const setRoleMenuPermissionUseCase = new SetRoleMenuPermissionUseCaseImpl(permissionRepository);
