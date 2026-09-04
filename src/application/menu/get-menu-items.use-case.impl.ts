import type { GetMenuItemsUseCase } from '@/domain/menu/get-menu-items.use-case';
import type { MenuRepository } from '@/domain/menu/menu.repository';
import type { MenuItem } from '@/domain/menu/menu.entity';
import { applySuperAdminOverride } from './apply-super-admin-override';

export class GetMenuItemsUseCaseImpl implements GetMenuItemsUseCase {
  constructor(private readonly menuRepository: MenuRepository) {}

  async execute(isSuperAdmin: boolean): Promise<MenuItem[]> {
    const items = await this.menuRepository.getAuthorizedMenu();
    return applySuperAdminOverride(items, isSuperAdmin);
  }
}
