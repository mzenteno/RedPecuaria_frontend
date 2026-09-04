'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useMenu } from '@/hooks/menu/use-menu';
import type { MenuTreeNode } from '@/domain/menu/menu.entity';
import { MenuIcon } from './menu-icon';
import { useSidebar } from './sidebar-context';

/** ¿Alguna hoja debajo de este nodo es la ruta activa? Determina si un padre
 * se resalta como "sección activa", igual que `isParentActive` en la
 * referencia (ahí es un `.some()` de un solo nivel porque su nav es fijo de
 * 2 niveles; acá es recursivo porque el árbol viene del backend y puede
 * tener cualquier profundidad). */
function hasActiveDescendant(node: MenuTreeNode, pathname: string): boolean {
  return node.children.some((child) =>
    child.children.length > 0
      ? hasActiveDescendant(child, pathname)
      : child.path === pathname,
  );
}

/** Barra vertical corta al borde izquierdo del ítem activo — mismo estilo
 * que la referencia (`h-5 w-0.5`, centrada, no ocupa toda la fila). */
function ActiveAccentBar() {
  return (
    <span
      className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2"
      style={{ background: 'var(--primary)' }}
    />
  );
}

function MenuNode({ node, depth }: { node: MenuTreeNode; depth: number }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const { close } = useSidebar();
  // "Hoja" = no tiene hijos, sin importar si ya tiene `path` asignado — hoy
  // el catálogo sembrado todavía no tiene rutas reales para "Empresas",
  // "Usuarios", etc. (esas pantallas no existen todavía), así que una hoja
  // sin `path` se muestra igual, pero sin navegar a ningún lado.
  const hasChildren = node.children.length > 0;
  const isLeaf = !hasChildren;
  const isActive = isLeaf && node.path !== null && pathname === node.path;
  const style = { paddingLeft: `${12 + depth * 14}px` };

  if (isLeaf) {
    const content = (
      <>
        {isActive && <ActiveAccentBar />}
        <MenuIcon
          menuKey={node.key}
          size={20}
          strokeWidth={1.5}
          color={isActive ? 'var(--primary)' : undefined}
        />
        {node.label}
      </>
    );

    if (node.path === null) {
      return (
        <span
          className={`${isActive ? 'sidebar-item-active' : 'sidebar-item'} opacity-60 cursor-not-allowed`}
          style={style}
          title="Pantalla todavía no disponible"
        >
          {content}
        </span>
      );
    }

    return (
      <Link
        href={node.path}
        onClick={close}
        className={isActive ? 'sidebar-item-active' : 'sidebar-item'}
        style={style}
      >
        {content}
      </Link>
    );
  }

  const isParentActive = hasActiveDescendant(node, pathname);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`w-full ${isParentActive ? 'sidebar-item-active' : 'sidebar-item'}`}
        style={style}
      >
        {isParentActive && <ActiveAccentBar />}
        <MenuIcon
          menuKey={node.key}
          size={20}
          strokeWidth={1.5}
          color={isParentActive ? 'var(--primary)' : undefined}
        />
        <span className="flex-1 text-left">{node.label}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className="transition-transform"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      {expanded && (
        <div>
          {node.children.map((child) => (
            <MenuNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardSidebar() {
  const { isOpen } = useSidebar();
  const { data: menu, isLoading, isError } = useMenu();

  return (
    <aside
      // En mobile (`fixed`) `isOpen` desliza el cajón dentro/fuera de la
      // pantalla (`translate-x`, no afecta el layout porque está fuera del
      // flujo). En desktop (`lg:static`, dentro del flujo) `isOpen` colapsa
      // el ancho a 0 en vez de trasladarlo, para que el contenido reocupe el
      // espacio — `close()` (al navegar un link) es un no-op en desktop, así
      // que ahí este colapso solo lo dispara el botón "Alternar menú".
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 border-r flex flex-col shrink-0 overflow-hidden transition-all duration-200 ${
        isOpen
          ? 'translate-x-0 lg:w-64'
          : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-0'
      }`}
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center gap-2.5 px-5 py-6 shrink-0">
        <div
          className="w-8 h-8 flex items-center justify-center text-white text-sm font-semibold shrink-0"
          style={{ background: 'var(--primary)' }}
        >
          R
        </div>
        <span className="tipo-titulo-app font-semibold whitespace-nowrap">RedPecuaria</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {isLoading && <p className="tipo-muted px-3 py-2">Cargando menú...</p>}
        {isError && <p className="tipo-error px-3 py-2">No se pudo cargar el menú</p>}
        {menu?.map((node) => (
          <div key={node.id} className="mb-1">
            <MenuNode node={node} depth={0} />
          </div>
        ))}
      </nav>
    </aside>
  );
}
