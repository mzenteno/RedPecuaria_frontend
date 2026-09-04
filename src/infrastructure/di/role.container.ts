import { CreateRoleUseCaseImpl } from '@/application/role/create-role.use-case.impl';
import { UpdateRoleUseCaseImpl } from '@/application/role/update-role.use-case.impl';
import { DeactivateRoleUseCaseImpl } from '@/application/role/deactivate-role.use-case.impl';
import { ListRolesUseCaseImpl } from '@/application/role/list-roles.use-case.impl';
import { RoleRepositoryImpl } from '../repositories/role/role.repository.impl';

export const roleRepository = new RoleRepositoryImpl();
export const createRoleUseCase = new CreateRoleUseCaseImpl(roleRepository);
export const updateRoleUseCase = new UpdateRoleUseCaseImpl(roleRepository);
export const deactivateRoleUseCase = new DeactivateRoleUseCaseImpl(roleRepository);
export const listRolesUseCase = new ListRolesUseCaseImpl(roleRepository);
