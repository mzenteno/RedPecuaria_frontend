import { CreateUserUseCaseImpl } from '@/application/user/create-user.use-case.impl';
import { UpdateUserUseCaseImpl } from '@/application/user/update-user.use-case.impl';
import { DeactivateUserUseCaseImpl } from '@/application/user/deactivate-user.use-case.impl';
import { ListUsersUseCaseImpl } from '@/application/user/list-users.use-case.impl';
import { ChangeUserTypeUseCaseImpl } from '@/application/user/change-user-type.use-case.impl';
import { UserRepositoryImpl } from '../repositories/user/user.repository.impl';

export const userRepository = new UserRepositoryImpl();
export const createUserUseCase = new CreateUserUseCaseImpl(userRepository);
export const updateUserUseCase = new UpdateUserUseCaseImpl(userRepository);
export const deactivateUserUseCase = new DeactivateUserUseCaseImpl(userRepository);
export const listUsersUseCase = new ListUsersUseCaseImpl(userRepository);
export const changeUserTypeUseCase = new ChangeUserTypeUseCaseImpl(userRepository);
