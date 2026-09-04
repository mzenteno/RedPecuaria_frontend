import type { UpdateUserUseCase } from '@/domain/user/update-user.use-case';
import type { UserRepository } from '@/domain/user/user.repository';
import type { User, UpdateUserData } from '@/domain/user/user.entity';

export class UpdateUserUseCaseImpl implements UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, data: UpdateUserData): Promise<User> {
    return this.userRepository.update(id, data);
  }
}
