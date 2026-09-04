/** Forma cruda que devuelve `GET /me/menu` — catálogo completo + permisos del rol. */
export interface MenuItem {
  id: string;
  key: string;
  label: string;
  icon: string | null;
  path: string | null;
  parentId: string | null;
  order: number;
  /** `false` para un menú que existe solo como permiso (ej. `kardex`, un
   * drill-down sin entrada propia en el sidebar) — lo filtra el árbol de
   * navegación, ver `get-menu.use-case.impl.ts`. */
  showInSidebar: boolean;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

/** Árbol ya armado — con los padres puramente organizativos ya resueltos. */
export interface MenuTreeNode extends MenuItem {
  children: MenuTreeNode[];
}
