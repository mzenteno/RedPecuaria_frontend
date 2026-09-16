import type { GetKardexEntryByIdUseCase } from '@/domain/kardex/get-kardex-entry-by-id.use-case';
import type { KardexEntryRepository } from '@/domain/kardex/kardex-entry.repository';
import type { KardexEntry } from '@/domain/kardex/kardex-entry.entity';

export class GetKardexEntryByIdUseCaseImpl implements GetKardexEntryByIdUseCase {
  constructor(private readonly kardexEntryRepository: KardexEntryRepository) {}

  async execute(id: string): Promise<KardexEntry> {
    return this.kardexEntryRepository.getById(id);
  }
}
