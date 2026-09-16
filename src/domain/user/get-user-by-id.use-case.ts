import type { User } from './user.entity';

export interface GetUserByIdUseCase {
  execute(id: string): Promise<User>;
}
