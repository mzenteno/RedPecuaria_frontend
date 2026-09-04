import { LoginUseCaseImpl } from '@/application/auth/login.use-case.impl';
import { SwitchCompanyUseCaseImpl } from '@/application/auth/switch-company.use-case.impl';
import { AuthRepositoryImpl } from '../repositories/auth/auth.repository.impl';

/** Composition root: instancia concreta ↔ interfaz, una sola vez, acá. */
export const authRepository = new AuthRepositoryImpl();
export const loginUseCase = new LoginUseCaseImpl(authRepository);
export const switchCompanyUseCase = new SwitchCompanyUseCaseImpl(authRepository);
