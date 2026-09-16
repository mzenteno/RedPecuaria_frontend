import { CreateKardexEntryUseCaseImpl } from '@/application/kardex/create-kardex-entry.use-case.impl';
import { UpdateKardexEntryUseCaseImpl } from '@/application/kardex/update-kardex-entry.use-case.impl';
import { DeactivateKardexEntryUseCaseImpl } from '@/application/kardex/deactivate-kardex-entry.use-case.impl';
import { ListKardexEntriesByInvestmentUseCaseImpl } from '@/application/kardex/list-kardex-entries-by-investment.use-case.impl';
import { GetKardexEntryByIdUseCaseImpl } from '@/application/kardex/get-kardex-entry-by-id.use-case.impl';
import { KardexEntryRepositoryImpl } from '../repositories/kardex/kardex-entry.repository.impl';

export const kardexEntryRepository = new KardexEntryRepositoryImpl();
export const createKardexEntryUseCase = new CreateKardexEntryUseCaseImpl(kardexEntryRepository);
export const updateKardexEntryUseCase = new UpdateKardexEntryUseCaseImpl(kardexEntryRepository);
export const deactivateKardexEntryUseCase = new DeactivateKardexEntryUseCaseImpl(kardexEntryRepository);
export const listKardexEntriesByInvestmentUseCase = new ListKardexEntriesByInvestmentUseCaseImpl(
  kardexEntryRepository,
);
export const getKardexEntryByIdUseCase = new GetKardexEntryByIdUseCaseImpl(kardexEntryRepository);
