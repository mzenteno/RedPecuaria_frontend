import type { DeactivateUserUseCase } from '@/domain/user/deactivate-user.use-case';
import type { UserRepository } from '@/domain/user/user.repository';

export class DeactivateUserUseCaseImpl implements DeactivateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    await this.userRepository.deactivate(id);
  }
}
