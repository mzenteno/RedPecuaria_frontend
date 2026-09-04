import type { MenuCatalogItem } from './menu-catalog.entity';

export interface ListMenuCatalogUseCase {
  execute(): Promise<MenuCatalogItem[]>;
}
