import type { ListMenuCatalogUseCase } from '@/domain/menu/list-menu-catalog.use-case';
import type { MenuRepository } from '@/domain/menu/menu.repository';
import type { MenuCatalogItem } from '@/domain/menu/menu-catalog.entity';

export class ListMenuCatalogUseCaseImpl implements ListMenuCatalogUseCase {
  constructor(private readonly menuRepository: MenuRepository) {}

  async execute(): Promise<MenuCatalogItem[]> {
    return this.menuRepository.listCatalog();
  }
}
