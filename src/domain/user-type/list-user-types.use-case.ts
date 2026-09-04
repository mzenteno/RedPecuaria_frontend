import type { UserType } from './user-type.entity';

export interface ListUserTypesUseCase {
  execute(): Promise<UserType[]>;
}
