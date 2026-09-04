import type { User, UpdateUserData } from './user.entity';

export interface UpdateUserUseCase {
  execute(id: string, data: UpdateUserData): Promise<User>;
}
