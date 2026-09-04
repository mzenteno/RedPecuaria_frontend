import type { CreateKardexEntryUseCase } from '@/domain/kardex/create-kardex-entry.use-case';
import type { KardexEntryRepository } from '@/domain/kardex/kardex-entry.repository';
import type { KardexEntry, CreateKardexEntryData } from '@/domain/kardex/kardex-entry.entity';

export class CreateKardexEntryUseCaseImpl implements CreateKardexEntryUseCase {
  constructor(private readonly kardexEntryRepository: KardexEntryRepository) {}

  async execute(data: CreateKardexEntryData): Promise<KardexEntry> {
    return this.kardexEntryRepository.create(data);
  }
}
