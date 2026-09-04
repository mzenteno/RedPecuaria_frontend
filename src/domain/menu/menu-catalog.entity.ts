/** Catálogo plano de menús, sin permisos de nadie (`GET /menus`) — a
 * diferencia de `MenuItem` (`GET /me/menu`), que además trae los `can*` del
 * rol de quien pregunta. Lo usa la pantalla de Permisos para saber qué
 * menús existen, independientemente de a quién se le estén asignando
 * permisos. */
export interface MenuCatalogItem {
  id: string;
  key: string;
  label: string;
  icon: string | null;
  path: string | null;
  parentId: string | null;
  order: number;
  showInSidebar: boolean;
}
