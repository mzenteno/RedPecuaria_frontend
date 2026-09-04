export interface DeactivateRoleUseCase {
  execute(id: string): Promise<void>;
}
