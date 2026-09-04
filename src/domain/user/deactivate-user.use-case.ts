export interface DeactivateUserUseCase {
  execute(id: string): Promise<void>;
}
