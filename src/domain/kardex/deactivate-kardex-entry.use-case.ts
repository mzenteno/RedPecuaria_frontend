export interface DeactivateKardexEntryUseCase {
  execute(id: string): Promise<void>;
}
