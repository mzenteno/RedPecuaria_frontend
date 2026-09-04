import type { MenuItem } from './menu.entity';
import type { MenuCatalogItem } from './menu-catalog.entity';

export interface MenuRepository {
  /** `GET /me/menu` — catálogo completo, sin filtrar (ver get-menu.use-case). */
  getAuthorizedMenu(): Promise<MenuItem[]>;
  /** `GET /menus` — catálogo plano, sin permisos de nadie (ver pantalla de Permisos). */
  listCatalog(): Promise<MenuCatalogItem[]>;
}
