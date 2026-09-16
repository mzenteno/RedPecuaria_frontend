import type { ListUserOptionsParams } from './user.repository';
import type { UserOption } from './user.entity';

export interface ListUserOptionsUseCase {
  execute(params?: ListUserOptionsParams): Promise<UserOption[]>;
}
