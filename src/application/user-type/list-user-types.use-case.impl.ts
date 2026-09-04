import type { ListUserTypesUseCase } from '@/domain/user-type/list-user-types.use-case';
import type { UserTypeRepository } from '@/domain/user-type/user-type.repository';
import type { UserType } from '@/domain/user-type/user-type.entity';

export class ListUserTypesUseCaseImpl implements ListUserTypesUseCase {
  constructor(private readonly userTypeRepository: UserTypeRepository) {}

  async execute(): Promise<UserType[]> {
    return this.userTypeRepository.list();
  }
}
