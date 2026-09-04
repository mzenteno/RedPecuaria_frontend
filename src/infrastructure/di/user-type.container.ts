import { ListUserTypesUseCaseImpl } from '@/application/user-type/list-user-types.use-case.impl';
import { UserTypeRepositoryImpl } from '../repositories/user-type/user-type.repository.impl';

export const userTypeRepository = new UserTypeRepositoryImpl();
export const listUserTypesUseCase = new ListUserTypesUseCaseImpl(userTypeRepository);
