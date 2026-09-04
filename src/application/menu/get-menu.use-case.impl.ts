import type { GetMenuUseCase } from '@/domain/menu/get-menu.use-case';
import type { GetMenuItemsUseCase } from '@/domain/menu/get-menu-items.use-case';
import type { MenuItem, MenuTreeNode } from '@/domain/menu/menu.entity';

/**
 * Arma el árbol de navegación a partir del catálogo plano ya resuelto
 * (permisos reales del rol, o los 4 flags forzados a `true` si es Super
 * Administrador — eso ya lo resolvió `GetMenuItemsUseCase`). Un ítem se ve
 * si el rol tiene `canView`, o si es un padre puramente organizativo
 * (`path === null`) con al menos un hijo visible.
 *
 * `showInSidebar: false` (ej. `kardex`) excluye el ítem del árbol por
 * completo, sin importar `canView` — existe solo para permisos, nunca como
 * nodo de navegación (y por eso tampoco cuenta como "hijo" para decidir si
 * su padre se muestra como link o como carpeta colapsable, ver
 * `sidebar.tsx`).
 */
export class GetMenuUseCaseImpl implements GetMenuUseCase {
  constructor(private readonly getMenuItemsUseCase: GetMenuItemsUseCase) {}

  async execute(isSuperAdmin: boolean): Promise<MenuTreeNode[]> {
    const items = await this.getMenuItemsUseCase.execute(isSuperAdmin);
    return this.buildVisibleTree(items, null);
  }

  private buildVisibleTree(items: MenuItem[], parentId: string | null): MenuTreeNode[] {
    return items
      .filter((item) => item.parentId === parentId && item.showInSidebar)
      .sort((a, b) => a.order - b.order)
      .map((item) => ({ ...item, children: this.buildVisibleTree(items, item.id) }))
      .filter((node) => node.canView || (node.path === null && node.children.length > 0));
  }
}
