import type {
  SetKardexInvestorFinishedData,
  SetKardexInvestorFinishedUseCase,
} from '@/domain/kardex/set-kardex-investor-finished.use-case';
import type { KardexEntryRepository } from '@/domain/kardex/kardex-entry.repository';

export class SetKardexInvestorFinishedUseCaseImpl implements SetKardexInvestorFinishedUseCase {
  constructor(private readonly kardexEntryRepository: KardexEntryRepository) {}

  async execute(data: SetKardexInvestorFinishedData): Promise<void> {
    await this.kardexEntryRepository.setInvestorFinished(data);
  }
}
