export interface DeactivateInvestmentUseCase {
  execute(id: string): Promise<void>;
}
