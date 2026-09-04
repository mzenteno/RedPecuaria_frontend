import { GetUserRoleUseCaseImpl } from '@/application/user-company/get-user-role.use-case.impl';
import { ChangeUserRoleUseCaseImpl } from '@/application/user-company/change-user-role.use-case.impl';
import { UserCompanyRepositoryImpl } from '../repositories/user-company/user-company.repository.impl';

export const userCompanyRepository = new UserCompanyRepositoryImpl();
export const getUserRoleUseCase = new GetUserRoleUseCaseImpl(userCompanyRepository);
export const changeUserRoleUseCase = new ChangeUserRoleUseCaseImpl(userCompanyRepository);
