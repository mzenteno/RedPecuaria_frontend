import type { UserTypeRepository } from '@/domain/user-type/user-type.repository';
import type { UserType } from '@/domain/user-type/user-type.entity';
import { httpClient } from '../../http/http-client';

export class UserTypeRepositoryImpl implements UserTypeRepository {
  async list(): Promise<UserType[]> {
    return httpClient.get<UserType[]>('/user-types');
  }
}
