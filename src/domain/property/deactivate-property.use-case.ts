export interface DeactivatePropertyUseCase {
  execute(id: string): Promise<void>;
}
