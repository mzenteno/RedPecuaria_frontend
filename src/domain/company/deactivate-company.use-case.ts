export interface DeactivateCompanyUseCase {
  execute(id: string): Promise<void>;
}
