import { GetMenuUseCaseImpl } from '@/application/menu/get-menu.use-case.impl';
import { GetMenuItemsUseCaseImpl } from '@/application/menu/get-menu-items.use-case.impl';
import { ListMenuCatalogUseCaseImpl } from '@/application/menu/list-menu-catalog.use-case.impl';
import { MenuRepositoryImpl } from '../repositories/menu/menu.repository.impl';

export const menuRepository = new MenuRepositoryImpl();
export const getMenuItemsUseCase = new GetMenuItemsUseCaseImpl(menuRepository);
export const getMenuUseCase = new GetMenuUseCaseImpl(getMenuItemsUseCase);
export const listMenuCatalogUseCase = new ListMenuCatalogUseCaseImpl(menuRepository);
