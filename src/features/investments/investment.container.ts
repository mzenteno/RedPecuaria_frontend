import { InvestmentRepositoryImpl } from './investment.repository.impl';
import { InvestmentTypeRepositoryImpl } from './investment-type.repository.impl';

/** Sin casos de uso que armar acá (a diferencia de otros containers más
 * viejos del proyecto) — ver el comentario en `investment.repository.ts`
 * sobre por qué esta feature no los necesita. Si el día de mañana aparece
 * uno real (con orquestación propia), se instancia acá mismo, pasándole
 * `investmentRepository`. */
export const investmentRepository = new InvestmentRepositoryImpl();
export const investmentTypeRepository = new InvestmentTypeRepositoryImpl();
