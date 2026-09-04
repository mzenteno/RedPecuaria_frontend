import type { UpdateKardexEntryUseCase } from '@/domain/kardex/update-kardex-entry.use-case';
import type { KardexEntryRepository } from '@/domain/kardex/kardex-entry.repository';
import type { KardexEntry, UpdateKardexEntryData } from '@/domain/kardex/kardex-entry.entity';

export class UpdateKardexEntryUseCaseImpl implements UpdateKardexEntryUseCase {
  constructor(private readonly kardexEntryRepository: KardexEntryRepository) {}

  async execute(id: string, data: UpdateKardexEntryData): Promise<KardexEntry> {
    return this.kardexEntryRepository.update(id, data);
  }
}
