import type { CreateUserUseCase } from '@/domain/user/create-user.use-case';
import type { UserRepository } from '@/domain/user/user.repository';
import type { User, CreateUserData } from '@/domain/user/user.entity';

export class CreateUserUseCaseImpl implements CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(data: CreateUserData): Promise<User> {
    return this.userRepository.create(data);
  }
}
