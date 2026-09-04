import type { User, CreateUserData } from './user.entity';

export interface CreateUserUseCase {
  execute(data: CreateUserData): Promise<User>;
}
