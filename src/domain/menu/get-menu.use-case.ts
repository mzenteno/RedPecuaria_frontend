import type { MenuTreeNode } from './menu.entity';

export interface GetMenuUseCase {
  execute(isSuperAdmin: boolean): Promise<MenuTreeNode[]>;
}
