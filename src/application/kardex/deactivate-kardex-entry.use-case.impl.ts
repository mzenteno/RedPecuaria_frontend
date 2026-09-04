import type { DeactivateKardexEntryUseCase } from '@/domain/kardex/deactivate-kardex-entry.use-case';
import type { KardexEntryRepository } from '@/domain/kardex/kardex-entry.repository';

export class DeactivateKardexEntryUseCaseImpl implements DeactivateKardexEntryUseCase {
  constructor(private readonly kardexEntryRepository: KardexEntryRepository) {}

  async execute(id: string): Promise<void> {
    await this.kardexEntryRepository.deactivate(id);
  }
}
