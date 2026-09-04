import type { ChangeUserTypeUseCase } from '@/domain/user/change-user-type.use-case';
import type { UserRepository } from '@/domain/user/user.repository';

export class ChangeUserTypeUseCaseImpl implements ChangeUserTypeUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, userTypeId: string): Promise<void> {
    await this.userRepository.changeUserType(userId, userTypeId);
  }
}
