import type { ChangeOwnPasswordUseCase } from '@/domain/user/change-own-password.use-case';
import type { UserRepository } from '@/domain/user/user.repository';
import type { ChangePasswordData } from '@/domain/user/user.entity';

export class ChangeOwnPasswordUseCaseImpl implements ChangeOwnPasswordUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(data: ChangePasswordData): Promise<void> {
    await this.userRepository.changeOwnPassword(data);
  }
}
