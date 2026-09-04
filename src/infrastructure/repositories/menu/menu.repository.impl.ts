import type { MenuRepository } from '@/domain/menu/menu.repository';
import type { MenuItem } from '@/domain/menu/menu.entity';
import type { MenuCatalogItem } from '@/domain/menu/menu-catalog.entity';
import { httpClient } from '../../http/http-client';

export class MenuRepositoryImpl implements MenuRepository {
  async getAuthorizedMenu(): Promise<MenuItem[]> {
    return httpClient.get<MenuItem[]>('/me/menu');
  }

  async listCatalog(): Promise<MenuCatalogItem[]> {
    return httpClient.get<MenuCatalogItem[]>('/menus');
  }
}
