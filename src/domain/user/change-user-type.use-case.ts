export interface ChangeUserTypeUseCase {
  execute(userId: string, userTypeId: string): Promise<void>;
}
