import type { GetUserByIdUseCase } from '@/domain/user/get-user-by-id.use-case';
import type { UserRepository } from '@/domain/user/user.repository';
import type { User } from '@/domain/user/user.entity';

export class GetUserByIdUseCaseImpl implements GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<User> {
    return this.userRepository.getById(id);
  }
}
