import type { ChangePasswordData } from './user.entity';

export interface ChangeOwnPasswordUseCase {
  execute(data: ChangePasswordData): Promise<void>;
}
