import type { ListUserOptionsUseCase } from '@/domain/user/list-user-options.use-case';
import type { UserRepository, ListUserOptionsParams } from '@/domain/user/user.repository';
import type { UserOption } from '@/domain/user/user.entity';

export class ListUserOptionsUseCaseImpl implements ListUserOptionsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(params?: ListUserOptionsParams): Promise<UserOption[]> {
    return this.userRepository.listOptions(params);
  }
}
